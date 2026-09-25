class PushNotificationService {
  sendPush(token, title, body, payloadData = {}) {
    console.log(`[Push Notification] FCM dispatch to token ${token.substring(0, 10)}... | ${title} - ${body}`);
    return { status: 'DELIVERED', pushId: `FCM-${Date.now()}` };
  }
}

module.exports = new PushNotificationService();
