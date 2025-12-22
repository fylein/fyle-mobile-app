require('dotenv').config();

/**
 * Build the contents of ios/App/App/GoogleService-Info.plist from environment variables.
 *
 * Expected env vars (FYLE_MOBILE_* preferred, FIREBASE_* as fallback where relevant):
 * - FYLE_MOBILE_FIREBASE_IOS_API_KEY / FIREBASE_IOS_API_KEY
 * - FYLE_MOBILE_FIREBASE_IOS_GCM_SENDER_ID / FIREBASE_IOS_GCM_SENDER_ID
 * - FYLE_MOBILE_FIREBASE_IOS_PLIST_VERSION / FIREBASE_IOS_PLIST_VERSION
 * - FYLE_MOBILE_FIREBASE_IOS_BUNDLE_ID / FIREBASE_IOS_BUNDLE_ID
 * - FYLE_MOBILE_FIREBASE_PROJECT_ID / FIREBASE_PROJECT_ID
 * - FYLE_MOBILE_FIREBASE_STORAGE_BUCKET / FIREBASE_STORAGE_BUCKET
 * - FYLE_MOBILE_FIREBASE_IOS_GOOGLE_APP_ID / FIREBASE_IOS_GOOGLE_APP_ID
 */

function getIosGoogleServicesPlist() {
  const apiKey =
    process.env.FIREBASE_API_KEY;
  const gcmSenderId =
    process.env.FYLE_MOBILE_FIREBASE_IOS_GCM_SENDER_ID ||
    process.env.FIREBASE_IOS_GCM_SENDER_ID;
  const plistVersion =
    process.env.FYLE_MOBILE_FIREBASE_IOS_PLIST_VERSION ||
    process.env.FIREBASE_IOS_PLIST_VERSION ||
    '1';
  const bundleId =
    process.env.FYLE_MOBILE_FIREBASE_IOS_BUNDLE_ID || process.env.FIREBASE_IOS_BUNDLE_ID;
  const projectId =
    process.env.FYLE_MOBILE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const storageBucket =
    process.env.FYLE_MOBILE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;
  const googleAppId =
    process.env.FYLE_MOBILE_FIREBASE_IOS_GOOGLE_APP_ID ||
    process.env.FIREBASE_IOS_GOOGLE_APP_ID;

  const missing = [];
  if (!apiKey) missing.push('FYLE_MOBILE_FIREBASE_IOS_API_KEY / FIREBASE_IOS_API_KEY');
  if (!gcmSenderId)
    missing.push('FYLE_MOBILE_FIREBASE_IOS_GCM_SENDER_ID / FIREBASE_IOS_GCM_SENDER_ID');
  if (!bundleId)
    missing.push('FYLE_MOBILE_FIREBASE_IOS_BUNDLE_ID / FIREBASE_IOS_BUNDLE_ID');
  if (!projectId)
    missing.push('FYLE_MOBILE_FIREBASE_PROJECT_ID / FIREBASE_PROJECT_ID');
  if (!storageBucket)
    missing.push('FYLE_MOBILE_FIREBASE_STORAGE_BUCKET / FIREBASE_STORAGE_BUCKET');
  if (!googleAppId)
    missing.push('FYLE_MOBILE_FIREBASE_IOS_GOOGLE_APP_ID / FIREBASE_IOS_GOOGLE_APP_ID');

  if (missing.length) {
    console.warn(
      '[ios-google-services] Missing Firebase env vars, will not generate GoogleService-Info.plist:',
      missing.join(', '),
    );
    return null;
  }

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>API_KEY</key>
	<string>${apiKey}</string>
	<key>GCM_SENDER_ID</key>
	<string>${gcmSenderId}</string>
	<key>PLIST_VERSION</key>
	<string>${plistVersion}</string>
	<key>BUNDLE_ID</key>
	<string>${bundleId}</string>
	<key>PROJECT_ID</key>
	<string>${projectId}</string>
	<key>STORAGE_BUCKET</key>
	<string>${storageBucket}</string>
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
	<string>${googleAppId}</string>
</dict>
</plist>
`;

  return plist;
}

module.exports.getIosGoogleServicesPlist = getIosGoogleServicesPlist;



