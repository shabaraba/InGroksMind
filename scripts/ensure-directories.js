#!/usr/bin/env node

/**
 * Netlifyビルド前に必要なディレクトリを確保するスクリプト
 */

const fs = require('fs');
const path = require('path');

// プロジェクトのルートディレクトリ
const rootDir = path.join(__dirname, '..');

// 必要なディレクトリのリスト
const requiredDirs = [
  // public/tmp-og-imagesとtmp/og-imagesの両方を確認
  path.join(rootDir, 'tmp/og-images'),
  path.join(rootDir, 'public/tmp-og-images')
];

// 各ディレクトリが存在するか確認し、存在しなければ作成
requiredDirs.forEach(dir => {
  try {
    const stats = fs.lstatSync(dir);

    if (stats.isSymbolicLink()) {
      // シンボリックリンクの場合は、リンク先を確認
      console.log(`Found symlink at: ${dir}`);
      const targetPath = fs.readlinkSync(dir);
      const resolvedPath = path.resolve(path.dirname(dir), targetPath);

      // シンボリックリンク先が存在するか確認
      if (!fs.existsSync(resolvedPath)) {
        console.log(`Creating directory for symlink target: ${resolvedPath}`);
        fs.mkdirSync(resolvedPath, { recursive: true });
      } else {
        console.log(`Symlink target directory already exists: ${resolvedPath}`);
      }
    } else if (stats.isDirectory()) {
      console.log(`Directory already exists: ${dir}`);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      // ディレクトリが存在しない場合は作成
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    } else {
      console.error(`Error checking directory ${dir}:`, err);
    }
  }
});

console.log('All required directories are ready for build.');