import UIKit
import Capacitor
import CapawesomeCapacitorAppShortcuts

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  func applicationWillResignActive(_ application: UIApplication) {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    
    /*
      This code snippet will blur the view when app goes in background. This is done as ios takes
      screenshots when app goes in background for better UX and we want to hide passwords or any such
      info in the screenshot.

      References:
        - https://stackoverflow.com/questions/31982270/blurring-app-screen-in-switch-mode-on-ios
        - https://stackoverflow.com/questions/30953201/adding-blur-effect-to-background-in-swift
    */

    let blurEffect = UIBlurEffect(style: UIBlurEffect.Style.light)
    let blurEffectView = UIVisualEffectView(effect: blurEffect)
    blurEffectView.frame = window!.frame
    blurEffectView.tag = 221122

    self.window?.addSubview(blurEffectView)
  }

  func applicationDidEnterBackground(_ application: UIApplication) {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
  }

  func applicationWillEnterForeground(_ application: UIApplication) {
    // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    self.window?.viewWithTag(221122)?.removeFromSuperview()
  }

  func applicationWillTerminate(_ application: UIApplication) {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
  }

  func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // Called when the app was launched with a url. Feel free to add additional processing here,
    // but if you want the App API to support tracking app url opens, make sure to keep this call
    return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
  }
  
  func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    // Called when the app was launched with an activity, including Universal Links.
    // Feel free to add additional processing here, but if you want the App API to support
    // tracking app url opens, make sure to keep this call
    return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
  
  // MARK: - App Shortcuts (Home Screen Quick Actions)
  
  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Handle shortcut from cold start
    if let shortcutItem = launchOptions?[.shortcutItem] as? UIApplicationShortcutItem {
      NotificationCenter.default.post(
        name: NSNotification.Name(AppShortcutsPlugin.notificationName),
        object: nil,
        userInfo: [AppShortcutsPlugin.userInfoShortcutItemKey: shortcutItem]
      )
      return true
    }
    return true
  }
  
  func application(_ application: UIApplication, performActionFor shortcutItem: UIApplicationShortcutItem, completionHandler: @escaping (Bool) -> Void) {
    // Handle shortcut when app is running in background
    NotificationCenter.default.post(
      name: NSNotification.Name(AppShortcutsPlugin.notificationName),
      object: nil,
      userInfo: [AppShortcutsPlugin.userInfoShortcutItemKey: shortcutItem]
    )
    completionHandler(true)
  }
}


