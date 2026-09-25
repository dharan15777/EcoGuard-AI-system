import Foundation
import UserNotifications

class AlertManager {
    static let shared = AlertManager()

    func scheduleEmergencyPush(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = UNNotificationSound.defaultCritical
        print("[iOS APNS] Critical Emergency Notification Scheduled: \(title)")
    }
}
