const dotenv = require('dotenv');
const { getIosInfo } = require('./utils/ios-info');
const { getProdEnvironment } = require('./utils/prod-environment');
const { getAndroidGoogleServicesJson } = require('./utils/android-google-services');

dotenv.config();

if (process.env.NATIVE_CONFIG) {
  const NATIVE_CONFIG = JSON.parse(process.env.NATIVE_CONFIG);
  module.exports = {
    iosInfo: getIosInfo(),
  };
}

module.exports.prodEnvironment = getProdEnvironment();
module.exports.androidGoogleServicesJson = getAndroidGoogleServicesJson();

