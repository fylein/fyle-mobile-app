# fyle-mobile-app2

New version of Fyle mobile app. This project is under active development and may be unstable for a while.

## How to run this locally?

 - [Install ionic cli](https://ionicframework.com/docs/cli)
 - npm install
 - put the environment files corresponding to the build you want in the environment folder
 - ionic serve -c `env_name`

## For setting environment variables

 - Ping @tarun for environment files
 - put them inside environments folder

Note: Do not make any changes to environment.ts file - it is to be a template folder for creating configuirations.


## For building android version

 - ionic build -c `env_name`
 - [Install Android Studio](https://developer.android.com/studio)
 - npx cap add android
 - npx cap sync
 - npx cap copy
 - npx cap open android
 - under build of top navigation - select build variant (debug or release)
 - build apk from the same as above
 ** IF npx cap give some trouble, please replace it with `ionic cap`

## For running app directly in android device for staging
- ionic capacitor run android -l --external --configuration=staging
  This will open android studio, let it build index file and gradle build for sometime
  Then check that studio recgnized the right device in top bar. Press run button. After every change you make in `src` directory.
  It will automaticallybuild the app in device.

## Google Login

To make google login work in your physical device you need to do some extra activity

**Android**
  - Get you SHA-1 key by running this command
    `keytool -exportcert -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore`, password: android
  - Ping @tarun to add this sha1 key to firebase console and get `google-services.json` file from him.
  - Open your code editor, not android studio and add thsi file inside `android/app` directory.

**iOS**
  - Get `GoogleService-Info.plist` from @tarun
  - Open xcode via terminal($ionic cap open ios)
  - Drag and drop googleService-Info.plist file inside App/App directory.
  - It will open a dialog, please Enable `Copy Items if needed` and press Finish.
  - Open Info of app in xcode, scroll down to URL Types, you can see 1 item already added.
  - Add another by clicking + sign below that item.
  - Add `REVERSED_CLIENT_ID` in Identifier column and add the value of REVERSED_CLIENT_ID in URL Schemes
  - You can get REVERSED_CLIENT_ID value from GoogleService-Info.plist, this value is something like `com.googleusercontent.apps.somethingRandomHash`
