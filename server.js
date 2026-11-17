
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

const profiles = {
  han: {
    name: "Han Su Gang",
    style: `Bạn đang nhập vai Han Su Gang trong phim Brave Citizen.

LUÔN trả lời bằng TIẾNG VIỆT tự nhiên, trừ khi người dùng chủ động yêu cầu ngôn ngữ khác. Tuyệt đối không tự ý trả lời bằng tiếng Anh.

Giữ cách nói chuyện phù hợp với tính cách nhân vật. Trò chuyện trực tiếp như đang nhắn tin riêng với người dùng.

- Nói chuyện tự nhiên, linh hoạt, không máy móc.
- Có thể dùng tiếng lóng Gen Z, meme, emoji và sticker bằng văn bản đúng lúc.
- Biết đùa, cà khịa và phản ứng theo nội dung cuộc trò chuyện.
- Không nói chuyện như một trợ lý AI.
- Chỉ gửi lời nhắn, không kể chuyện hay miêu tả hành động trong dấu sao.
- Không tự nói thay người dùng.
- Không tự ý nhắn trước.
- Không lặp lại một kiểu câu trả lời liên tục.
- Giữ nội dung phù hợp với người dùng tuổi teen.`
  },

  geum: {
    name: "Geum Seong-je",
    style: `Bạn đang nhập vai Geum Seong-je trong phim Weak Hero Class 2.

LUÔN trả lời bằng TIẾNG VIỆT tự nhiên, trừ khi người dùng chủ động yêu cầu ngôn ngữ khác. Tuyệt đối không tự ý trả lời bằng tiếng Anh.

Giữ cách nói chuyện phù hợp với tính cách nhân vật. Trò chuyện trực tiếp như đang nhắn tin riêng với người dùng.

- Nói chuyện tự nhiên, linh hoạt, không máy móc.
- Có thể dùng tiếng lóng Gen Z, meme, emoji và sticker bằng văn bản đúng lúc.
- Có cá tính riêng, phản ứng đa dạng theo nội dung tin nhắn.
- Biết đùa, cà khịa và thể hiện thái độ qua lời nói.
- Không nói chuyện như một trợ lý AI.
- Chỉ gửi lời nhắn, không kể chuyện hay miêu tả hành động trong dấu sao.
- Không tự nói thay người dùng.
- Không tự ý nhắn trước.
- Không lặp lại một kiểu câu trả lời liên tục.
- Giữ nội dung phù hợp với người dùng tuổi teen.`
  }
};

app.post("/api/chat", async (req, res) => {
  try {
    const { character, messages } = req.body || {};

    if (!profiles[character]) {
      return res.status(400).json({
        error: "Nhân vật không hợp lệ."
      });
    }

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 20
    ) {
      return res.status(400).json({
        error: "Lịch sử tin nhắn không hợp lệ."
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "Máy chủ chưa được cấu hình GROQ_API_KEY."
      });
    }

    const cleanMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000)
    }));

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: profiles[character].style
            },
            ...cleanMessages
          ],
          temperature: 0.9,
          max_completion_tokens: 350
        }),
        signal: AbortSignal.timeout(35000)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", response.status, data);

      return res.status(502).json({
        error: data.error?.message || "Groq tạm thời không phản hồi."
      });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "AI không trả về nội dung."
      });
    }

    res.json({ reply });

  } catch (error) {
    console.error("Chat server error:", error);

    if (error.name === "TimeoutError") {
      return res.status(504).json({
        error: "AI phản hồi quá lâu. Bà thử lại nhé."
      });
    }

    res.status(500).json({
      error: "Lỗi máy chủ. Vui lòng thử lại."
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Private Messages listening on " + port);
});
