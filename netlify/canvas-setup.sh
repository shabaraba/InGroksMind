#!/bin/bash
set -e

echo "Setting up node-canvas for Netlify deployment..."
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "System info: $(uname -a)"

# システムの種類に応じて依存関係をインストール
if [ -f /etc/debian_version ]; then
  echo "Debian-based system detected. Installing dependencies with apt-get..."
  apt-get update -y || echo "Failed to update apt. Continuing anyway..."
  apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev || echo "Failed to install some dependencies. Continuing anyway..."
elif [ -f /etc/redhat-release ]; then
  echo "RedHat-based system detected. Installing dependencies with yum..."
  yum update -y || echo "Failed to update yum. Continuing anyway..."
  yum install -y gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel || echo "Failed to install some dependencies. Continuing anyway..."
else
  echo "Unknown system type. Trying with apt-get..."
  apt-get update -y || echo "apt-get update failed. Trying to continue anyway..."
  apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev || echo "Failed to install dependencies. Build may fail."
fi

# 既存のnode_modulesディレクトリがあれば削除して再インストール
if [ -d "node_modules/canvas" ]; then
  echo "Removing existing canvas module..."
  rm -rf node_modules/canvas
fi

# canvasを再インストール
echo "Reinstalling canvas module..."
npm install canvas --no-save

echo "Canvas setup complete!"