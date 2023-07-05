const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const secrets = require('./secrets');

module.exports = function (ctx) {
  //Throw error if any env variable is undefined
  if (secrets.prodEnvironment.includes('undefined')) {
    throw Error('Environment variable cannot be undefined');
  }

  // Creating environment.prod.ts file
  fs.writeFileSync(`${ctx.project.dir}` + '/src/environments/environment.prod.ts', secrets.prodEnvironment);

  // Adding LIVE_UPDATE_CHANNEL in strings.xml
  var androidStringsPath = path.resolve(process.cwd(), 'android/app/src/main/res/values/strings.xml');
  var androidStrings = fs.readFileSync(androidStringsPath).toString();
  fs.writeFileSync(
    androidStringsPath,
    androidStrings.replace('LIVE_UPDATE_CHANNEL', process.env.LIVE_UPDATE_CHANNEL),
    'utf8'
  );

  const appPluginPath = path.resolve(process.cwd(), 'node_modules/@capacitor/app/android/src/main/java/com/capacitorjs/plugins/app/AppPlugin.java');
  const appPluginContent = fs.readFileSync(appPluginPath).toString();
  fs.writeFileSync(
    appPluginPath,
    appPluginContent.replace('startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)', 'startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK)'),
    'utf8'
  );

  if (!process.env.NATIVE_CONFIG) {
    return;
  }

  //Check if live update and actual app version have same major and minor versions
  compareAppVersion(process.env.LIVE_UPDATE_APP_VERSION, ctx.env.FYLE_MOBILE_RELEASE_VERSION);

  //Throw error if any variable in environment file is undefined

  const platformRoot = path.join(ctx.project.dir, 'android');
  FILE_PATHS = {
    'android.cameraPreview':
      `${ctx.project.dir}` +
      '/node_modules/@capacitor-community/camera-preview/android/src/main/java/com/ahm/capacitor/camera/preview/CameraPreview.java',
  };

  // Adding GIT_COMMIT_SHA for sentry
  var mainPath = path.resolve(process.cwd(), 'src/main.ts');
  var mainPathContent = fs.readFileSync(mainPath).toString();
  fs.writeFileSync(
    mainPath,
    mainPathContent.replace(/please-replace-your-git-commit-version/g, process.env.CI_GIT_COMMIT_SHA),
    'utf8'
  );

  // Commenting Manifest.permission.RECORD_AUDIO on CameraPreview.java
  var cameraPreviewPath = path.resolve(process.cwd(), FILE_PATHS['android.cameraPreview']);
  var cameraPreviewContents = fs.readFileSync(cameraPreviewPath).toString();
  fs.writeFileSync(
    cameraPreviewPath,
    cameraPreviewContents.replace(/Manifest.permission.RECORD_AUDIO/g, '// Manifest.permission.RECORD_AUDIO ,'),
    'utf8'
  );

  // updating app version
  var buildGradlePath = path.resolve(process.cwd(), 'android/app/build.gradle');
  var buildGradlePathContents = fs.readFileSync(buildGradlePath).toString();
  fs.writeFileSync(
    buildGradlePath,
    buildGradlePathContents.replace(/51000/g, ctx.env.FYLE_MOBILE_BUILD_VERSION),
    'utf8'
  );
  buildGradlePathContents = fs.readFileSync(buildGradlePath).toString();
  fs.writeFileSync(
    buildGradlePath,
    buildGradlePathContents.replace(/5.10.0/g, ctx.env.FYLE_MOBILE_RELEASE_VERSION),
    'utf8'
  );

  var pbxprojPath = path.resolve(process.cwd(), 'ios/App/App.xcodeproj/project.pbxproj');
  var pbxprojPathContents = fs.readFileSync(pbxprojPath).toString();
  fs.writeFileSync(
    pbxprojPath,
    pbxprojPathContents.replace(/FYLE_MOBILE_RELEASE_VERSION/g, ctx.env.FYLE_MOBILE_RELEASE_VERSION),
    'utf8'
  );

  // Creating google-services.json file
  fs.writeFileSync('android/app/google-services.json', secrets.googleCredentialsAndroid);

  // Creating GoogleService-Info.plist file
  fs.writeFileSync('ios/App/App/GoogleService-Info.plist', secrets.googleCredentialsIos);

  // Creating Info.plist file
  fs.writeFileSync('ios/App/App/Info.plist', secrets.iosInfo);
};

function compareAppVersion(liveUpdateVersion, currentVersion) {
  if (
    !liveUpdateVersion ||
    !currentVersion ||
    typeof liveUpdateVersion !== 'string' ||
    typeof currentVersion !== 'string'
  ) {
    throw Error('Invalid app version');
  }
  const currentVersionArray = currentVersion.split('.').map((val) => parseInt(val, 10));
  const liveUpdateVersionArray = liveUpdateVersion.split('.').map((val) => parseInt(val, 10));

  if (currentVersionArray[0] !== liveUpdateVersionArray[0] || currentVersionArray[1] !== liveUpdateVersionArray[1]) {
    throw Error(`Live update version ${liveUpdateVersion} is different from current version ${currentVersion}`);
  }
  return true;
}
