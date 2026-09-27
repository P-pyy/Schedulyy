const fs = require('fs');
const path = require('path');

const assetMap = {
  julian_avatar: 'julianAvatar.jpg',
  jamie_avatar: 'jamieAvatar.jpg',
  haircut_service: 'haircutService.jpg',
  glow_square: 'glowSquare.jpg',
  glow_nail_qc: 'glowNailQC.jpg',
  chloe_avatar: 'chloeAvatar.jpg',
  camille_avatar: 'camilleAvatar.jpg',
  blowout_service: 'blowoutService.jpg',
  balayage_service: 'balayageService.jpg',
  aura_spa_hero: 'auraSpaHero.jpg',
  alex_avatar: 'alexAvatar.jpg'
};

const srcDir = path.join('src', 'assets', 'images');
const pubDir = path.join('public', 'images');

if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
let mockCode = fs.readFileSync('src/data/mockData.ts', 'utf8');

for (const [prefix, targetFilename] of Object.entries(assetMap)) {
  const matchingFiles = files.filter(f => f.startsWith(prefix) && f.endsWith('.jpg'));
  if (matchingFiles.length === 0) {
    console.log('No generated file found for prefix:', prefix);
    continue;
  }
  matchingFiles.sort();
  const latestFile = matchingFiles[matchingFiles.length - 1];
  const srcPath = path.join(srcDir, latestFile);
  const destPath = path.join(pubDir, targetFilename);

  fs.copyFileSync(srcPath, destPath);
  console.log('Copied', latestFile, 'to', targetFilename);

  const buf = fs.readFileSync(destPath);
  const b64 = 'data:image/jpeg;base64,' + buf.toString('base64');
  const propKey = path.basename(targetFilename, '.jpg');

  const regex = new RegExp(`${propKey}:\\s*\"[^\"]+\"`, 'g');
  if (regex.test(mockCode)) {
    mockCode = mockCode.replace(regex, `${propKey}: "${b64}"`);
    console.log('Updated mockData key:', propKey);
  } else {
    console.log('Key not found in mockData:', propKey);
  }
}

fs.writeFileSync('src/data/mockData.ts', mockCode, 'utf8');
console.log('All 11 assets updated successfully!');
