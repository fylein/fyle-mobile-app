const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    googleCredentials: `
            {
                "project_info": {
                "project_number": "` + process.env.FYLE_MOBILE_STAGING_PROJECT_NUMBER + `",
                "firebase_url": "` + process.env.FYLE_MOBILE_STAGING_FIREBASE_URL + `",
                "project_id": "` + process.env.FYLE_MOBILE_STAGING_PROJECT_ID + `",
                "storage_bucket": "` + process.env.FYLE_MOBILE_STAGING_STORAGE_BUCKET + `"
                },
                "client": [
                {
                    "client_info": {
                    "mobilesdk_app_id": "` + process.env.FYLE_MOBILE_STAGING_MOBILESDK_APP_ID + `",
                    "android_client_info": {
                        "package_name": "com.ionicframework.fyle595781"
                    }
                    },
                    "oauth_client": [
                    {
                        "client_id": "` + process.env.FYLE_MOBILE_STAGING_CLIENT_ID_3 + `",
                        "client_type": 3
                    }
                    ],
                    "api_key": [
                    {
                        "current_key": "` + process.env.FYLE_MOBILE_STAGING_CURRENT_KEY + `"
                    }
                    ],
                    "services": {
                    "appinvite_service": {
                        "other_platform_oauth_client": [
                        {
                            "client_id": "` + process.env.FYLE_MOBILE_STAGING_CLIENT_ID_3 + `",
                            "client_type": 3
                        },
                        {
                            "client_id": "` + process.env.FYLE_MOBILE_STAGING_CLIENT_ID_2 + `",
                            "client_type": 2,
                            "ios_info": {
                            "bundle_id": "com.ionicframework.fyle595781"
                            }
                        }
                        ]
                    }
                    }
                }
                ],
                "configuration_version": "1"
            }`,
            prodEnviroinent : `
            export const environment = {
                production: true,
                NAME: '',
                CLUSTER_DOMAIN: '',
                ROOT_URL: '`+process.env.FYLE_MOBILE_STAGING_ROOT_URL+`',
                ROUTER_API_ENDPOINT: '`+process.env.FYLE_MOBILE_STAGING_ROUTER_API_ENDPOINT+`',
                ANDROID_CLIENT_ID: '`+process.env.FYLE_MOBILE_STAGING_ANDROID_CLIENT_ID+`',
                IP_FIND_KEY: '`+process.env.FYLE_MOBILE_STAGING_IP_FIND_KEY+`',
                GOOGLE_MAPS_API_KEY: '`+process.env.FYLE_MOBILE_STAGING_GOOGLE_MAPS_API_KEY+`',
                FRESHCHAT_TOKEN: '`+process.env.FYLE_MOBILE_STAGING_FRESHCHAT_TOKEN+`',
                SENTRY_DSN: '`+process.env.FYLE_MOBILE_STAGING_SENTRY_DSN+`'
              };
        
            `
            
};