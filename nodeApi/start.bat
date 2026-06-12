@echo off
chcp 65001 >nul
echo 正在启动 SQLite API 服务器...
echo.
echo 检查 Node.js 是否已安装...
node --version
if %errorlevel% neq 0 (
  echo 错误: 未找到 Node.js，请先安装 Node.js
  pause
  exit /b 1
)

echo.
echo 检查依赖是否已安装...
if not exist node_modules (
  echo 正在安装依赖...
  npm install
  if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
  )
)

echo.
echo 启动服务器（默认端口 18084）...
node server.js

pause
