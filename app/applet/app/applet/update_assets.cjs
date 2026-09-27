const fs = require('fs');
const path = require('path');
const pubDir = './public/images';

const items = {
  ownerProfile: 'owner_profile.jpg',
  northsideSquare: 'northsideSquare.jpg',
  mariaAvatar: 'mariaAvatar.jpg',
  marcoAvatar: 'marcoAvatar.jpg',
  manicureService: 'manicureService.jpg',
  keratinService: 'keratinService.jpg'
};

let mockCode = fs.readFileSync('src/data/mockData.ts', 'utf8');

for (const [key, filename] of Object.entries(items)) {
  const filePath = path.join(pubDir, filename);
  if (fs.existsSync(filePath)) {
    const buf = fs.readFileSync(filePath);
    const b64 = 'data:image/jpeg;base64,' + buf.toString('base64');
    const regex = new RegExp(`${key}:\\s*\"[^\"]+\"`, 'g');
    if (regex.test(mockCode)) {
      mockCode = mockCode.replace(regex, `${key}: "${b64}"`);
      console.log('Updated', key);
    } else {
      console.log('Key not found in mockData:', key);
    }
  }
}

fs.writeFileSync('src/data/mockData.ts', mockCode, 'utf8');
console.log('mockData.ts updated successfully');
