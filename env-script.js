const fs = require('fs');
const env = require('./src/environments/environment');
const infoPlistPath = './ios/App/App/Info.plist';
let plistContent = fs.readFileSync(infoPlistPath, 'utf8');
plistContent = plistContent.replace('$(REVERSED_CLIENT_ID)', env.REVERSED_CLIENT_ID);
fs.writeFileSync(infoPlistPath, plistContent);