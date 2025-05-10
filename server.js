const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());

app.get('/download', async (req, res) => {
  try {
    const videoURL = req.query.url;
    if (!ytdl.validateURL(videoURL)) {
      return res.status(400).json({ error: 'URL inválida' });
    }
    const info = await ytdl.getInfo(videoURL);
    const videoTitle = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_');
    res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
    ytdl(videoURL, { filter: 'audioandvideo', quality: 'highest' }).pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Error al descargar el video' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
