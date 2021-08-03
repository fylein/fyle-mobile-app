const fs = require('fs');
const util = require('util');
const path = require('path');
const stat = util.promisify(fs.stat);
const dotenv = require('dotenv');
dotenv.config();
const secrets = require('./secrets');

module.exports = function (ctx) {

  // Creating environment.prod.ts file
  fs.writeFileSync(`${ctx.project.dir}` + "/src/environments/environment.prod.ts", secrets.prodEnviroinent);

  const platformRoot = path.join(ctx.project.dir, 'android');
  console.log(platformRoot);
  FILE_PATHS = {
    "android.cameraPreview": `${ctx.project.dir}` + "/node_modules/@capacitor-community/camera-preview/android/src/main/java/com/ahm/capacitor/camera/preview/CameraPreview.java"
  };
  // Commenting Manifest.permission.RECORD_AUDIO on CameraPreview.java 
  console.log("Commenting Manifest.permission.RECORD_AUDIO on CameraPreview.java ...");
  var cameraPreviewPath = path.resolve(process.cwd(), FILE_PATHS["android.cameraPreview"]);
  var cameraPreviewContents = fs.readFileSync(cameraPreviewPath).toString();
  fs.writeFileSync(cameraPreviewPath, cameraPreviewContents.replace(/Manifest.permission.RECORD_AUDIO/g, '// Manifest.permission.RECORD_AUDIO ,'), 'utf8');

  // Creating google-services.json file
  fs.writeFileSync("android/app/google-services.json", secrets.googleCredentialsAndroid);
  
  // Creating GoogleService-Info.plist file
  fs.writeFileSync("ios/App/App/GoogleService-Info.plist", secrets.googleCredentialsIos);
};