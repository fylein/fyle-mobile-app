# fyle-mobile-app

# Node version

Please install node v14.17.2 or above via nvm

## How to run this locally?

 - [Install ionic cli](https://ionicframework.com/docs/cli)
 - npm install
 - Add the environment files corresponding to the build you want in the environment folder
 - ionic serve -c `env_name`

# IMPORTANT
## before making any changes

 - go to .git/hooks
 - run in the shell - chmod +x pre-commit 

This is to prevent keys from accidentally leaking

## For setting environment variables

 - Ping mobile app team for environment files
 - Add them inside environments folder
 - Note: Do not make any changes to environment.ts file - it is to be a template folder for creating configuirations.

## For creating pull requests

  - Ping mobile ap team for write access to the repository

## For running app directly in android device for staging

  - ionic capacitor run android -l --external --configuration=staging
    This will open android studio, let it build index file and gradle build for sometime
    Then check that studio recgnized the right device in top bar. Press run button. After every change you make in `src` directory. It will automatically build the app in device.

## For running app directly in ios device for staging

  - Add .env file to project (ping mobile app team for the file)
  - Install Xcode from App store
  - run ionic build --staging 
  - npx cap sync
  - npx cap open ios
  - In Xcode, select the connected device from the top bar and click on run button.
