require('dotenv').config();

/**
 * Build the contents of android/app/google-services.json from environment variables.
 *
 * Required env vars (examples):
 * - FYLE_MOBILE_FIREBASE_PROJECT_NUMBER
 * - FYLE_MOBILE_FIREBASE_PROJECT_ID
 * - FYLE_MOBILE_FIREBASE_STORAGE_BUCKET
 * - FYLE_MOBILE_FIREBASE_ANDROID_MOBILESDK_APP_ID
 * - FYLE_MOBILE_FIREBASE_ANDROID_PACKAGE_NAME
 * - FYLE_MOBILE_FIREBASE_API_KEY
 */

function getAndroidGoogleServicesJson() {
  const {
    FYLE_MOBILE_FIREBASE_PROJECT_NUMBER,
    FYLE_MOBILE_FIREBASE_PROJECT_ID,
    FYLE_MOBILE_FIREBASE_STORAGE_BUCKET,
    FYLE_MOBILE_FIREBASE_ANDROID_MOBILESDK_APP_ID,
    FYLE_MOBILE_FIREBASE_ANDROID_PACKAGE_NAME,
    FYLE_MOBILE_FIREBASE_API_KEY,
  } = process.env;

  if (
    !FYLE_MOBILE_FIREBASE_PROJECT_NUMBER ||
    !FYLE_MOBILE_FIREBASE_PROJECT_ID ||
    !FYLE_MOBILE_FIREBASE_STORAGE_BUCKET ||
    !FYLE_MOBILE_FIREBASE_ANDROID_MOBILESDK_APP_ID ||
    !FYLE_MOBILE_FIREBASE_ANDROID_PACKAGE_NAME ||
    !FYLE_MOBILE_FIREBASE_API_KEY
  ) {
    // We deliberately do NOT throw here to keep local/dev workflows flexible.
    // If any of these are missing, prebuild can choose to skip writing the file.
    return null;
  }

  const obj = {
    project_info: {
      project_number: FYLE_MOBILE_FIREBASE_PROJECT_NUMBER,
      project_id: FYLE_MOBILE_FIREBASE_PROJECT_ID,
      storage_bucket: FYLE_MOBILE_FIREBASE_STORAGE_BUCKET,
    },
    client: [
      {
        client_info: {
          mobilesdk_app_id: FYLE_MOBILE_FIREBASE_ANDROID_MOBILESDK_APP_ID,
          android_client_info: {
            package_name: FYLE_MOBILE_FIREBASE_ANDROID_PACKAGE_NAME,
          },
        },
        oauth_client: [],
        api_key: [
          {
            current_key: FYLE_MOBILE_FIREBASE_API_KEY,
          },
        ],
        services: {
          appinvite_service: {
            other_platform_oauth_client: [],
          },
        },
      },
    ],
    configuration_version: '1',
  };

  return JSON.stringify(obj, null, 2);
}

module.exports.getAndroidGoogleServicesJson = getAndroidGoogleServicesJson;


