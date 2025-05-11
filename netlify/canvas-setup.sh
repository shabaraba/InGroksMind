#!/bin/bash
set -ex

echo "===== SETTING UP NODE-CANVAS FOR NETLIFY DEPLOYMENT ====="
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "System info: $(uname -a)"

# Node.jsの環境変数を確認
echo "NODE_ENV: $NODE_ENV"
echo "NODE_VERSION: $NODE_VERSION"
echo "PATH: $PATH"
echo "LD_LIBRARY_PATH: $LD_LIBRARY_PATH"

# 依存関係のインストールを試みる
echo "===== ATTEMPTING TO INSTALL CANVAS DEPENDENCIES ====="

# 最初にNitroベースのNetlify環境向けのaptパッケージをインストール
if command -v apt-get &> /dev/null; then
  echo "Debian/Ubuntu system detected, using apt-get..."

  # Netlifyに適したコマンドを使用
  apt-get update || echo "apt-get update failed, but continuing..."
  apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev build-essential || echo "Failed to install some dependencies with apt-get, but continuing..."
else
  echo "apt-get not available, trying alternative methods..."

  # Netlifyは現在、一部の環境でyumを使用する可能性がある
  if command -v yum &> /dev/null; then
    echo "RHEL/CentOS system detected, using yum..."
    yum install -y gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel || echo "Failed to install some dependencies with yum, but continuing..."
  else
    echo "No package manager detected. Continuing without installing system dependencies..."
  fi
fi

# パッケージのステータスを確認
echo "===== CHECKING FOR INSTALLED LIBRARIES ====="
find /usr/lib* -name "libcairo*" || echo "Cairo libraries not found"
find /usr/lib* -name "libpango*" || echo "Pango libraries not found"
find /usr/lib* -name "libjpeg*" || echo "JPEG libraries not found"
find /usr/include -name "cairo.h" || echo "Cairo headers not found"

# node-canvasの既存インストールを削除
if [ -d "node_modules/canvas" ]; then
  echo "Removing existing canvas module..."
  rm -rf node_modules/canvas
fi

# node-canvasインストールのデバッグ出力を有効化
export npm_config_canvas_binary_host_mirror=https://github.com/Automattic/node-canvas/releases/download/
export CANVAS_DEBUG=1

# canvasを強制的に再インストール
echo "===== REINSTALLING NODE-CANVAS ====="
npm install canvas --build-from-source --no-save || echo "canvas installation had errors but continuing..."

# node-canvasのインストール確認
echo "===== VERIFYING NODE-CANVAS INSTALLATION ====="
if [ -d "node_modules/canvas" ]; then
  echo "node-canvas directory exists"
  ls -la node_modules/canvas
else
  echo "WARNING: node-modules/canvas directory doesn't exist!"
fi

# node-canvasの基本的なテスト
echo "===== TESTING NODE-CANVAS ====="
node -e "
try {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 100, 100);
  console.log('Canvas test successful!');
  canvas.toBuffer('image/png');
  console.log('Canvas buffer creation successful!');
} catch (e) {
  console.error('Canvas test failed:', e);
}
" || echo "Canvas test failed but continuing build process..."

# Netlify関数ディレクトリのファイルを確認
echo "===== CHECKING .NETLIFY/FUNCTIONS DIRECTORY ====="
if [ -d ".netlify/functions" ]; then
  echo ".netlify/functions exists"
  ls -la .netlify/functions

  # og-imageディレクトリ内のファイルを確認
  if [ -d ".netlify/functions/og-image" ]; then
    echo ".netlify/functions/og-image exists"
    ls -la .netlify/functions/og-image

    # index.tsファイルの内容を確認
    if [ -f ".netlify/functions/og-image/index.ts" ]; then
      echo "Content of .netlify/functions/og-image/index.ts (first few lines):"
      head -n 10 .netlify/functions/og-image/index.ts
    fi
  fi
else
  echo ".netlify/functions directory does not exist yet"
fi

echo "===== CANVAS SETUP COMPLETE ====="