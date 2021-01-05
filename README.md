# fyle-mobile-app2

New version of Fyle mobile app. This project is under active development and may be unstable for a while.

## How to run this locally?

 - [Install ionic cli](https://ionicframework.com/docs/cli)
 - npm install
 - put the environment files corresponding to the build you want in the environment folder
 - ionic serve -c `env_name`

# IMPORTANT
## before making any changes

 - go to .git/hooks
 - run in the shell - chmod +x pre-commit 

This is to prevent keys from accidentally leaking

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
  - Two way to get the SHA-1
    - 1. Get you SHA-1 key by running this command
      `keytool -exportcert -list -v -alias androiddebugkey -keystore ~/.android/debug.keystore`, password: android
    - 2. open android studio
      - top right below profile icon you can see Gradle(with Elephant icon), click on this
      - android -> Tasks -> android -> (signing report)
      - This will give you sha1, sha256, md5 in android studio terminal.
  - Ping @tarun to add this sha1 key to firebase console and get `google-services.json` file from him.
  - Open your code editor, not android studio and add this file inside `android/app` directory.

**iOS**
  - Get `GoogleService-Info.plist` from @tarun
  - Open xcode via terminal($ionic cap open ios)
  - Drag and drop googleService-Info.plist file inside App/App directory.
  - It will open a dialog, please Enable `Copy Items if needed` and press Finish.
  - Open Info of app in xcode, scroll down to URL Types, you can see 1 item already added.
  - Add another by clicking + sign below that item.
  - Add `REVERSED_CLIENT_ID` in Identifier column and add the value of REVERSED_CLIENT_ID in URL Schemes
  - You can get REVERSED_CLIENT_ID value from GoogleService-Info.plist, this value is something like `com.googleusercontent.apps.somethingRandomHash`

## Camera Overlay
  - Add these lines in `MainActivity.java`
    - import com.ahm.capacitor.camera.preview.CameraPreview; (After line -> package com.fylehq.production;)
    - add(CameraPreview.class); (After this line -> // Ex: add(TotallyAwesomePlugin.class);)
  - Add these lines in `AndroidManifest.xml`
    - android:usesCleartextTraffic="true" (After this line -> android:theme="@style/AppTheme")
  - Remove this line from `CameraPreview.java` file
    - Manifest.permission.RECORD_AUDIO

## Imagepicker issue
  - If you get issue in the file `MultiImageChooserActivaty.java` something like `android.support.v7.app.ActionBar`, please do the following
    - npx jetify
    - npx cap sync
    - npx cap copy

## App icons

  **Android**
    - Open android studio
    - On Left side app -> res (Right Click) -> new -> Image Asset
    - On path choose $pwd/resources/icon.png
    - Trim (yes)
    - Reduce the resize to accordingly(100% is ok for now)
    - Background Layer -> Color -> #F36
    - Next -> Finish


## Splash Screens
  - $npm install -g cordova-res

  **Android**
  - $cordova-res android --skip-config --copy

  **iOS**
  - $cordova-res ios --skip-config --copy

## Push Notificatios
  **iOS**
  - Add this line `ios/App/Podfile` file (open via code editor, not xcode)
    - (After this line -> # Add your Pods here)
      - pod 'FirebaseCore'
      - pod 'Firebase/Messaging'
  - Run this from terminal 
    - npx cap update ios
  - Add these lines `ios/App/App/AppDelegate.swift` file
    - (After this line -> import Capacitor)
      - import FirebaseCore
      - import FirebaseInstanceID
      - import FirebaseMessaging 
    - FirebaseApp.configure() (After this line -> // Override point for customization after application launch.)
    - Update the application_ function after #if USE_PUSH as described below
    ```bash
      func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
            Messaging.messaging().apnsToken = deviceToken
            InstanceID.instanceID().instanceID { (result, error) in
                if let error = error {
                    NotificationCenter.default.post(name: Notification.Name(CAPNotifications.DidFailToRegisterForRemoteNotificationsWithError.name()), object: error)
                } else if let result = result {
                    NotificationCenter.default.post(name: Notification.Name(CAPNotifications.DidRegisterForRemoteNotificationsWithDeviceToken.name()), object: result.token)
                }
            }
        }
    ```
    - Now open Xcode and enable Push notifications from sigining and capabilites if it is not enabled.
    - Follow these two articles if you face any issue
      - https://devdactic.com/push-notifications-ionic-capacitor/
      - https://capacitorjs.com/docs/guides/push-notifications-firebase
    