ionic capacitor sync --prod --source-map
npm run sentry:sourcemaps
sentry-cli releases --org fyle-technologies-private-limi -p "$SENTRY_PROJECT_NAME" files "$LIVE_UPDATE_APP_VERSION" upload-sourcemaps www