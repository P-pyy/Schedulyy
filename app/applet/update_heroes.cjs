const fs = require('fs');

function getBase64(path) {
  const buf = fs.readFileSync(path);
  return 'data:image/jpeg;base64,' + buf.toString('base64');
}

const bloomHero = getBase64('/app/applet/public/images/studioBloomHero.jpg');
const northsideHero = getBase64('/app/applet/public/images/northsideBarberHero.jpg');
const glowHero = getBase64('/app/applet/public/images/glowNailHero.jpg');
const mindfulHero = getBase64('/app/applet/public/images/mindfulSpaHero.jpg');
const userProf = getBase64('/app/applet/public/images/userProfile.jpg');

let mockCode = fs.readFileSync('/app/applet/src/data/mockData.ts', 'utf8');

mockCode = mockCode.replace(/studioBloomHero:\s*"[^"]*",/, `studioBloomHero: "${bloomHero}",`);
mockCode = mockCode.replace(/northsideBarberHero:\s*"[^"]*",/, `northsideBarberHero: "${northsideHero}",`);
mockCode = mockCode.replace(/glowNailHero:\s*"[^"]*",/, `glowNailHero: "${glowHero}",`);
mockCode = mockCode.replace(/mindfulSpaHero:\s*"[^"]*",/, `mindfulSpaHero: "${mindfulHero}",`);
mockCode = mockCode.replace(/userProfile:\s*"[^"]*",/, `userProfile: "${userProf}",`);

fs.writeFileSync('/app/applet/src/data/mockData.ts', mockCode, 'utf8');
console.log('Successfully updated hero images in mockData.ts');
