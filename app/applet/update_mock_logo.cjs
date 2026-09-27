const fs = require('fs');
const logoBuf = fs.readFileSync('/app/applet/public/images/logo.png');
const logoBase64 = 'data:image/png;base64,' + logoBuf.toString('base64');

let mockCode = fs.readFileSync('/app/applet/src/data/mockData.ts', 'utf8');

mockCode = mockCode.replace(/logo:\s*"[^"]*",/, `logo: "${logoBase64}",`);
mockCode = mockCode.replace(/schedulyLogo:\s*"[^"]*",/, `schedulyLogo: "${logoBase64}",`);

fs.writeFileSync('/app/applet/src/data/mockData.ts', mockCode, 'utf8');
console.log('Successfully updated logo in mockData.ts');
