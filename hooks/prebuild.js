const fs = require('fs');
const util = require('util');
const path = require('path');
const stat = util.promisify(fs.stat);
const dotenv = require('dotenv');
dotenv.config();
const secrets = require('./secrets');

module.exports = function (ctx) {
  console.log(process.env);
  console.log('---------------------------');
  console.log(ctx);
  console.log(secrets.prodEnviroinent);
    // Creating environment.prod.ts file
    fs.writeFileSync(`${ctx.project.dir}`+ "/src/environments/environment.prod.ts", secrets.prodEnviroinent);

    if (ctx.CI_PLATFORM === 'android') {
        const platformRoot = path.join(ctx.project.dir, 'android');
        FILE_PATHS = {
          "android.cameraPreview": `${ctx.project.dir}`+ "/node_modules/@capacitor-community/camera-preview/android/src/main/java/com/ahm/capacitor/camera/preview/CameraPreview.java"
        };
        // Commenting Manifest.permission.RECORD_AUDIO on CameraPreview.java 
        console.log("Commenting Manifest.permission.RECORD_AUDIO on CameraPreview.java ...");
        var cameraPreviewPath = path.resolve(process.cwd(), FILE_PATHS["android.cameraPreview"]);
        var cameraPreviewContents = fs.readFileSync(cameraPreviewPath).toString();
        fs.writeFileSync(cameraPreviewPath, cameraPreviewContents.replace(/Manifest.permission.RECORD_AUDIO/g, '// Manifest.permission.RECORD_AUDIO ,'), 'utf8');
    }
        // Creating google-services.json file
        fs.writeFileSync(platformRoot + "/app/google-services.json", secrets.googleCredentials);
};