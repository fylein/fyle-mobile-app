//
//  ShareViewController.swift
//  ShareExtension
//
//  Same structure as https://github.com/Cap-go/capacitor-share-target
//

import UIKit
import UniformTypeIdentifiers
import os.log

class ShareViewController: UIViewController {

    private static let osLog = OSLog(subsystem: "com.ionicframework.fyle595781.ShareExtension", category: "ShareViewController")

    let APP_GROUP_ID = "group.com.ionicframework.fyle595781"
    let APP_URL_SCHEME = "capacitor"

    private var texts: [String] = []
    private var files: [[String: Any]] = []

    private func log(_ message: String) {
        os_log(.default, log: Self.osLog, "%{public}@", message)
        print("[ShareExtension] \(message)")
    }

    override public func viewDidLoad() {
        super.viewDidLoad()
        log("viewDidLoad")

        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let attachments = extensionItem.attachments else {
            log("Early exit: no extensionItem or attachments")
            exit()
            return
        }
        log("Got \(attachments.count) attachment(s)")

        Task {
            let title = extensionItem.attributedTitle?.string ?? ""
            let shareData: [String: Any] = [
                "title": title,
                "texts": texts,
                "files": files
            ]
            log("shareData: title=\(title), texts.count=\(texts.count), files.count=\(files.count)")

            let userDefaults = UserDefaults(suiteName: APP_GROUP_ID)
            if let userDefaults = userDefaults {
                userDefaults.set(shareData, forKey: "SharedData")
                userDefaults.synchronize()
                log("Saved SharedData to UserDefaults")
            } else {
                log("ERROR: UserDefaults(suiteName: \(APP_GROUP_ID)) is nil")
            }

            let urlString = "\(APP_URL_SCHEME)://share"
            guard let url = URL(string: urlString) else {
                log("DEBUG: Failed to create URL from '\(urlString)'")
                exit()
                return
            }
            log("DEBUG: Opening URL (main app must register '\(APP_URL_SCHEME)' in CFBundleURLTypes): \(url.absoluteString)")
            log("DEBUG: Thread=\(Thread.isMainThread ? "main" : "background")")
            openURL(url)
        }
    }

    private func exit() {
        log("exit() - completeRequest")
        DispatchQueue.main.async { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }

    private func openURL(_ url: URL) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            // iOS 18: extensionContext?.open(url) often returns false when opening the containing app.
            // This is a known OS restriction; see e.g. https://developer.apple.com/forums/thread/764570
            self.log("DEBUG: Calling extensionContext?.open (NSExtensionContext)")
            self.extensionContext?.open(url, completionHandler: { [weak self] opened in
                self?.log("openURL completed, opened=\(opened). If false on iOS 18: system restricts extensions from opening the host app (not a config bug).")
                self?.exit()
            })
        }
    }
}
