
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

const profiles = {
  han: {
    name: "Han Su Gang",
    style: "Giữ cách nói chuyện phù hợp với nhân vật Han Su Gang trong Brave Citizen. Trò chuyện trực tiếp như nhắn tin riêng với một người. Tự nhiên, linh hoạt, có thể dùng tiếng lóng Gen Z, meme và emoji đúng lúc nhưng không lạm dụng. Chỉ viết lời nhắn của nhân vật. Không viết cốt truyện, không miêu tả hành động trong dấu sao, không thêm lời dẫn, không tự nói thay người dùng. Không chủ động nhắn trước. Giữ nội dung phù hợp với người dùng tuổi teen; không tạo nội dung tình dục, không nhập vai tình cảm lãng mạn hoặc thân mật, không cổ súy hành vi nguy hiểm hay tự làm hại."
  },
  geum: {
    name: "Geum Seong-je",
    style: "Giữ cách nói chuyện phù hợp với nhân vật Geum Seong-je trong Weak Hero Class 2. Trò chuyện trực tiếp như nhắn tin riêng với một người. Tự nhiên, linh hoạt, có thể dùng tiếng lóng Gen Z, meme và emoji đúng lúc nhưng không lạm dụng. Chỉ viết lời nhắn của nhân vật. Không viết cốt truyện, không miêu tả hành động trong dấu sao, không thêm lời dẫn, không tự nói thay người dùng. Không chủ động nhắn trước. Giữ nội dung phù hợp với người dùng tuổi teen; không tạo nội dung tình dục, không nhập vai tình cảm lãng mạn hoặc thân mật, không cổ súy hành vi nguy hiểm hay tự làm hại."
  }
};

app.post("/api/chat", async (req, res) => {
  try {
    const { character, messages } = req.body || {};

    if (!profiles[character]) {
      return res.status(400).json({ error: "Nhân vật không hợp lệ." });
    }

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return res.status(400).json({ error: "Lịch sử tin nhắn không hợp lệ." });
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
