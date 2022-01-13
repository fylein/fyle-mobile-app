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

## For creating pull requests

  - Ping mobile ap team for write access to the repository

Note: Do not make any changes to environment.ts file - it is to be a template folder for creating configuirations.

