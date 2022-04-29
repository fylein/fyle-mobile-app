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
    iosInfo: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>Fyle</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$(MARKETING_VERSION)</string>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>com.getcapacitor.capacitor</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>capacitor</string>
            </array>
        </dict>
        <dict>
            <key>CFBundleTypeRole</key>
            <string>Editor</string>
            <key>CFBundleURLName</key>
            <string>REVERSED_CLIENT_ID</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>` + process.env.FYLE_MOBILE_REVERSED_CLIENT_ID_2 + `</string>
            </array>
        </dict>
    </array>
    <key>CFBundleVersion</key>
    <string>$(CURRENT_PROJECT_VERSION)</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
    </dict>
	<key>NSCameraUsageDescription</key>
	<string>Fyle needs camera access to capture your receipts and attach them to expenses.</string>
	<key>NSLocationAlwaysUsageDescription</key>
	<string>Fyle needs location access to calculate distance in your mileage expenses.</string>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>Fyle needs location access to calculate distance in your mileage expenses.</string>
	<key>NSMicrophoneUsageDescription</key>
	<string>To Record Audio With Video</string>
	<key>NSPhotoLibraryAddUsageDescription</key>
	<string>Fyle needs photo library access to save the captured receipts</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>Fyle needs photo library access to upload receipts that you choose.</string>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIMainStoryboardFile</key>
    <string>Main</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleDarkContent</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
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
                SENTRY_DSN: '` + process.env.FYLE_MOBILE_SENTRY_DSN + `',
                REFINER_NPS_FORM_ID: '` + process.env.REFINER_NPS_FORM_ID + `'
                LAUNCH_DARKLY_CLIENT_ID: '` + process.env.LAUNCH_DARKLY_CLIENT_ID + `'
              };
        
            `

};