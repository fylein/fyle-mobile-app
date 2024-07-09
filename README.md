# fyle-mobile-app

# Node version

Please install node v14.17.2 or above via nvm.

## How to run this locally?

1. **Install Ionic CLI**: If you haven't already, follow the instructions [here](https://ionicframework.com/docs/cli) to install the Ionic CLI.
2. **Install Dependencies**: Run `npm install` in your terminal to install all the necessary dependencies.
3. **Set Environment Variables**: Add the environment files corresponding to the build you want in the environment folder.
4. **Run Locally**: Use the following command to run the application locally:
```bash
ionic serve -c env_name
```
Replace env_name with the name of the environment file you want to use. For example, if you have an environment file named staging, you would run:
```bash
ionic serve -c staging
```

# IMPORTANT
## For setting environment variables

 - Ping mobile app team for environment files
 - Add them inside the environments folder
 - Note: Do not make any changes to the environment.ts file - this is a template folder for creating configurations. Also, make sure not to put staging envs in this file.
 - If you are getting errors like this:
   ```
   Property 'LIVE_UPDATE_APP_VERSION' does not exist on type
   '{ production: boolean; NAME: string; CLUSTER_DOMAIN: string; ROOT_URL: string; ROUTER_API_ENDPOINT: string;
   ANDROID_CLIENT_ID: string; IP_FIND_KEY: string; GOOGLE_MAPS_API_KEY: string; FRESHCHAT_TOKEN: string;
   SENTRY_DSN: string; REFINER_NPS_FORM_ID: string; }'
   ```
   make sure you have the latest `environment.staging.ts` file.

## For creating pull requests

  - Ping mobile app team for write access to the repository.

## Running unit tests

  - Run `ng test`
  - Run `npm run test:no-parallel` to run tests without sharding (without parallel browsers). This is useful to avoid parallel execution and to prevent excessive CPU utilization and memory hogging.

## Viewing coverage report
  After running the tests, you can view the test coverage report by following these steps:

  - Open generated `index.html` file present in the `app/coverage/index.html`.
  - Metrics Explanation:
  In this file you would see 4 metrics for the files you have changed
    - Statements: Percentage of executed statements.
    - Branches: Percentage of executed branches (e.g., conditions in if, else, switch statements, `&&`, `||`, `?` operators used).
    - Functions: Percentage of executed functions.
    - Lines: Percentage of executed lines of code.
  - To increase code coverage write additional test cases to cover the missing Metrics. 

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
