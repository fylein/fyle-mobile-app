const dotenv = require('dotenv');
dotenv.config();
const NATIVE_CONFIG = JSON.parse(process.env.NATIVE_CONFIG);

module.exports = {
    googleCredentialsAndroid: `
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
                        "package_name": "` + NATIVE_CONFIG.base.bundle_id + `"
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
                            "bundle_id": "` + NATIVE_CONFIG.base.bundle_id + `"
                            }
                        }
                        ]
                    }
                    }
                }
                ],
                "configuration_version": "1"
            }`,
    googleCredentialsIos: ` 
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CLIENT_ID</key>
    <string>` + process.env.FYLE_MOBILE_CLIENT_ID_2 + `</string>
    <key>REVERSED_CLIENT_ID</key>
    <string>` + process.env.FYLE_MOBILE_REVERSED_CLIENT_ID + `</string>
    <key>API_KEY</key>
    <string>` + process.env.FYLE_MOBILE_API_KEY + `</string>
    <key>GCM_SENDER_ID</key>
    <string>` + process.env.FYLE_MOBILE_PROJECT_NUMBER + `</string>
    <key>PLIST_VERSION</key>
    <string>1</string>
    <key>BUNDLE_ID</key>
    <string>` + NATIVE_CONFIG.base.bundle_id + `</string>
    <key>PROJECT_ID</key>
    <string>` + process.env.FYLE_MOBILE_PROJECT_ID + `</string>
    <key>STORAGE_BUCKET</key>
    <string>` + process.env.FYLE_MOBILE_STORAGE_BUCKET + `</string>
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
    <string>` + process.env.FYLE_MOBILE_IOS_GOOGLE_APP_ID + `</string>
    <key>DATABASE_URL</key>
    <string>` + process.env.FYLE_MOBILE_FIREBASE_URL + `</string>
</dict>
</plist>
                `,
    prodEnviroinent: `
            export const environment = {
                production: true,
                NAME: '',
                CLUSTER_DOMAIN: '',
                ROOT_URL: '` + process.env.FYLE_MOBILE_ROOT_URL + `',
                ROUTER_API_ENDPOINT: '` + process.env.FYLE_MOBILE_ROUTER_API_ENDPOINT + `',
                ANDROID_CLIENT_ID: '` + process.env.FYLE_MOBILE_ANDROID_CLIENT_ID + `',
                IP_FIND_KEY: '` + process.env.FYLE_MOBILE_IP_FIND_KEY + `',
                GOOGLE_MAPS_API_KEY: '` + process.env.FYLE_MOBILE_GOOGLE_MAPS_API_KEY + `',
                FRESHCHAT_TOKEN: '` + process.env.FYLE_MOBILE_FRESHCHAT_TOKEN + `',
                SENTRY_DSN: '` + process.env.FYLE_MOBILE_SENTRY_DSN + `'
              };
        
            `

};