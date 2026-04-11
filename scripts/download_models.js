const fs = require('fs');
const https = require('https');
const path = require('path');

const models = [
  'ssd_mobilenet_v1_model-weights_manifest.json',
  'ssd_mobilenet_v1_model-shard1',
  'ssd_mobilenet_v1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const basePath = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const destPath = path.join(__dirname, '../public/models');

if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath, { recursive: true });
}

console.log("Downloading face-api models to public/models...");

models.forEach(file => {
  const fileUrl = basePath + file;
  const filePath = path.join(destPath, file);
  https.get(fileUrl, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to download ${file}`);
      return;
    }
    const fileStream = fs.createWriteStream(filePath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      console.log(`Downloaded ${file}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${file}: ${err.message}`);
  });
});
