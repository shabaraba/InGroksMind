#!/usr/bin/env node

/**
 * Netlifyビルド前に必要なディレクトリを確保するスクリプト
 */

const fs = require('fs');
const path = require('path');

// 必要なディレクトリのリスト
const requiredDirs = [
  path.join(__dirname, '../public/tmp-og-images')
];

// 各ディレクトリが存在するか確認し、存在しなければ作成
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('All required directories are ready for build.');