# Build the web app with source maps
ionic build --prod --source-map

# Process and upload source maps to Sentry
npm run sentry:sourcemaps
sentry-cli releases --org fyle-technologies-private-limi -p "$SENTRY_PROJECT_NAME" files "$LIVE_UPDATE_APP_VERSION" upload-sourcemaps www

# Remove source maps from www folder to reduce bundle size
find www -name "*.js.map" -type f -delete
find www -name "*.css.map" -type f -delete

# Sync to native platforms without rebuilding
ionic capacitor sync --no-build