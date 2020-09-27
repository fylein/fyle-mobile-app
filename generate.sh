#!/bin/sh
# Author : Madhav Mansuriya | Fyle

RED='\033[01;31m'
GREEN='\033[01;32m'
NONE='\033[00m'
YELLOW='\033[01;33m'
BOLD='\033[1m'
UNDERLINE='\033[4m'

if [[ "$1" == "staging" ]] || [[ "$1" == "prod" ]]
then
    echo "generating environment.$1.ts"
    eval "cd src/environments/"

    file="environment.$1.ts"

    echo "export const environment = {" > $file
    if [[ "$1" == "prod" ]]
    then
        prod=true
    else
        prod=false
    fi
    echo "production: $prod," >> $file
    echo "CLUSTER_DOMAIN: ''," >> $file
    if [[ "$1" == "prod" ]]
    then 
        url="https://app.fyle.in"
    else
        url="https://$1.fyle.tech"
    fi
    echo "ROOT_URL: '$url'," >> $file
    echo "ROUTER_API_ENDPOINT: 'https://accounts.staging.fyle.in'," >> $file
    echo "ANDROID_CLIENT_ID: 'some_random_client_id'" >> $file
    echo "};" >> $file

    eval "cd ../.."
    echo -e "Successfully generated ${GREEN} ${UNDERLINE} $file ${NONE} @ ${YELLOW} src/environment/ ${NONE}"
else
    echo -e "${RED} please specify any evironment, example: . generate.sh staging ${NONE}"
fi