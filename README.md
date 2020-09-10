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
 ** IF npx cap give some trouble, please replace it with `ionic capacitor`

## For running app directly in android device for staging
- ionic capacitor run android -l --external --configuration=staging
  This will open android studio, let it build index file and gradle build for sometime
  Then check that studio recgnized the right device in top bar. Press run button. After every change you make in `src` directory it will automatically build the app in device.