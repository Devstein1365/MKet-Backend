// ===================================
// EMAIL SERVICE (Nodemailer)
// ===================================
// Sends emails for:
// - Email verification
// - Password reset
// - Notifications (future)
//
// Setup: Configure Gmail SMTP in .env file
// ===================================

import nodemailer from "nodemailer";

// ===================================
// CREATE EMAIL TRANSPORTER
// ===================================
// Gmail SMTP configuration
// For production, use a dedicated email service like SendGrid, Mailgun, or AWS SES
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = (process.env.EMAIL_PASSWORD || "").replace(/\s+/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser, // Your Gmail address
      pass: emailPassword, // Gmail App Password (whitespace removed automatically)
    },
    // Optimization for high-latency connections (like Render)
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
};

// ===================================
// SEND VERIFICATION EMAIL
// ===================================
// Sends email with verification link to confirm user's email address
// Sends email with verification link to confirm user's email address
export const sendVerificationEmail = async (
  email,
  userName,
  verificationToken,
) => {
  console.log(
    `[EmailService] Attempting to send verification email to: ${email}`,
  );
  try {
    const transporter = createTransporter();

    // Skip verification in production to speed up requests
    if (process.env.NODE_ENV !== "production") {
      console.log("[EmailService] Verifying SMTP connection...");
      await transporter.verify();
      console.log("[EmailService] SMTP connection verified successfully");
    }

    // Use the first URL from FRONTEND_URL for the link
    const origins = (process.env.FRONTEND_URL || "http://localhost:1365").split(
      ",",
    );
    const frontendUrl = origins[0];
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    const mailOptions = {
      from: {
        name: "MKET Marketplace",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Verify Your MKET Account 📧",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #7E22CE 0%, #EC4899 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #7E22CE !important;
              color: white !important;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 Welcome to MKET!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Thank you for signing up with MKET - the FUTMINNA student marketplace! 🎉</p>
            
            <p>Please verify your email address to unlock all features and start buying/selling with your fellow students.</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button" style="color: white; background-color: #7E22CE;">Verify My Email</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
            
            <p style="margin-top: 30px;">
              <strong>⚠️ This link will expire in 24 hours.</strong>
            </p>
            
            <p>If you didn't create an account with MKET, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 MKET Marketplace - FUTMINNA Student Platform</p>
            <p>Built for students, by students 💙</p>
          </div>
        </body>
        </html>
      `,
    };

    console.log("[EmailService] Sending mail...");
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Success! Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[EmailService] DETAILED ERROR:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack,
    });
    throw error;
  }
};

// ===================================
// SEND PASSWORD RESET EMAIL
// ===================================
// Sends email with password reset link
export const sendPasswordResetEmail = async (email, userName, resetToken) => {
  try {
    const transporter = createTransporter();

    // Skip verification in production to speed up requests
    if (process.env.NODE_ENV !== "production") {
      await transporter.verify();
    }

    // Frontend reset password URL (use the first URL from FRONTEND_URL for the link)
    const origins = (process.env.FRONTEND_URL || "http://localhost:1365").split(
      ",",
    );
    const frontendUrl = origins[0];
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: {
        name: "MKET Marketplace",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: "Reset Your MKET Password 🔐",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #EF4444;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning {
              background: #FEF2F2;
              border-left: 4px solid #EF4444;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>We received a request to reset your MKET account password.</p>
            
            <p>Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
            
            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important:</strong></p>
              <p style="margin: 5px 0 0 0;">This link will expire in 1 hour for security reasons.</p>
            </div>
            
            <p style="margin-top: 30px;">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <p style="color: #666; font-size: 14px;">
              For security reasons, never share this link with anyone.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 MKET Marketplace - FUTMINNA Student Platform</p>
            <p>Need help? Contact support at <a href="mailto:${process.env.EMAIL_USER}">support@mket.com</a></p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      "❌ Error sending password reset email:",
      error?.response || error?.message || error,
    );
    throw error;
  }
};

// ===================================
// SEND NOTIFICATION EMAIL
// ===================================
// Sends general notification emails (for future use)
export const sendNotificationEmail = async (
  email,
  userName,
  subject,
  message,
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "MKET Marketplace",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #7E22CE 0%, #EC4899 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔔 MKET Notification</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            ${message}
            
          </div>
          <div class="footer">
            <p>© 2026 MKET Marketplace - FUTMINNA Student Platform</p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Notification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending notification email:", error);
    throw new Error("Failed to send notification email");
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
};
