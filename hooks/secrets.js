const dotenv = require('dotenv');
const { getIosInfo } = require('./utils/ios-info');
const { getProdEnvironment } = require('./utils/prod-environment');
const { getGoogleCredentialsAndroid } = require('./utils/google-credentials-android');
const { getGoogleCredentialsIos } = require('./utils/google-credentials-ios');

dotenv.config();

if (process.env.NATIVE_CONFIG) {
  const NATIVE_CONFIG = JSON.parse(process.env.NATIVE_CONFIG);
  module.exports = {
    googleCredentialsIos: getGoogleCredentialsIos(NATIVE_CONFIG),
    iosInfo: getIosInfo(),
  };
}

module.exports.prodEnvironment = getProdEnvironment();
module.exports.googleCredentialsAndroid = getGoogleCredentialsAndroid();