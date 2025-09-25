# Fastlane Configuration

This directory contains the Fastlane configuration for building the Fyle mobile app.

## Setup

1. Install Ruby dependencies:
   ```bash
   bundle install
   ```

2. Install Fastlane:
   ```bash
   gem install fastlane
   ```

## Available Lanes

### Android
- `fastlane android build_apk` - Builds a debug APK
- `fastlane android build_aab` - Builds a release AAB (Android App Bundle)

### iOS
- `fastlane ios build_ios` - Builds a debug iOS app
- `fastlane ios build_ios_release` - Builds a release iOS app

## GitHub Actions

The workflow is configured to run on:
- Push to master branch (Android only)
- Manual workflow dispatch with platform and build type selection

## Notes

- Builds are unsigned for now as requested
- The workflow automatically builds the web app first, then syncs Capacitor, and finally builds the native app
- Artifacts are uploaded to GitHub Actions for download
