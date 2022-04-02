const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const secrets = require('./testsecrets');

fs.writeFileSync(`./src/environments/environment.staging.ts`, secrets.testEnviroinent);