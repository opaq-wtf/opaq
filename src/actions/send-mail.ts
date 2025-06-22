import { readFile } from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, link: string, full_name: string) {
    const templatePath = path.join(process.cwd(), "src", "template", "email-verification.html");
    let html = await readFile(templatePath, 'utf-8');

    html = html.replace('{{link}}', link);
    html = html.replace('{{user}}', full_name)

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.NEXT_EMAIL_USER!,
            pass: process.env.NEXT_EMAIL_PASS!,
        }
    });

    await transporter.sendMail({
        from: `"OPAQ" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification',
        html: html,
    }).catch(error => {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email");
    });
}