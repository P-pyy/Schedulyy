const fs = require('fs');
const path = require('path');

const srcDir = path.join('src', 'assets', 'images');
const pubDir = path.join('public', 'images');

const files = fs.readdirSync(srcDir);
const matchingFiles = files.filter(f => f.startsWith('glow_nail_hero') && f.endsWith('.jpg'));

if (matchingFiles.length === 0) {
  console.log('No generated file found for glow_nail_hero');
  process.exit(1);
}

matchingFiles.sort();
const latestFile = matchingFiles[matchingFiles.length - 1];
const srcPath = path.join(srcDir, latestFile);
const destPath = path.join(pubDir, 'glowNailHero.jpg');

fs.copyFileSync(srcPath, destPath);
console.log('Copied', latestFile, 'to glowNailHero.jpg');

let mockCode = fs.readFileSync('src/data/mockData.ts', 'utf8');
const buf = fs.readFileSync(destPath);
const b64 = 'data:image/jpeg;base64,' + buf.toString('base64');

const regex = /glowNailHero:\s*"[^"]+"/g;
if (regex.test(mockCode)) {
  mockCode = mockCode.replace(regex, `glowNailHero: "${b64}"`);
  console.log('Updated mockData key: glowNailHero');
} else {
  console.log('Key not found in mockData: glowNailHero');
}

fs.writeFileSync('src/data/mockData.ts', mockCode, 'utf8');
console.log('glowNailHero updated successfully!');
