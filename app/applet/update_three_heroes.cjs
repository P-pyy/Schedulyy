const fs = require('fs');
const path = require('path');

const sourceImage = path.join('public', 'images', 'studioBloomInside.jpg');
const targetImages = [
  { filename: 'northsideBarberHero.jpg', key: 'northsideBarberHero' },
  { filename: 'glowNailHero.jpg', key: 'glowNailHero' },
  { filename: 'mindfulSpaHero.jpg', key: 'mindfulSpaHero' }
];

let mockCode = fs.readFileSync('src/data/mockData.ts', 'utf8');

for (const target of targetImages) {
  const destPath = path.join('public', 'images', target.filename);
  fs.copyFileSync(sourceImage, destPath);
  console.log('Copied studioBloomInside.jpg to', target.filename);

  const buf = fs.readFileSync(destPath);
  const b64 = 'data:image/jpeg;base64,' + buf.toString('base64');

  const regex = new RegExp(`${target.key}:\\s*\"[^\"]+\"`, 'g');
  if (regex.test(mockCode)) {
    mockCode = mockCode.replace(regex, `${target.key}: "${b64}"`);
    console.log('Updated mockData key:', target.key);
  } else {
    console.log('Key not found in mockData:', target.key);
  }
}

fs.writeFileSync('src/data/mockData.ts', mockCode, 'utf8');
console.log('All 3 hero assets updated successfully!');
