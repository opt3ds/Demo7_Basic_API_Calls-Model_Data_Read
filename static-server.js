const express = require('express');
const path = require('path');

const app = express();
const PORT = 18084; // 使用不同的端口

// 静态文件服务
app.use('/static', express.static(path.join(__dirname, 'public/static')));

// 默认路由返回 server.html
app.get('/server.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/static/server.html'));
});

app.listen(PORT, () => {
  console.log(`静态服务器运行在 http://localhost:${PORT}`);
  console.log(`访问 server.html: http://localhost:${PORT}/server.html`);
  console.log(`访问静态文件: http://localhost:${PORT}/static/server.html`);
});