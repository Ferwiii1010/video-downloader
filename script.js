async function getVideoInfo() {
  const videoURL = document.getElementById('videoURL').value;
  const videoInfoDiv = document.getElementById('videoInfo');
  videoInfoDiv.innerHTML = 'Cargando...';

  try {
    const response = await fetch(`/videoInfo?url=${encodeURIComponent(videoURL)}`);
    const data = await response.json();

    if (data.error) {
      videoInfoDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
      return;
    }

    let html = `<h3>${data.title}</h3>`;
    html += '<p>Selecciona un formato:</p>';
    data.formats.forEach(format => {
      html += `<button onclick="downloadVideo('${videoURL}', '${format.itag}')">
        ${format.qualityLabel} (${format.container})
      </button>`;
    });
    videoInfoDiv.innerHTML = html;
  } catch (error) {
    videoInfoDiv.innerHTML = '<p style="color: red;">Error al conectar con el servidor</p>';
  }
}

function downloadVideo(url, format) {
  window.location.href = `/download?url=${encodeURIComponent(url)}&format=${format}`;
}
