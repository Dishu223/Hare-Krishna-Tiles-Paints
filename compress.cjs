const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function getFiles(dir, files_) {
  files_ = files_ || [];
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}

const files = getFiles('./public');
const imageFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

async function processImages() {
  let totalSaved = 0;
  for (const file of imageFiles) {
    const stats = fs.statSync(file);
    const originalSize = stats.size;
    if (originalSize > 250 * 1024) { // Only compress if > 250KB
      console.log(`Compressing ${file} (${(originalSize/1024/1024).toFixed(2)} MB)`);
      const tempPath = file + '.tmp';
      try {
        const image = sharp(file);
        const metadata = await image.metadata();
        
        let width = metadata.width;
        if (width > 1600) {
            width = 1600;
        }
        
        if (file.endsWith('.png')) {
           await image.resize({ width, withoutEnlargement: true }).png({ quality: 65, compressionLevel: 9 }).toFile(tempPath);
        } else {
           await image.resize({ width, withoutEnlargement: true }).jpeg({ quality: 65 }).toFile(tempPath);
        }
        
        const newStats = fs.statSync(tempPath);
        totalSaved += (originalSize - newStats.size);
        fs.renameSync(tempPath, file);
      } catch (err) {
        console.error(`Failed to compress ${file}:`, err);
      }
    }
  }
  console.log(`Done! Saved ${(totalSaved/1024/1024).toFixed(2)} MB in total.`);
}

processImages();
