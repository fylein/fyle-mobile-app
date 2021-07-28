const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const secrets = require('./secrets');

module.exports = function (ctx) {
  console.log(ctx);
  console.log(secrets.prodEnviroinent);
    // Creating environment.prod.ts file
    fs.writeFileSync(`${ctx.project.dir}`+ "/src/environments/environment.prod.ts", secrets.prodEnviroinent);

};