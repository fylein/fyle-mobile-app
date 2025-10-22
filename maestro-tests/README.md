# Maestro E2E Testing Setup

This directory contains the configuration for running end-to-end tests using Maestro CLI on the Fyle mobile app.

## Files

- `basic-flow.yaml` - Main Maestro test file that covers basic app functionality
- `../.github/workflows/maestro-e2e-tests.yml` - GitHub Actions workflow for automated testing
- `../.github/workflows/manual-appflow-with-inputs.yml` - Modified workflow that builds and stores APK artifacts

## How It Works

1. **Manual Build Workflow**: The `manual-appflow-with-inputs.yml` workflow:
   - Builds Android APK and iOS IPA using Ionic Appflow
   - Uploads to Diawi for manual testing
   - **NEW**: Stores APK/IPA as GitHub artifacts for automated testing

2. **Maestro E2E Workflow**: The `maestro-e2e-tests.yml` workflow:
   - Triggers automatically after the manual build workflow completes successfully
   - Downloads the APK from GitHub artifacts
   - Sets up Android SDK and emulator
   - Installs Maestro CLI
   - Installs the APK on the emulator
   - Runs Maestro tests
   - Uploads test results and publishes them

## Usage

### Running Tests Automatically

1. Trigger the manual build workflow:
   - Go to GitHub Actions → "Manual workflow with inputs"
   - Select environment (staging, production, etc.)
   - Click "Run workflow"

2. The Maestro E2E tests will run automatically after the build completes

### Running Tests Manually

You can also run Maestro tests manually with a custom APK:

1. **Go to GitHub Actions** → "Maestro E2E Tests"
2. **Click "Run workflow"**
3. **Fill in the inputs:**
   - **APK URL**: URL to your Android APK file (optional - if not provided, will use the latest build artifact)
   - **Test File**: Which Maestro test file to run (default: `basic-flow.yaml`)
   - **Environment**: Environment to test against (staging, production, development)

4. **Click "Run workflow"**

**Example APK URLs:**
- Diawi link: `https://d.diawi.com/abc123/fyle-app.apk`
- GitHub release: `https://github.com/your-org/your-repo/releases/download/v1.0/app.apk`
- Direct file URL: `https://your-server.com/path/to/app.apk`

### APK File Sources

The workflow supports multiple ways to provide APK files:

1. **Automatic (Recommended)**: Uses APK from the latest successful build workflow
2. **Manual URL**: Provide a direct URL to an APK file
3. **Diawi Integration**: Use Diawi links from your build workflow
4. **GitHub Releases**: Link to APK files in GitHub releases
5. **Custom Servers**: Any publicly accessible APK file URL

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

1. **APK Download Issues**: Ensure the manual build workflow completed successfully
2. **Emulator Issues**: Check Android SDK setup and emulator configuration
3. **Test Failures**: Verify UI element selectors match your actual app interface
4. **Maestro CLI Issues**: The workflow installs Maestro automatically, but you can install locally with:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

## Local Testing

To run Maestro tests locally:

1. Install Maestro CLI
2. Build your app: `ionic capacitor build android`
3. Start an emulator or connect a device
4. Run tests: `maestro test maestro-tests/basic-flow.yaml`
