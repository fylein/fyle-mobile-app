const dotenv = require('dotenv');
const { getIosInfo } = require('./utils/ios-info');
const { getProdEnvironment } = require('./utils/prod-environment');

dotenv.config();

if(process.env.NATIVE_CONFIG) {
  const NATIVE_CONFIG = JSON.parse(process.env.NATIVE_CONFIG);
  module.exports = {
    iosInfo: getIosInfo()
  }
}

module.exports.prodEnvironment = getProdEnvironment();
