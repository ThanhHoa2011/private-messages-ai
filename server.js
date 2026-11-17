const express = require("express");
const path = require("path");
const app = express();
app.use(express.json({limit:"30kb"}));
app.use(express.static(path.join(__dirname,"public")));

const profiles = {
  han: {
    name: "Han Su Gang",
    source: "Brave Citizen",
    style: "Giữ cách nói chuyện phù hợp với nhân vật Han Su Gang trong Brave Citizen. Trò chuyện trực tiếp như nhắn tin riêng với một người. Tự nhiên, linh hoạt, có thể dùng tiếng lóng Gen Z, meme và emoji đúng lúc nhưng không lạm dụng. Chỉ viết lời nhắn của nhân vật. TUYỆT ĐỐI không viết cốt truyện, không miêu tả hành động trong dấu sao, không thêm lời dẫn, không tự nói thay người dùng. Không chủ động nhắn trước. Giữ nội dung phù hợp với người dùng tuổi teen; không tạo nội dung tình dục, không nhập vai tình cảm lãng mạn hoặc thân mật, không cổ súy hành vi nguy hiểm hay tự làm hại."
  },
  geum: {
    name: "Geum Seong-je",
    source: "Weak Hero Class 2",
    style: "Giữ cách nói chuyện phù hợp với nhân vật Geum Seong-je trong Weak Hero Class 2. Trò chuyện trực tiếp như nhắn tin riêng với một người. Tự nhiên, linh hoạt, có thể dùng tiếng lóng Gen Z, meme và emoji đúng lúc nhưng không lạm dụng. Chỉ viết lời nhắn của nhân vật. TUYỆT ĐỐI không viết cốt truyện, không miêu tả hành động trong dấu sao, không thêm lời dẫn, không tự nói thay người dùng. Không chủ động nhắn trước. Giữ nội dung phù hợp với người dùng tuổi teen; không tạo nội dung tình dục, không nhập vai tình cảm lãng mạn hoặc thân mật, không cổ súy hành vi nguy hiểm hay tự làm hại."
  }
};

app.post("/api/chat", async (req,res) => {
  try {
    const {character,messages}=req.body||{};
    if(!profiles[character]) return res.status(400).json({error:"Nhân vật không hợp lệ."});
    if(!Array.isArray(messages)||messages.length===0||messages.length>20) return res.status(400).json({error:"Lịch sử tin nhắn không hợp lệ."});
    const clean=messages.map(m=>({role:m.role==="assistant"?"assistant":"user",content:String(m.content||"").slice(0,2000)}));
    const apiKey=process.env.GEMINI_API_KEY;
    if(!apiKey) return res.status(503).json({error:"Máy chủ chưa được cấu hình GEMINI_API_KEY."});
    const system=profiles[character].style;
    const contents=[];
    for(const m of clean) contents.push({role:m.role==="assistant"?"model":"user",parts:[{text:m.content}]});
    const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",{
      method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},
      body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents,generationConfig:{temperature:0.9,maxOutputTokens:350}})
    });
    const data=await r.json();
    if(!r.ok) return res.status(502).json({error:data.error?.message||"Dịch vụ AI tạm thời không phản hồi."});
    const reply=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("").trim();
    if(!reply) return res.status(502).json({error:"AI không trả về nội dung."});
    res.json({reply});
  } catch(e){res.status(500).json({error:"Lỗi máy chủ. Vui lòng thử lại."});}
});
const port=process.env.PORT||3000;
app.listen(port,()=>console.log("Private Messages listening on "+port));
