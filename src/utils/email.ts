import nodemailer from "nodemailer";

export type EmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

let transporter: nodemailer.Transporter | null = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // verify transporter connection on startup (best-effort)
  transporter.verify().then(() => {
    console.log("SMTP transporter ready");
  }).catch((err) => {
    console.warn("SMTP transporter verification failed:", err.message || err);
    transporter = null;
  });
}

export const sendEmail = async (opts: EmailOptions) => {
  const from = process.env.EMAIL_FROM || "no-reply@example.com";

  if (!transporter) {
    console.log("--- sendEmail fallback (no SMTP configured) ---");
    console.log("From:", from);
    console.log("To:", opts.to);
    console.log("Subject:", opts.subject);
    if (opts.text) console.log("Text:", opts.text);
    if (opts.html) console.log("HTML:", opts.html);
    return;
  }

  const info = await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });

  console.log("Email sent: %s", info.messageId);
  return info;
};

export default sendEmail;
