const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    googleCredentials: `
            {
                "project_info": {
                "project_number": "` + process.env.FYLE_MOBILE_PROJECT_NUMBER + `",
                "firebase_url": "` + process.env.FYLE_MOBILE_FIREBASE_URL + `",
                "project_id": "` + process.env.FYLE_MOBILE_PROJECT_ID + `",
                "storage_bucket": "` + process.env.FYLE_MOBILE_STORAGE_BUCKET + `"
                },
                "client": [
                {
                    "client_info": {
                    "mobilesdk_app_id": "` + process.env.FYLE_MOBILE_MOBILESDK_APP_ID + `",
                    "android_client_info": {
                        "package_name": "` + process.env.base.bundle_id + `"
                    }
                    },
                    "oauth_client": [
                    {
                        "client_id": "` + process.env.FYLE_MOBILE_CLIENT_ID_3 + `",
                        "client_type": 3
                    }
                    ],
                    "api_key": [
                    {
                        "current_key": "` + process.env.FYLE_MOBILE_CURRENT_KEY + `"
                    }
                    ],
                    "services": {
                    "appinvite_service": {
                        "other_platform_oauth_client": [
                        {
                            "client_id": "` + process.env.FYLE_MOBILE_CLIENT_ID_3 + `",
                            "client_type": 3
                        },
                        {
                            "client_id": "` + process.env.FYLE_MOBILE_CLIENT_ID_2 + `",
                            "client_type": 2,
                            "ios_info": {
                            "bundle_id": "` + process.env.base.bundle_id + `"
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
                ROOT_URL: '`+process.env.FYLE_MOBILE_ROOT_URL+`',
                ROUTER_API_ENDPOINT: '`+process.env.FYLE_MOBILE_ROUTER_API_ENDPOINT+`',
                ANDROID_CLIENT_ID: '`+process.env.FYLE_MOBILE_ANDROID_CLIENT_ID+`',
                IP_FIND_KEY: '`+process.env.FYLE_MOBILE_IP_FIND_KEY+`',
                GOOGLE_MAPS_API_KEY: '`+process.env.FYLE_MOBILE_GOOGLE_MAPS_API_KEY+`',
                FRESHCHAT_TOKEN: '`+process.env.FYLE_MOBILE_FRESHCHAT_TOKEN+`',
                SENTRY_DSN: '`+process.env.FYLE_MOBILE_SENTRY_DSN+`'
              };
        
            `
            
};