# Maestro E2E Testing Setup

This directory contains the configuration for running end-to-end tests using Maestro CLI on the Fyle mobile app.

## Files

- `basic-flow.yaml` - Main Maestro test file that covers basic app functionality
- `../.github/workflows/maestro-e2e-tests.yml` - GitHub Actions workflow for automated testing

## How It Works

The `maestro-e2e-tests.yml` workflow:
- **Runs on Pull Requests**: Automatically triggers when PRs are opened or updated
- **Manual Trigger**: Can be triggered manually with a Diawi URL input
- **Downloads APK**: From Diawi URL (manual) or placeholder (PR runs)
- **Caches Dependencies**: Android SDK, Java, and Maestro CLI for faster runs
- **Sets up Android SDK and emulator**
- **Installs Maestro CLI** (cached for performance)
- **Installs the APK on the emulator**
- **Runs Maestro tests**
- **Uploads test results and publishes them**

### Performance Optimizations

- **Android SDK Caching**: Caches Android SDK components to avoid re-downloading
- **Java Caching**: Caches Java and Gradle dependencies
- **Maestro CLI Caching**: Caches Maestro CLI installation for faster subsequent runs
- **Smart Installation**: Only installs Maestro CLI if not already cached

## Usage

### Running Tests on Pull Requests

Tests run automatically when:
- A new pull request is opened
- A pull request is updated with new commits

**Note**: For PR runs, the workflow will use the Fyle Staging app from Diawi by default.

### Running Tests Manually

You can run Maestro tests manually with a Diawi URL:

1. **Go to GitHub Actions** → "Maestro E2E Tests"
2. **Click "Run workflow"**
3. **Fill in the inputs:**
   - **Diawi URL**: URL to your Android APK file (required)
   - **Test File**: Which Maestro test file to run (default: `basic-flow.yaml`)

4. **Click "Run workflow"**

**Example Diawi URLs:**
- Fyle Staging: `https://i.diawi.com/CZESH4` (default for PR runs)
- Custom build: `https://i.diawi.com/xyz789/fyle-custom.apk`

### Customizing Tests

Edit `basic-flow.yaml` to match your app's actual UI elements:

```yaml
- assertVisible: "Your Actual Button Text"
- tapOn: "Your Actual Element Text"
- inputText: "Your Test Data"
```

### Adding More Test Files

Create additional `.yaml` files in this directory and reference them in the workflow:

```yaml
maestro test maestro-tests/your-new-test.yaml
```

## Requirements

- Android SDK 34
- Android Emulator (API 34)
- Maestro CLI (installed automatically)
- Java 17

## Test Results

Test results are available as:
- GitHub Actions artifacts
- Published test reports in the Actions tab
- JUnit XML format for CI/CD integration

## Troubleshooting

### Common Issues

1. **Emulator Offline Error**: 
   - The workflow now includes ADB server restart and retry logic
   - Increased emulator resources (RAM, heap, cache) for better stability
   - Extended timeout for emulator boot completion

2. **APK Download Issues**: 
   - Ensure Diawi URL is accessible and valid
   - Check that the APK file is not corrupted

3. **Test Failures**: 
   - Verify UI element selectors match your actual app interface
   - Check that the app launches successfully on the emulator

4. **Maestro CLI Issues**: 
   - The workflow installs Maestro automatically
   - For local testing, install with: `curl -Ls "https://get.maestro.mobile.dev" | bash`

### Debugging Steps

If the workflow fails:

1. **Check emulator status** in the logs
2. **Verify APK installation** - look for package verification logs
3. **Review Maestro test output** for specific UI element issues
4. **Check ADB connectivity** - ensure device shows as "device" not "offline"

## Local Testing

To run Maestro tests locally:

1. Install Maestro CLI
2. Build your app: `ionic capacitor build android`
3. Start an emulator or connect a device
4. Run tests: `maestro test maestro-tests/basic-flow.yaml`
