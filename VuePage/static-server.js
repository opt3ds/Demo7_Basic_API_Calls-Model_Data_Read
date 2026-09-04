const express = require('express');
const path = require('path');

const app = express();
const PORT = 18084; // Use a different port

// Static file service
app.use('/static', express.static(path.join(__dirname, 'public/static')));

// Default route returns server.html
app.get('/server.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/static/server.html'));
});

app.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}`);
  console.log(`Access server.html: http://localhost:${PORT}/server.html`);
  console.log(`Access static files: http://localhost:${PORT}/static/server.html`);
});