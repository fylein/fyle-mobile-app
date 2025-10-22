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
- **Sets up Android SDK and emulator**
- **Installs Maestro CLI**
- **Installs the APK on the emulator**
- **Runs Maestro tests**
- **Uploads test results and publishes them**

## Usage

### Running Tests on Pull Requests

Tests run automatically when:
- A new pull request is opened
- A pull request is updated with new commits

**Note**: For PR runs, you'll need to provide a Diawi URL manually or the workflow will use a placeholder.

### Running Tests Manually

You can run Maestro tests manually with a Diawi URL:

1. **Go to GitHub Actions** → "Maestro E2E Tests"
2. **Click "Run workflow"**
3. **Fill in the inputs:**
   - **Diawi URL**: URL to your Android APK file (required)
   - **Test File**: Which Maestro test file to run (default: `basic-flow.yaml`)

4. **Click "Run workflow"**

**Example Diawi URLs:**
- `https://d.diawi.com/abc123/fyle-app.apk`
- `https://d.diawi.com/xyz789/fyle-staging.apk`

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
