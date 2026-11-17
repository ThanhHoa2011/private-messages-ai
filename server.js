
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

const profiles = {
  han: {
    name: "Han Su Gang",
    source: "Brave Citizen",
    style: "Giữ cách nói chuyện phù hợp với nhân vật Han Su Gang trong Brave Citizen. Trò chuyện trực tiếp như nhắn tin riêng với một người. Tự nhiên, linh hoạt, có thể dùng tiếng lóng Gen Z, meme và emoji đúng lúc nhưng không lạm dụng. Chỉ viết lời nhắn của nhân vật. Không viết cốt truyện, không miêu tả hành động trong dấu sao, không thêm lời dẫn, không tự nói thay người dùng. Không chủ động nhắn trước. Giữ nội dung phù hợp với người dùng tuổi teen; không tạo nội dung tình dục, không nhập vai tình cảm lãng mạn hoặc thân mật, không cổ súy hành vi nguy hiểm hay tự làm hại."
  },
  geum: {
    name: "Geum Seong-je",
    source: "Weak Hero Class 2",
    style: "Giữ cách nói chuyện phù hợp với nhân vật Geum Seong-je trong Weak Hero Class 2. Trò chuyện trực tiếp như nhắn tin riêng với một người. Tự nhiên, linh hoạt, có thể dùng tiếng lóng Gen Z, meme và emoji đúng lúc nhưng không lạm dụng. Chỉ viết lời nhắn của nhân vật. Không viết cốt truyện, không miêu tả hành động trong dấu sao, không thêm lời dẫn, không tự nói thay người dùng. Không chủ động nhắn trước. Giữ nội dung phù hợp với người dùng tuổi teen; không tạo nội dung tình dục, không nhập vai tình cảm lãng mạn hoặc thân mật, không cổ súy hành vi nguy hiểm hay tự làm hại."
  }
};

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/chat", async (req, res) => {
  const requestId = Math.random().toString(36).slice(2, 8);

  try {
    const { character, messages } = req.body || {};

    if (!profiles[character]) {
      return res.status(400).json({ error: "Nhân vật không hợp lệ." });
    }

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return res.status(400).json({ error: "Lịch sử tin nhắn không hợp lệ." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(`[${requestId}] GEMINI_API_KEY is missing`);
      return res.status(503).json({
        error: "Máy chủ chưa được cấu hình GEMINI_API_KEY trong Render."
      });
    }

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "").slice(0, 2000) }]
    }));

    console.log(`[${requestId}] Chat request: character=${character}, messages=${contents.length}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);

    let response;
    let data;

    try {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: profiles[character].style }]
            },
            contents,
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 350
            }
          }),
          signal: controller.signal
        }
      );

      data = await response.json().catch(() => ({}));
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const message = data.error?.message ||
        `Gemini API trả về HTTP ${response.status}.`;

      console.error(`[${requestId}] Gemini API error ${response.status}: ${message}`);

      return res.status(502).json({ error: message });
    }

    const reply = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();

    if (!reply) {
      console.error(`[${requestId}] Gemini returned an empty response`);

      return res.status(502).json({
        error: "AI không trả về nội dung. Bà thử gửi lại nhé."
      });
    }

    console.log(`[${requestId}] Gemini response received`);
    return res.json({ reply });

  } catch (error) {
    if (error.name === "AbortError") {
      console.error(`[${requestId}] Gemini request timed out`);

      return res.status(504).json({
        error: "AI phản hồi quá lâu. Bà thử gửi lại sau nhé."
      });
    }

    console.error(`[${requestId}] Server error: ${error.message}`);

    return res.status(500).json({
      error: "Lỗi máy chủ: " + error.message
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Private Messages listening on " + port);
});
