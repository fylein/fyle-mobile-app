const dotenv = require('dotenv');
const { getGoogleCredentialsAndroid } = require('./utils/google-credentials-android');
const { getGoogleCredentialsIos } = require('./utils/google-credentials-ios');
const { getIosInfo } = require('./utils/ios-info');
const { getProdEnvironment } = require('./utils/prod-environment');

dotenv.config();

if(process.env.NATIVE_CONFIG) {
  const NATIVE_CONFIG = JSON.parse(process.env.NATIVE_CONFIG);
  module.exports = {
    googleCredentialsAndroid: getGoogleCredentialsAndroid(NATIVE_CONFIG),
    googleCredentialsIos: getGoogleCredentialsIos(NATIVE_CONFIG),
    iosInfo: getIosInfo()
  }
}

module.exports.prodEnvironment = getProdEnvironment();
