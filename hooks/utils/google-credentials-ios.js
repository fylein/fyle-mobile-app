require('dotenv').config();

module.exports.getGoogleCredentialsIos = (NATIVE_CONFIG) => `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
      <key>CLIENT_ID</key>
      <string>${process.env.FYLE_MOBILE_CLIENT_ID_2}</string>
      <key>REVERSED_CLIENT_ID</key>
      <string>${process.env.FYLE_MOBILE_REVERSED_CLIENT_ID}</string>
      <key>API_KEY</key>
      <string>${process.env.FYLE_MOBILE_API_KEY}</string>
      <key>GCM_SENDER_ID</key>
      <string>${process.env.FYLE_MOBILE_PROJECT_NUMBER}</string>
      <key>PLIST_VERSION</key>
      <string>1</string>
      <key>BUNDLE_ID</key>
      <string>${NATIVE_CONFIG.base.bundle_id}</string>
      <key>PROJECT_ID</key>
      <string>${process.env.FYLE_MOBILE_PROJECT_ID}</string>
      <key>STORAGE_BUCKET</key>
      <string>${process.env.FYLE_MOBILE_STORAGE_BUCKET}</string>
      <key>IS_ADS_ENABLED</key>
      <false></false>
      <key>IS_ANALYTICS_ENABLED</key>
      <false></false>
      <key>IS_APPINVITE_ENABLED</key>
      <true></true>
      <key>IS_GCM_ENABLED</key>
      <true></true>
      <key>IS_SIGNIN_ENABLED</key>
      <true></true>
      <key>GOOGLE_APP_ID</key>
      <string>${process.env.FYLE_MOBILE_IOS_GOOGLE_APP_ID}</string>
      <key>DATABASE_URL</key>
      <string>${process.env.FYLE_MOBILE_FIREBASE_URL}</string>
  </dict>
</plist>
`