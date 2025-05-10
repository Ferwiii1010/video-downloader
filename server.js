const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const app = express();

// Configurar el puerto dinámicamente para Railway
const port = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para obtener información del video
app.get('/videoInfo', async (req, res) => {
  try {
    const videoURL = req.query.url;
    if (!ytdl.validateURL(videoURL)) {
      return res.status(400).json({ error: 'URL inválida' });
    }
    const info = await ytdl.getInfo(videoURL);
    res.json({
      title: info.videoDetails.title,
      formats: info.formats.filter(format => format.container === 'mp4' && format.hasVideo && format.hasAudio)
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener información del video' });
  }
});

// Ruta para descargar el video
app.get('/download', async (req, res) => {
  try {
    const videoURL = req.query.url;
    const format = req.query.format;
    if (!ytdl.validateURL(videoURL)) {
      return res.status(400).json({ error: 'URL inválida' });
    }
    const info = await ytdl.getInfo(videoURL);
    const videoTitle = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_');
    res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
    ytdl(videoURL, { format: format || 'mp4' }).pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Error al descargar el video' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
