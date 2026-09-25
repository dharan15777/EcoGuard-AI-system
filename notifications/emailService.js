const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.templatePath = path.join(__dirname, 'templates/alertEmail.html');
  }

  sendAlertEmail(toEmail, alertDetails) {
    let template = fs.existsSync(this.templatePath) 
      ? fs.readFileSync(this.templatePath, 'utf8') 
      : '<h2>Alert: {{title}}</h2><p>{{description}}</p>';

    template = template
      .replace('{{title}}', alertDetails.title)
      .replace('{{severity}}', alertDetails.severity)
      .replace('{{location}}', alertDetails.locationName)
      .replace('{{description}}', alertDetails.description)
      .replace('{{timestamp}}', alertDetails.triggeredAt || new Date().toISOString());

    console.log(`[Email Service] Dispatching Email to ${toEmail} | Subject: [EcoGuard ALERT] ${alertDetails.severity}: ${alertDetails.title}`);
    return { status: 'SENT', recipient: toEmail, messageId: `MSG-MAIL-${Date.now()}` };
  }
}

module.exports = new EmailService();
