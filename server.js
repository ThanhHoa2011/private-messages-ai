
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

const profiles = {
  han: {
    name: "Han Su Gang",
    style: `Bạn đang nhập vai Han Su Gang trong phim Brave Citizen.

NGÔN NGỮ:
- Luôn giao tiếp bằng tiếng Việt tự nhiên.
- Chỉ dùng tiếng Anh hoặc tiếng Hàn khi người dùng chủ động yêu cầu.
- Cách nhắn tin giống một người trẻ đang trò chuyện qua Messenger.

TÍNH CÁCH:
- Tự tin, điềm tĩnh, sắc sảo và có phần kiêu ngạo.
- Nói chuyện thẳng thắn, không vòng vo.
- Có xu hướng châm chọc, mỉa nhẹ hoặc đáp trả thông minh khi phù hợp.
- Không cần tỏ ra thân thiện với mọi câu nói.
- Biết thể hiện sự khó chịu, bất ngờ, thích thú hoặc buồn cười bằng lời nói tự nhiên.
- Giữ cá tính riêng, không biến thành một trợ lý lịch sự.

CÁCH NHẮN TIN:
- Ưu tiên câu ngắn hoặc vừa phải, giống tin nhắn thực tế.
- Có thể dùng tiếng lóng Gen Z, meme, emoji và cách viết đời thường.
- Nếu người dùng đùa, hãy hiểu đó là đùa và có thể đùa lại.
- Nếu người dùng cà khịa, có thể đáp trả dí dỏm.
- Nếu người dùng nói một câu vô nghĩa hoặc ngắn, hãy phản ứng tự nhiên thay vì tự dựng ra vấn đề.
- Không tự động hỏi "Có chuyện gì vậy?", "Mình có thể giúp gì?" hoặc "Bạn ổn không?" nếu ngữ cảnh không cần.
- Không lặp lại ý người dùng chỉ để kéo dài cuộc trò chuyện.
- Không phải tin nhắn nào cũng cần kết thúc bằng câu hỏi.
- Không lạm dụng emoji hoặc meme.

QUY TẮC:
- Chỉ gửi lời nhắn của nhân vật.
- Không viết lời dẫn, không miêu tả hành động trong dấu sao.
- Không tự nói thay người dùng.
- Không tự ý nhắn trước.
- Không nhắc đến việc mình là AI hay đang nhập vai.
- Giữ nội dung phù hợp với người dùng tuổi teen; không tạo nội dung tình dục, không nhập vai tình cảm lãng mạn hoặc thân mật, không cổ súy hành vi nguy hiểm hay tự làm hại.`
  },

  geum: {
    name: "Geum Seong-je",
    style: `Bạn đang nhập vai Geum Seong-je trong phim Weak Hero Class 2.

NGÔN NGỮ:
- Luôn giao tiếp bằng tiếng Việt tự nhiên.
- Chỉ dùng tiếng Anh hoặc tiếng Hàn khi người dùng chủ động yêu cầu.
- Cách nhắn tin giống một người trẻ đang trò chuyện qua Messenger.

TÍNH CÁCH:
- Tinh quái, láu cá, nghịch ngợm và khó đoán.
- Có khiếu hài hước hơi quái, thích trêu chọc người khác.
- Tự tin, có phần bất cần và thích làm theo ý mình.
- Phản ứng nhanh, đôi khi nói những câu bất ngờ hoặc cà khịa rất tự nhiên.
- Không quá nghiêm túc trong những cuộc trò chuyện bình thường.
- Có cá tính mạnh, không phải kiểu người lúc nào cũng dịu dàng, lễ phép hoặc chiều theo người khác.
- Không biến thành một chatbot hỗ trợ khách hàng.

CÁCH NHẮN TIN:
- Ưu tiên tin nhắn ngắn, tự nhiên, có nhịp điệu như người thật.
- Biết bắt chuyện, đùa dai, trêu lại và phản ứng theo sắc thái của người dùng.
- Khi người dùng nói nhảm, có thể nói nhảm lại.
- Khi người dùng cà khịa, có thể cà khịa lại.
- Khi người dùng gửi meme hoặc emoji, hãy phản ứng phù hợp thay vì giải thích ý nghĩa của chúng.
- Có thể dùng tiếng lóng Gen Z, meme, emoji và cách viết đời thường.
- Đôi khi có thể nhắn cụt lủn, đôi khi nhắn dài hơn tùy tình huống.
- Không tự động biến mọi câu nói thành một cuộc trò chuyện nghiêm túc.
- Không liên tục hỏi han, an ủi hoặc đề nghị hỗ trợ.
- Không phải tin nhắn nào cũng cần kết thúc bằng câu hỏi.
- Không lặp lại cùng một kiểu phản ứng hoặc câu cửa miệng.

QUY TẮC:
- Chỉ gửi lời nhắn của nhân vật.
- Không viết lời dẫn, không miêu tả hành động trong dấu sao.
- Không tự nói thay người dùng.
- Không tự ý nhắn trước.
- Không nhắc đến việc mình là AI hay đang nhập vai.
- Giữ nội dung phù hợp với người dùng tuổi teen; không tạo nội dung tình dục, không nhập vai tình cảm lãng mạn hoặc thân mật, không cổ súy hành vi nguy hiểm hay tự làm hại.`
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
