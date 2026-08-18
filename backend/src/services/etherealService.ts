import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  senderEmail?: string;
}

let transporter: nodemailer.Transporter | null = null;
let defaultSender: string = 'reachinbox@ethereal.email';

/**
 * Initializes Ethereal Fake SMTP Transporter
 */
export async function getEtherealTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const envUser = process.env.ETHEREAL_USER;
  const envPass = process.env.ETHEREAL_PASS;

  if (envUser && envPass) {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: envUser,
        pass: envPass,
      },
    });
    defaultSender = envUser;
    console.log(`✉️ Using configured Ethereal SMTP account: ${envUser}`);
  } else {
    // Dynamically generate a fake Ethereal account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    defaultSender = testAccount.user;
    console.log(`✉️ Generated new Ethereal Test SMTP Account: ${testAccount.user}`);
  }

  return transporter;
}

/**
 * Sends an email via Ethereal Fake SMTP and returns the message preview URL
 */
export async function sendEmailViaEthereal(params: SendEmailParams): Promise<{ messageId: string; previewUrl: string }> {
  const mailTransporter = await getEtherealTransporter();

  const mailOptions = {
    from: `"ReachInbox Outreach" <${params.senderEmail || defaultSender}>`,
    to: params.to,
    subject: params.subject,
    text: params.body,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4F46E5;">${params.subject}</h2>
            <div style="font-size: 15px; color: #333; line-height: 1.6;">${params.body.replace(/\n/g, '<br/>')}</div>
            <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;"/>
            <p style="font-size: 12px; color: #888;">Sent via ReachInbox Scheduler Demo (Ethereal Fake SMTP)</p>
          </div>`,
  };

  const info = await mailTransporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info) || `https://ethereal.email/message/${info.messageId}`;

  return {
    messageId: info.messageId,
    previewUrl: previewUrl.toString(),
  };
}
