require('dotenv').config();

function getGoogleCredentialsAndroid() {
  // Prefer the FYLE_MOBILE_* names, but also support FIREBASE_* aliases
  const projectNumber =
    process.env.FYLE_MOBILE_PROJECT_NUMBER;
  const projectId =
    process.env.FYLE_MOBILE_PROJECT_ID;
  const storageBucket =
    process.env.FYLE_MOBILE_STORAGE_BUCKET;
  const mobilesdkAppId =
    process.env.FYLE_MOBILE_MOBILESDK_APP_ID;
  const packageName =
    process.env.FIREBASE_IOS_BUNDLE_ID;
  const apiKey =
    process.env.FYLE_MOBILE_API_KEY;

  const obj = {
    project_info: {
      project_number: projectNumber,
      project_id: projectId,
      storage_bucket: storageBucket,
    },
    client: [
      {
        client_info: {
          mobilesdk_app_id: mobilesdkAppId,
          android_client_info: {
            package_name: packageName,
          },
        },
        oauth_client: [],
        api_key: [
          {
            current_key: apiKey,
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

module.exports.getGoogleCredentialsAndroid = getGoogleCredentialsAndroid;
