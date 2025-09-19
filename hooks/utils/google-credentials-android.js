require('dotenv').config();

module.exports.getGoogleCredentialsAndroid = (NATIVE_CONFIG) => `
{
    "project_info": {
    "project_number": "${process.env.FYLE_MOBILE_PROJECT_NUMBER}",
    "project_id": "${process.env.FYLE_MOBILE_PROJECT_ID}",
    "storage_bucket": "${process.env.FYLE_MOBILE_STORAGE_BUCKET}"
    },
    "client": [
    {
        "client_info": {
        "mobilesdk_app_id": "${process.env.FYLE_MOBILE_MOBILESDK_APP_ID}",
        "android_client_info": {
            "package_name": "${NATIVE_CONFIG.base.bundle_id}"
        }
        },
        "oauth_client": [
        {
            "client_id": "${process.env.FYLE_MOBILE_CLIENT_ID_3}",
            "client_type": 3
        }
        ],
        "services": {
        "appinvite_service": {
            "other_platform_oauth_client": [
            {
                "client_id": "${process.env.FYLE_MOBILE_CLIENT_ID_3}",
                "client_type": 3
            },
            {
                "client_id": "${process.env.FYLE_MOBILE_CLIENT_ID_2}",
                "client_type": 2,
                "ios_info": {
                "bundle_id": "${NATIVE_CONFIG.base.bundle_id}"
                }
            }
            ]
        }
        }
    }
    ],
    "configuration_version": "1"
}
`