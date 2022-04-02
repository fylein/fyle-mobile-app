const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const secrets = require('./testsecrets');

fs.writeFileSync(`${ctx.project.dir}/src/environments/environment.staging.ts`, secrets.testEnviroinent);