require('dotenv').config();

module.exports.getIosInfo = () =>
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
      <key>CFBundleDevelopmentRegion</key>
      <string>en</string>
      <key>CFBundleDisplayName</key>
      <string>Fyle</string>
      <key>CFBundleExecutable</key>
      <string>$(EXECUTABLE_NAME)</string>
      <key>CFBundleIdentifier</key>
      <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
      <key>CFBundleInfoDictionaryVersion</key>
      <string>6.0</string>
      <key>CFBundleName</key>
      <string>$(PRODUCT_NAME)</string>
      <key>CFBundlePackageType</key>
      <string>APPL</string>
      <key>CFBundleShortVersionString</key>
      <string>$(MARKETING_VERSION)</string>
      <key>CFBundleURLTypes</key>
      <array>
          <dict>
              <key>CFBundleURLName</key>
              <string>com.getcapacitor.capacitor</string>
              <key>CFBundleURLSchemes</key>
              <array>
                  <string>capacitor</string>
              </array>
          </dict>
          <dict>
              <key>CFBundleTypeRole</key>
              <string>Editor</string>
              <key>CFBundleURLName</key>
              <string>REVERSED_CLIENT_ID</string>
              <key>CFBundleURLSchemes</key>
              <array>
                  <string>${process.env.FYLE_MOBILE_REVERSED_CLIENT_ID_2}</string>
              </array>
          </dict>
      </array>
      <key>CFBundleVersion</key>
      <string>$(CURRENT_PROJECT_VERSION)</string>
      <key>LSRequiresIPhoneOS</key>
      <true/>
      <key>NSAppTransportSecurity</key>
      <dict>
          <key>NSAllowsArbitraryLoads</key>
          <false/>
      </dict>
    <key>NSCameraUsageDescription</key>
    <string>Fyle needs camera access to capture your receipts and attach them to expenses.</string>
    <key>NSLocationAlwaysUsageDescription</key>
    <string>Fyle needs location access to calculate distance in your mileage expenses.</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Fyle needs location access to calculate distance in your mileage expenses.</string>
    <key>NSContactsUsageDescription</key>
    <string>App users your contacts</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>To Record Audio With Video</string>
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>Fyle needs photo library access to save the captured receipts</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Fyle needs photo library access to upload receipts that you choose.</string>
      <key>UILaunchStoryboardName</key>
      <string>LaunchScreen</string>
      <key>UIMainStoryboardFile</key>
      <string>Main</string>
      <key>UIRequiredDeviceCapabilities</key>
      <array>
          <string>armv7</string>
      </array>
      <key>UIStatusBarStyle</key>
      <string>UIStatusBarStyleDarkContent</string>
      <key>UISupportedInterfaceOrientations</key>
      <array>
          <string>UIInterfaceOrientationPortrait</string>
      </array>
      <key>UISupportedInterfaceOrientations~ipad</key>
      <array>
          <string>UIInterfaceOrientationPortrait</string>
          <string>UIInterfaceOrientationPortraitUpsideDown</string>
          <string>UIInterfaceOrientationLandscapeLeft</string>
          <string>UIInterfaceOrientationLandscapeRight</string>
      </array>
      <key>UIViewControllerBasedStatusBarAppearance</key>
      <false/>
      <key>IonAppId</key>
        <string>32316914</string>
      <key>IonChannelName</key>
        <string>${process.env.LIVE_UPDATE_CHANNEL}</string>
      <key>IonUpdateMethod</key>
        <string>background</string>
      <key>IonMaxVersions</key>
        <string>2</string>
      <key>IonMinBackgroundDuration</key>
        <string>30</string>
      <key>IonApi</key>
        <string>https://api.ionicjs.com</string>
      <key>ITSAppUsesNonExemptEncryption</key>
        <string>NO</string>
  </dict>
</plist>    
`;