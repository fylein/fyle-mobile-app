# fyle-mobile-app

# Node version

Please install node v14.17.2 or above via nvm.

## How to run this locally?

 - [Install ionic cli](https://ionicframework.com/docs/cli)
 - npm install
 - Add the environment files corresponding to the build you want in the environment folder
 - ionic serve -c `env_name`

# IMPORTANT
## before making any changes

 - go to .git/hooks
 - run in the shell - chmod +x pre-commit 
 - Note: It is to prevent keys from accidentally leaking.


## For setting environment variables

 - Ping mobile app team for environment files
 - Add them inside the environments folder
 - Note: Do not make any changes to the environment.ts file - this is a template folder for creating configurations.

## For creating pull requests

  - Ping mobile app team for write access to the repository

## For running app directly in android device for staging

  - ionic capacitor run android -l --external --configuration=staging
    It will open android studio, let it build index file and Gradle build for sometime
    Then check that studio recognized the right device in the top bar. Press the run button. After every change, you make in the `src` directory. It will automatically build the app on the device.

## For running app directly in ios device for staging

  - Add .env file to project (ping mobile app team for the file)
  - Install Xcode from App store
  - run ionic build --staging 
  - npx cap sync
  - npx cap open ios
  - In Xcode, select the connected device from the top bar and click on run button.

## Push Notifications
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

## Running Appflow workflow manually on a private branch

 - Click on [Actions](https://github.com/fylein/fyle-mobile-app2/actions) Tab
 - From Workflows List, Select `Manual Workflow - Appflow`
 - On the right hand side you can see the list of workflow run.
 - In the list view you can see a `Run Workflow` button. Click on that button
 - Select the branch on which you want to run the workflow from the dropdown available for `Use workflow from`
 - Click on `Run Workflow`
 - This will now run the workflow on your private branch and the diawi apk link and ipa links will be shared on slack

 ## Troubleshooting
 Some common issues and how to fix them

 ### `Error: Cannot GET /`  on running the app locally in browser
 This happens because some packages listed in `package.json` are not installed locally. Delete `node_modules` and run `npm i` to fix this issue.
