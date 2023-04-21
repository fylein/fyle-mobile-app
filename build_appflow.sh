VERSION=$(grep "LIVE_UPDATE_APP_VERSION" .env | cut -d "=" -f 2)
ionic capacitor sync --prod --source-map
sentry-cli releases --org fyle-technologies-private-limi -p "$SENTRY_PROJECT_NAME" files "$VERSION" upload-sourcemaps www