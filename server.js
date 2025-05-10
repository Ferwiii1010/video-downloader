const express = require('express');
const ytdl = require('youtube-dl-exec');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors({
  origin: ['https://*.blogspot.com', 'http://localhost'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.static('public'));

// Cargar cookies desde un archivo
const cookiesPath = './cookies.txt';

app.get('/download', async (req, res) => {
  const url = req.query.url;
  const format = req.query.format;
  const type = req.query.type.toLowerCase();
  try {
    let outputFile;
    let options = {};

    if(type === 'video') {
      outputFile = `video.mp4`;
      options = {
        output: outputFile,
        format: format.includes('720') ? 'best[height<=720]' : 'best[height<=1080]',
        cookies: cookiesPath,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };
    } else if(type === 'audio') {
      outputFile = `audio.mp3`;
      options = {
        output: outputFile,
        extractAudio: true,
        audioFormat: 'mp3',
        cookies: cookiesPath,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };
    } else if(type === 'subtitles') {
      outputFile = `subtitles.${format.toLowerCase()}`;
      options = {
        output: outputFile,
        writeSub: true,
        subFormat: format.toLowerCase(),
        skipDownload: true,
        cookies: cookiesPath,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };
    } else if(type === 'thumbnail') {
      outputFile = `thumbnail.jpg`;
      options = {
        output: outputFile,
        writeThumbnail: true,
        skipDownload: true,
        cookies: cookiesPath,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      };
    }

    await ytdl(url, options);
    res.download(outputFile, `${type}-${format.toLowerCase().split(' ')[0]}.${outputFile.split('.').pop()}`, (err) => {
      if(err) console.error('Error al enviar archivo:', err);
      fs.unlinkSync(outputFile); // Limpieza
    });
  } catch(e) {
    res.status(500).send('Error al descargar: ' + e.message);
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Servidor corriendo'));
