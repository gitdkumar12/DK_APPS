import { Task, User } from '@/types';

export class EmailService {
  static async sendTaskNotification(recipient: User, task: Task, action: 'created' | 'updated' | 'closed') {
    if (!recipient || !recipient.email || !recipient.notifyEmail) return;

    const subject = `GT Portal: Task ${action.toUpperCase()} - ${task.majorTask}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #6366f1; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">G.T. Design Studio Portal</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Task Notification Update</p>
        </div>
        <div style="padding: 24px;">
          <p>Dear <b>${recipient.name}</b>,</p>
          <p>This is to notify you that the following task has been <b>${action}</b> on the portal:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; width: 120px;">Project Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${task.projectName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Task Type:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${task.majorTask}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Target Closing:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${task.targetClosingDate} (${task.targetClosingDay})</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${task.status}</td>
            </tr>
            ${task.remarks ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Remarks/Details:</td>
              <td style="padding: 8px 0; color: #555;">${task.remarks}</td>
            </tr>` : ''}
          </table>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://dk-apps-two.vercel.app" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Portal
            </a>
          </div>
        </div>
        <div style="background-color: #f9fafb; border-top: 1px solid #e0e0e0; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          This is an automated system notification from G.T. Design Studio.<br/>
          Please do not reply directly to this email.
        </div>
      </div>
    `;

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient.email,
          subject,
          html,
        }),
      });
    } catch (err) {
      console.error('Failed to send email alert:', err);
    }
  }
}
