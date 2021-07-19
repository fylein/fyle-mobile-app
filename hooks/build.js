const fs = require('fs');
const util = require('util');
const path = require('path');
const stat = util.promisify(fs.stat);

module.exports = function (ctx) {
    console.log(ctx);
    if (!ctx.build.platform == 'android') return;
    const platformRoot = path.join(ctx.project.dir, 'android');
    FILE_PATHS = {
        "android.cameraPreview": ctx.project.dir+"/node_modules/@capacitor-community/camera-preview/android/src/main/java/com/ahm/capacitor/camera/preview/CameraPreview.java"
    };

    // Commenting Manifest.permission.RECORD_AUDIO on CameraPreview.java 
    console.log("Commenting Manifest.permission.RECORD_AUDIO on CameraPreview.java ...");
    var cameraPreviewPath = path.resolve(process.cwd(), FILE_PATHS["android.cameraPreview"]);
    var cameraPreviewContents = fs.readFileSync(cameraPreviewPath).toString();
    fs.writeFileSync(cameraPreviewPath, cameraPreviewContents.replace(/Manifest.permission.RECORD_AUDIO/g, '// Manifest.permission.RECORD_AUDIO ,'), 'utf8');
    


    const googleCredentials = `
    {
        "project_info": {
          "project_number": "`+process.env.FYLE_MOBILE_STAGING_PROJECT_NUMBER+`",
          "firebase_url": "`+process.env.FYLE_MOBILE_STAGING_FIREBASE_URL+`",
          "project_id": "`+process.env.FYLE_MOBILE_STAGING_PROJECT_ID+`",
          "storage_bucket": "`+process.env.FYLE_MOBILE_STAGING_STORAGE_BUCKET+`"
        },
        "client": [
          {
            "client_info": {
              "mobilesdk_app_id": "`+process.env.FYLE_MOBILE_STAGING_MOBILESDK_APP_ID+`",
              "android_client_info": {
                "package_name": "com.ionicframework.fyle595781.staging"
              }
            },
            "oauth_client": [
              {
                "client_id": "`+process.env.FYLE_MOBILE_STAGING_CLIENT_ID_3+`",
                "client_type": 3
              }
            ],
            "api_key": [
              {
                "current_key": "`+process.env.FYLE_MOBILE_STAGING_CURRENT_KEY+`"
              }
            ],
            "services": {
              "appinvite_service": {
                "other_platform_oauth_client": [
                  {
                    "client_id": "`+process.env.FYLE_MOBILE_STAGING_CLIENT_ID_3+`",
                    "client_type": 3
                  },
                  {
                    "client_id": "`+process.env.FYLE_MOBILE_STAGING_CLIENT_ID_2+`",
                    "client_type": 2,
                    "ios_info": {
                      "bundle_id": "com.ionicframework.fyle595781.staging"
                    }
                  }
                ]
              }
            }
          }
        ],
        "configuration_version": "1"
      }
    `;
    // Creating google-services.json file
    fs.writeFileSync(platformRoot + "/app/google-services.json", googleCredentials);

   
};