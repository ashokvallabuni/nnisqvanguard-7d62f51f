import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";
import { z } from "zod";

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM || "ashokvallabuni@nisqvanguard.in",
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { error: true, message: String(err) };
  }
};

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .validator((d: { email: string; name: string }) => d)
  .handler(async ({ data }) => {
    return sendEmail(
      data.email,
      "Welcome to NISQ Vanguard",
      `<div style="font-family: sans-serif; color: #050b14; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 2rem; border-radius: 8px; border: 1px solid #16283a;">
        <h1 style="color: #0a7cff; margin-top: 0;">Welcome to NISQ Vanguard, ${data.name}!</h1>
        <p style="color: #64748b; font-size: 16px; line-height: 1.5;">We are thrilled to have you onboard. Discover our cyber range, track your skills, and engage with the community.</p>
        <a href="https://nisqvanguard.in/login" style="display: inline-block; background-color: #0a7cff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 1.5rem;">Login Now</a>
      </div>`
    );
  });

export const sendNewLoginEmail = createServerFn({ method: "POST" })
  .validator((d: { email: string; time?: string }) => d)
  .handler(async ({ data }) => {
    return sendEmail(
      data.email,
      "New login to your NISQ Vanguard account",
      `<div style="font-family: sans-serif; color: #050b14; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 2rem; border-radius: 8px; border: 1px solid #16283a;">
        <h1 style="color: #0a7cff; margin-top: 0;">New Login Alert</h1>
        <p style="color: #64748b; font-size: 16px; line-height: 1.5;">We noticed a new login to your NISQ Vanguard account on ${data.time || new Date().toLocaleString()}.</p>
        <p style="color: #64748b; font-size: 16px; line-height: 1.5;">If this was you, you can safely ignore this email.</p>
      </div>`
    );
  });
