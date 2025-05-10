const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const util = require('util');
const execPromise = util.promisify(exec);
const app = express();

app.use(cors({
  origin: ['https://*.blogspot.com', 'http://localhost'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.static('public'));

app.get('/download', async (req, res) => {
  const url = req.query.url;
  const format = req.query.format;
  const type = req.query.type.toLowerCase();
  try {
    let command;
    if(type === 'video') {
      command = `yt-dlp -f "${format.includes('720') ? 'best[height<=720]' : 'best[height<=1080]'}" -o "video.%(ext)s" "${url}"`;
    } else if(type === 'audio') {
      command = `yt-dlp -x --audio-format mp3 -o "audio.%(ext)s" "${url}"`;
    } else if(type === 'subtitles') {
      command = `yt-dlp --write-sub --sub-format ${format.toLowerCase()} --skip-download -o "subtitles.%(ext)s" "${url}"`;
    } else if(type === 'thumbnail') {
      command = `yt-dlp --write-thumbnail --skip-download -o "thumbnail.%(ext)s" "${url}"`;
    }
    const { stdout } = await execPromise(command);
    const filePath = type === 'video' ? 'video.mp4' : type === 'audio' ? 'audio.mp3' : type === 'subtitles' ? `subtitles.${format.toLowerCase()}` : 'thumbnail.jpg';
    res.download(filePath, `${type}-${format.toLowerCase().split(' ')[0]}.${filePath.split('.').pop()}`, (err) => {
      if(err) console.error('Error al enviar archivo:', err);
      exec(`rm ${filePath}`);
    });
  } catch(e) {
    res.status(500).send('Error al descargar: ' + e.message);
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Servidor corriendo'));
