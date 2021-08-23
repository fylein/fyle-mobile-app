VERSION=`sentry-cli releases propose-version`
ionic build -c staging --source-map
sentry-cli releases --org fyle-technologies-private-limi -p fyle-mobile-app-2-staging files "$VERSION" upload-sourcemaps www
npx cap sync