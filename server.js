const express = require('express');
const ytdl = require('yt-dlp-exec');
const cors = require('cors');
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
    let outputFile;
    let options = { output: '' };

    if(type === 'video') {
      outputFile = `video.mp4`;
      options = {
        output: outputFile,
        format: format.includes('720') ? 'best[height<=720]' : 'best[height<=1080]'
      };
    } else if(type === 'audio') {
      outputFile = `audio.mp3`;
      options = {
        output: outputFile,
        extractAudio: true,
        audioFormat: 'mp3'
      };
    } else if(type === 'subtitles') {
      outputFile = `subtitles.${format.toLowerCase()}`;
      options = {
        output: outputFile,
        writeSub: true,
        subFormat: format.toLowerCase(),
        skipDownload: true
      };
    } else if(type === 'thumbnail') {
      outputFile = `thumbnail.jpg`;
      options = {
        output: outputFile,
        writeThumbnail: true,
        skipDownload: true
      };
    }

    await ytdl(url, options);
    res.download(outputFile, `${type}-${format.toLowerCase().split(' ')[0]}.${outputFile.split('.').pop()}`, (err) => {
      if(err) console.error('Error al enviar archivo:', err);
      require('fs').unlinkSync(outputFile); // Limpieza
    });
  } catch(e) {
    res.status(500).send('Error al descargar: ' + e.message);
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Servidor corriendo'));
