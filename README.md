# Fyle Mobile App

This repository holds the codebase for the Fyle Mobile App. This document provides the tools and guidelines to set up, develop, test, and deploy the app efficiently. Built using the [Ionic Framework](https://ionicframework.com/), it supports both Android and iOS platforms.

## 📑 Table of Contents

- [🔧 Prerequisites](#-prerequisites)
- [✨ Quick Setup](#-quick-setup)
- [👀 Environment Setup](#-environment-setup)
- [❓ Troubleshooting](#-troubleshooting)
- [📂 Project Structure](#-project-structure)
- [🛠️ Testing](#-testing)
  - [Viewing Coverage Reports](#viewing-coverage-reports)
- [📱 Running on Devices](#-running-on-devices)
  - [Android](#android)
  - [iOS](#ios)
- [📬 Push Notifications](#-push-notifications)
  - [iOS Setup](#ios-setup)
- [📊 Deployment](#-deployment)
  - [Running Appflow workflow manually on a private branch](#running-appflow-workflow-manually-on-a-private-branch)
- [🙏 Further Help](#-further-help)

<br/>

## 🔧 Prerequisites

- Node.js: Install Node.js (v14.17.2 or higher) using [nvm](https://github.com/nvm-sh/nvm).

- Ionic CLI: Follow the instructions [here](https://ionicframework.com/docs/cli) and Install Ionic globally with `npm` by running:

```bash
  npm install -g @ionic/cli
```

<br/>

## ✨ Quick Setup

Follow the following steps to run the app locally in your browser:

1. **Clone the repository:**

```bash
git clone https://github.com/fylein/fyle-mobile-app.git
cd fyle-mobile-app
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set Environment Variables**: Add the environment files corresponding to the build you want in the environment folder. ([Follow Environment Setup]())

4. **Run Locally**: Use the following command to run the application locally:

```bash
ionic serve -c [env_name]
```

> [!NOTE]
> Replace env_name with the name of the environment file you want to use. For example, if you > have an environment file named staging, you would run:
>
> ```bash
>  ionic serve -c staging
> ```

<br/>

## 👀 Environment Setup

For setting environment variables

- **Environment Files:** Ping mobile app team and get the necessary environment files (environment.[env_name].ts).
- Place them inside the `/src/environments` folder

> [!IMPORTANT]
> Do not make any changes to the `environment.ts` file - this is a template folder for creating > configurations. Also, make sure not to put staging envs in this file.

<br/>

## ❓ Troubleshooting

Here are some common issues and how to fix them:

1. If you encounter the any similar error like this:
   `Property 'LIVE_UPDATE_APP_VERSION' does not exist on type ...`

```bash
  Property 'LIVE_UPDATE_APP_VERSION' does not exist on type
  '{ production: boolean; NAME: string; CLUSTER_DOMAIN: string; ROOT_URL: string; ROUTER_API_ENDPOINT: string;
  ANDROID_CLIENT_ID: string; IP_FIND_KEY: string; GOOGLE_MAPS_API_KEY: string; FRESHCHAT_TOKEN: string;
  SENTRY_DSN: string; REFINER_NPS_FORM_ID: string; }'
```

**Solution**:

Ensure that you have the latest environment.staging.ts file. This file might have been updated with new properties that are missing in your current version.

2. `Error: Cannot GET /` when running the app locally in the browser

This error typically occurs when some of the dependencies listed in `package.json` are not installed properly.

**Solution**:

- Delete the node_modules folder by running:

```bash
rm -rf node_modules
```

- Reinstall the dependencies by running:

```bash
npm install
```

This will ensure that all required packages are correctly installed, resolving the issue.

3. Unable to create PR

**Solution**:

- Ping mobile app team for write access to the repository

<br/>

## 📂 Project Structure

```bash
.
├── .angular/                        # Angular-related configuration
├── .github/                         # GitHub-specific configuration (e.g., workflows)
├── .husky/                          # Git hooks for pre-commit, etc.
├── android/                         # Android-specific configuration and source files
├── coverage/                        # Code coverage reports
├── e2e/                             # End-to-end tests
├── eslint-custom-rules/             # Custom ESLint rules
├── hooks/                           # Custom hooks for the project
├── ios/                             # iOS-specific configuration and source files
├── node_modules/                    # Installed Node.js dependencies
├── resources/                       # Shared resources like images, fonts, etc.
├── src/                             # Main source code of the app
│   ├── app/                         # Application core
│   │   ├── auth/                    # Authentication module
│   │   ├── core/                    # Core application utilities and services
│   │   ├── deep-link-redirection/   # Deep link handling module
│   │   ├── fyle/                    # Fyle-specific features or modules
│   │   ├── post-verification/       # Post-verification module
│   │   ├── shared/                  # Shared components, directives, services, or icons
│   │   ├── app-routing.module.ts    # Routing configuration for the app
│   │   ├── app.component.html       # Main HTML template for the app
│   │   ├── app.component.scss       # Main SCSS styles for the app
│   │   ├── app.component.spec.ts    # Unit tests for the main app component
│   │   ├── app.component.ts         # Main app component logic
│   │   ├── app.module.ts            # Root module of the app
│   │   ├── constants.ts             # Application-wide constants
│   ├── assets/                      # Static assets like images, icons, font setc.
│   ├── environments/                # Environment file specific configuration
│   ├── theme/                       # Application themes (scss)
│   ├── global.scss                  # Global styles for the app
│   ├── index.html                   # Main HTML file of the application
│   ├── main.ts                      # Main entry point for Angular app
│   ├── polyfills.ts                 # Polyfills needed by Angular to load before the app
│   ├── test.ts                      # File is required by karma.conf.js and loads recursively all the .spec
│   ├── zone-flags.ts                # Zone.js configuration flags
├── .eslintrc.json                   # configuration file for ESLin
├── .gitignore                       # Files and folders ignored by Git
├── .npmrc                           # NPM configuration
├── .prettierignore                  # Files ignored by Prettier
├── angular.json                     # Angular workspace configuration
├── appflow.config.json              # Configuration for Appflow
├── browserslist                     # Browser compatibility configuration
├── build_appflow.sh                 # Shell script for Appflow build
├── build_prod.sh                    # Shell script for production build
├── build_staging.sh                 # Shell script for staging build
├── capacitor.config.ts              # Capacitor configuration
├── ionic.config.json                # Ionic CLI configuration
├── karma.conf.js                    # Karma test runner configuration
├── LICENSE                          # License file
├── package-lock.json                # Lockfile for NPM dependencies
├── package.json                     # Project dependencies and scripts
├── README.md                        # Documentation for the project
├── tsconfig.app.json                # TypeScript configuration for the app
├── tsconfig.json                    # Base TypeScript configuration
├── tsconfig.spec.json               # TypeScript configuration for tests
└── ...
```

<br/>

## 🛠️ Testing

- Run unit tests:

```bash
npm run test
```

- For non-parallel execution (Recommended method for prevent excessive CPU utilization and memory hogging.):

```bash
npm run test:no-parallel
```

### Viewing Coverage Reports

After running the tests, you can view the test coverage report by following these steps:

- Open generated `index.html` file present in the `app/coverage/index.html`.
- Metrics Explanation:
  In this file you would see 4 metrics for the files you have changed
  - Statements: Percentage of executed statements.
  - Branches: Percentage of executed branches (e.g., conditions in if, else, switch statements, `&&`, `||`, `?` operators used).
  - Functions: Percentage of executed functions.
  - Lines: Percentage of executed lines of code.
- To increase code coverage write additional test cases to cover the missing Metrics.

<br/>

## 📱 Running on Devices

### Android

For running app directly in android device for staging

1. Build and sync the app:

```bash
ionic capacitor run android -l --external --configuration=staging

```

2. It will open android studio, let it build index file and Gradle build for sometime. Then check that studio recognized the right device in the top bar. Press the run button. After every change, you make in the `src` directory. It will automatically build the app on the device.

### iOS

For running app directly in ios device for staging

- Add .env file to project (ping mobile app team for the file)
- Install Xcode from App store
- Build and sync:

```bash
ionic build --staging
npx cap sync
npx cap open ios
```

- Open Xcode, select the connected device from the top bar and click on run button.

<br/>

## 📬 Push Notifications

### iOS Setup

1. Update the Podfile:

- Add this line `ios/App/Podfile` file (open via code editor, not xcode)
- (After this line -> `# Add your Pods here`)

```bash
  pod 'FirebaseCore'
  pod 'Firebase/Messaging'
```

- After updating the Podfile, run the following command to update your iOS project:

```bash
  npx cap update ios
```

2. Modify `AppDelegate.swift`: Add Required Imports

- Open the ios/App/App/AppDelegate.swift file.
- Add the following import statements after `import Capacitor`:

```bash
  import FirebaseCore
  import FirebaseInstanceID
  import FirebaseMessaging
```

- Configure Firebase by adding the following line after `// Override point for customization after application launch`:

```bash
  FirebaseApp.configure()
```

3. Update the `application(_ application:didRegisterForRemoteNotificationsWithDeviceToken:)` Method:

- Find the `#if USE_PUSH` section and update the application function with the following code:

```swift
func application(
  _ application: UIApplication,
  didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
) {
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

4. Enable Push Notifications in Xcode:

- Open your project in Xcode.
- Go to the "Signing & Capabilities" tab, and ensure that Push Notifications are enabled.
- If you encounter any issues, refer to the following articles for troubleshooting:
  - [The Push Notifications Guide for Ionic & Capacitor](https://devdactic.com/push-notifications-ionic-capacitor/)
  - [Using Push Notifications with Firebase in an Ionic + Angular App](https://capacitorjs.com/docs/guides/push-notifications-firebase)

<br/>

## 📊 Deployment

### Running Appflow workflow manually on a private branch

- Go to the [GitHub Actions tab](https://github.com/fylein/fyle-mobile-app2/actions).
- From Workflows List, Select `Manual Workflow - Appflow`
- On the right hand side you can see the list of workflow run.
- In the list view you can see a `Run Workflow` button. Click on that button
- Select the branch on which you want to run the workflow from the dropdown available for `Use workflow from`
- Click on `Run Workflow`
- This will now run the workflow on your private branch and the diawi apk link and ipa links will be shared on slack

<br/>

## 🙏 Further Help

For access to environment files or repository write permissions, contact the mobile app team.

For additional documentation, refer to the [Ionic Framework Docs](https://ionicframework.com/docs).

<br/>
