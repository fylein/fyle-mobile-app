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
 - npx cap open android
 - under build of top navigation - select build variant (debug or release)
 - build apk from the same as above