import ExpoModulesCore
import FBSDKCoreKit
import AppTrackingTransparency

public class InvixeMetaModule: Module {
  private var errorObserver: NSObjectProtocol?
  private var lastErrorCode: Int?

  public func definition() -> ModuleDefinition {
    Name("InvixeMeta")

    OnCreate {
      self.errorObserver = NotificationCenter.default.addObserver(
        forName: .AppEventsLoggingResult, object: nil, queue: .main
      ) { [weak self] notification in
        // Never expose SDK error descriptions: they can contain request data.
        self?.lastErrorCode = (notification.object as? NSError)?.code
      }
    }
    OnDestroy {
      if let observer = self.errorObserver {
        NotificationCenter.default.removeObserver(observer)
      }
    }

    AsyncFunction("activateAfterConsent") { () -> Bool in
      guard ATTrackingManager.trackingAuthorizationStatus == .authorized,
            Settings.shared.isAutoLogAppEventsEnabled,
            Settings.shared.isAdvertiserIDCollectionEnabled else { return false }
      // Expo's subscriber initializes the SDK at launch with logging disabled.
      // initializeSDK() is idempotent, so enabling logging later must explicitly
      // activate the current session. The SDK deduplicates repeated activations.
      AppEvents.shared.activateApp()
      return true
    }.runOnQueue(.main)

    AsyncFunction("getStatus") { () -> [String: Any] in
      let token = Settings.shared.clientToken ?? ""
      return [
        "appIDMatches": Settings.shared.appID == "1766622331291748",
        "clientTokenPresent": !token.isEmpty && token != "disabled-until-configured",
        "autoLogEnabled": Settings.shared.isAutoLogAppEventsEnabled,
        "advertiserIDEnabled": Settings.shared.isAdvertiserIDCollectionEnabled,
        "trackingAuthorized": ATTrackingManager.trackingAuthorizationStatus == .authorized,
        "lastErrorCode": self.lastErrorCode.map { String($0) } ?? "none"
      ]
    }.runOnQueue(.main)
  }
}
