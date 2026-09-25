class SmsService {
  sendSms(phoneNumber, alertTitle, alertSeverity) {
    const text = `[EcoGuard EMERGENCY] ${alertSeverity}: ${alertTitle}. Take safety measures immediately. Track live status: https://ecoguard.ai/alerts`;
    console.log(`[SMS Service] Sending SMS to ${phoneNumber}: "${text}"`);
    return { status: 'DELIVERED', sid: `SM-${Date.now()}` };
  }
}

module.exports = new SmsService();
