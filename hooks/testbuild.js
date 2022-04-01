const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const secrets = require('./secrets');

module.exports = function (ctx) {
  // Creating environment.prod.ts file
  fs.writeFileSync(`${ctx.project.dir}/src/environments/environment.staging.ts`, secrets.testEnviroinent);
};