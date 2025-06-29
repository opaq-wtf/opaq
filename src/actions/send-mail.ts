import { readFile } from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  email: string,
  link: string,
  full_name: string,
) {
  const templatePath = path.join(
    process.cwd(),
    "src",
    "template",
    "email-verification.html",
  );
  let html = await readFile(templatePath, "utf-8");

  html = html.replace("{{link}}", link);
  html = html.replace("{{user}}", full_name);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.NEXT_EMAIL_USER!,
      pass: process.env.NEXT_EMAIL_PASS!,
    },
  });

  await transporter
    .sendMail({
      from: `"OPAQ" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification",
      html: html,
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      throw new Error("Failed to send verification email");
    });
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  fullName: string,
) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.NEXT_EMAIL_USER!,
      pass: process.env.NEXT_EMAIL_PASS!,
    },
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pitch Verification OTP</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">OPAQ Pitch Verification</h1>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${fullName},</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          You've requested to make your pitch public. To verify this action, please use the following OTP:
        </p>

        <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0; color: #667eea; font-size: 32px; font-family: 'Courier New', monospace; letter-spacing: 4px;">
            ${otp}
          </h3>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          This OTP will expire in 10 minutes. If you didn't request this verification, please ignore this email.
        </p>
      </div>

      <div style="text-align: center; color: #666; font-size: 12px;">
        <p>© 2025 OPAQ. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  await transporter
    .sendMail({
      from: `"OPAQ" <${process.env.NEXT_EMAIL_USER}>`,
      to: email,
      subject: "OPAQ Pitch Verification - OTP Required",
      html: html,
    })
    .catch((error) => {
      console.error("Error sending OTP email:", error);
      throw new Error("Failed to send OTP email");
    });
}
