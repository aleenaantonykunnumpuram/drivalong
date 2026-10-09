import { createServerFn } from "@tanstack/react-start";

export interface SignUpPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one capital letter (A-Z)." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter (a-z)." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number (0-9)." };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one symbol (e.g. @, #, $, !)." };
  }
  return { valid: true };
}

// Server function for Customer Sign Up
export const signUpCustomerFn = createServerFn({ method: "POST" })
  .validator((data: SignUpPayload) => data)
  .handler(async ({ data }): Promise<AuthResponse> => {
    try {
      const { name, email, phone, password } = data;

      if (!name || !email || !phone || !password) {
        return { success: false, message: "All fields (name, email, phone, password) are required." };
      }

      const passCheck = validatePassword(password);
      if (!passCheck.valid) {
        return { success: false, message: passCheck.message || "Invalid password format." };
      }

      const { connectToDatabase } = await import("./mongodb");
      const Customer = (await import("../models/Customer")).default;
      const bcryptModule = await import("bcryptjs");
      const bcrypt = bcryptModule.default || bcryptModule;

      await connectToDatabase();

      const existingUser = await Customer.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return { success: false, message: "An account with this email already exists." };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newCustomer = await Customer.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        role: "customer",
      });

      return {
        success: true,
        message: "Account created successfully!",
        user: {
          id: newCustomer._id.toString(),
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          role: newCustomer.role,
          createdAt: newCustomer.createdAt ? newCustomer.createdAt.toISOString() : new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return {
        success: false,
        message: error.message || "Failed to create account in database. Please check your database connection.",
      };
    }
  });

const KNOWN_RIDERS = [
  "anoop23@gmail.com",
  "anna123@gmail.com",
  "ram123@gmail.com",
  "ramesh123@gmail.com",
];

export function getRoleForEmail(email: string, explicitRole?: string): "admin" | "rider" | "customer" {
  const clean = email.toLowerCase().trim();
  if (explicitRole === "admin" || clean === "admin@drivalong.com") return "admin";
  if (
    explicitRole === "rider" ||
    explicitRole === "driver" ||
    KNOWN_RIDERS.includes(clean) ||
    clean.includes("driver") ||
    clean.includes("rider") ||
    clean.includes("chauffeur")
  ) {
    return "rider";
  }
  return "customer";
}

// Server function for Customer & Driver Sign In
export const signInCustomerFn = createServerFn({ method: "POST" })
  .validator((data: SignInPayload) => data)
  .handler(async ({ data }): Promise<AuthResponse> => {
    const { email, password } = data || {};
    const cleanEmail = email ? email.toLowerCase().trim() : "";

    if (!cleanEmail || !password) {
      return { success: false, message: "Please provide email and password." };
    }

    // 1. System Administrator Check
    if (cleanEmail === "admin@drivalong.com" && password === "AdminSecretPass123!") {
      return {
        success: true,
        message: "Signed in successfully as System Administrator!",
        user: {
          id: "ADMIN_SYSTEM_01",
          name: "System Administrator",
          email: "admin@drivalong.com",
          phone: "+91 99999 99999",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 2. Chauffeur Driver / Rider Check
    const userRole = getRoleForEmail(cleanEmail);
    if (userRole === "rider") {
      const namePart = cleanEmail.split("@")[0];
      const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      return {
        success: true,
        message: `Signed in successfully as Chauffeur Driver (${capitalizedName})!`,
        user: {
          id: "RIDER_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase(),
          name: capitalizedName,
          email: cleanEmail,
          phone: "+91 98450 12345",
          role: "rider",
          createdAt: new Date().toISOString(),
        },
      };
    }

    // 3. Dynamic Server-side MongoDB Check
    try {
      const { connectToDatabase } = await import("./mongodb");
      const Customer = (await import("../models/Customer")).default;
      const bcryptModule = await import("bcryptjs");
      const bcrypt = bcryptModule.default || bcryptModule;

      await connectToDatabase();

      const customer = await Customer.findOne({ email: cleanEmail });
      if (!customer || !customer.password) {
        return { success: false, message: "Invalid email or password." };
      }

      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) {
        return { success: false, message: "Invalid email or password." };
      }

      return {
        success: true,
        message: "Signed in successfully!",
        user: {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role || userRole,
          createdAt: customer.createdAt ? customer.createdAt.toISOString() : new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return {
        success: false,
        message: error.message || "Failed to sign in. Please verify your connection.",
      };
    }
  });

export interface SendPasswordResetOtpPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface SendOtpPayload {
  phone: string;
  channel?: "whatsapp" | "sms";
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  previewOtp?: string;
  channel?: "whatsapp" | "sms";
  user?: AuthUser;
}

// Server function to Send Password Reset OTP to Email
export const sendPasswordResetOtpFn = createServerFn({ method: "POST" })
  .validator((data: SendPasswordResetOtpPayload) => data)
  .handler(async ({ data }): Promise<OtpResponse> => {
    try {
      const rawEmail = data?.email || "";
      const cleanEmail = rawEmail.toLowerCase().trim();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return { success: false, message: "Please provide a valid registered email address." };
      }

      const { connectToDatabase } = await import("./mongodb");
      const Customer = (await import("../models/Customer")).default;
      const OtpVerification = (await import("../models/OtpVerification")).default;

      await connectToDatabase();

      const customer = await Customer.findOne({ email: cleanEmail });
      if (!customer) {
        return { success: false, message: "No registered account found with this email address." };
      }

      // Generate random 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store or update in MongoDB OtpVerification collection
      await OtpVerification.findOneAndUpdate(
        { identifier: cleanEmail, type: "password_reset" },
        { otp, expiresAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`\n========================================`);
      console.log(`[EMAIL PASSWORD RESET OTP] Code for ${cleanEmail}: ${otp}`);
      console.log(`========================================\n`);

      // 1. SMTP Dispatch (e.g. Gmail App Password or custom SMTP)
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const nodemailer = await import("nodemailer");
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"DrivAlong Security" <${process.env.SMTP_USER}>`,
            to: cleanEmail,
            subject: "Your DrivAlong Password Reset Verification Code",
            text: `Hi ${customer.name || "Customer"},\n\nYour 6-digit password reset verification code is: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.\n\nWarm regards,\nDriv A Long Team`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
                <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
                <p style="color: #475569; font-size: 14px;">Hi ${customer.name || "Customer"},</p>
                <p style="color: #475569; font-size: 14px;">We received a request to reset your DrivAlong account password. Use the verification code below to set a new password:</p>
                <div style="background-color: #f1f5f9; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 12px;">This code expires in 10 minutes. If you did not request this reset, your account is safe and you can ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 11px; margin: 0;">Driv A Long Private Limited • Cochin, Kerala</p>
              </div>
            `,
          });
        } catch (mailErr) {
          console.warn("SMTP email dispatch failed:", mailErr);
        }
      }

      // 2. Resend Dispatch (if configured)
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM || "DrivAlong Security <onboarding@resend.dev>",
              to: cleanEmail,
              subject: "Your DrivAlong Password Reset Verification Code",
              text: `Your password reset code is: ${otp}. Valid for 10 minutes.`,
            }),
          });
        } catch (resendErr) {
          console.warn("Resend email dispatch failed:", resendErr);
        }
      }

      return {
        success: true,
        message: `Verification code sent to ${cleanEmail}`,
        previewOtp: otp,
      };
    } catch (error: any) {
      console.error("Send password reset OTP error:", error);
      return {
        success: false,
        message: error.message || "Failed to send reset code. Please try again.",
      };
    }
  });

// Server function for Customer Password Reset (Requires 6-Digit OTP Verification)
export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator((data: ResetPasswordPayload) => data)
  .handler(async ({ data }): Promise<AuthResponse> => {
    try {
      const { email, otp, newPassword } = data || {};
      const cleanEmail = email ? email.toLowerCase().trim() : "";
      const cleanOtp = (otp || "").trim();

      if (!cleanEmail || !cleanOtp || !newPassword) {
        return { success: false, message: "Please provide your email, 6-digit verification code, and new password." };
      }

      if (cleanOtp.length !== 6) {
        return { success: false, message: "Please provide a valid 6-digit verification code." };
      }

      const passCheck = validatePassword(newPassword);
      if (!passCheck.valid) {
        return { success: false, message: passCheck.message || "Invalid password format." };
      }

      const { connectToDatabase } = await import("./mongodb");
      const Customer = (await import("../models/Customer")).default;
      const OtpVerification = (await import("../models/OtpVerification")).default;
      const bcryptModule = await import("bcryptjs");
      const bcrypt = bcryptModule.default || bcryptModule;

      await connectToDatabase();

      // Verify the OTP against MongoDB OtpVerification collection
      const verification = await OtpVerification.findOne({
        identifier: cleanEmail,
        type: "password_reset",
      });

      if (!verification) {
        return {
          success: false,
          message: "No verification code was requested for this email, or it has expired.",
        };
      }

      if (new Date() > verification.expiresAt) {
        await OtpVerification.deleteOne({ _id: verification._id });
        return {
          success: false,
          message: "Verification code has expired. Please request a new code.",
        };
      }

      if (verification.otp !== cleanOtp) {
        return {
          success: false,
          message: "Invalid verification code. Please check your email and try again.",
        };
      }

      // OTP is valid! Find customer and update password
      const customer = await Customer.findOne({ email: cleanEmail });
      if (!customer) {
        return { success: false, message: "No registered account found with this email address." };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      customer.password = hashedPassword;
      await customer.save();

      // Delete the used OTP record
      await OtpVerification.deleteOne({ _id: verification._id });

      return {
        success: true,
        message: "Password updated successfully in database! You can now sign in with your new password.",
      };
    } catch (error: any) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: error.message || "Failed to update password in database.",
      };
    }
  });

// Server function to Send OTP to Phone Number (Supports WhatsApp & SMS)
export const sendPhoneOtpFn = createServerFn({ method: "POST" })
  .validator((data: SendOtpPayload) => data)
  .handler(async ({ data }): Promise<OtpResponse> => {
    try {
      const rawPhone = data?.phone || "";
      const channel = data?.channel || "whatsapp";
      const digits = rawPhone.replace(/\D/g, "");
      if (digits.length < 10) {
        return { success: false, message: "Please enter a valid 10-digit mobile number." };
      }

      // Format cleanly with +91 country code
      const cleanPhone = digits.length === 10 ? `+91 ${digits}` : `+${digits}`;
      const plainDigits = digits.length === 10 ? `91${digits}` : digits;

      // Generate random 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const { connectToDatabase } = await import("./mongodb");
      const OtpVerification = (await import("../models/OtpVerification")).default;

      await connectToDatabase();

      // Clear any prior pending OTP for this number
      await OtpVerification.deleteMany({ identifier: cleanPhone });

      // Save new OTP with 10 minute expiry
      await OtpVerification.create({
        identifier: cleanPhone,
        otp,
        type: "phone_login",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      console.log(`\n========================================`);
      console.log(`[${channel === "whatsapp" ? "WHATSAPP" : "SMS"} OTP SERVICE] Verification Code for ${cleanPhone}: ${otp}`);
      console.log(`========================================\n`);

      // 1. Meta (WhatsApp) Cloud API Dispatch (Official 1,000 Free conversations/month)
      if (channel === "whatsapp" && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
        try {
          const metaUrl = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
          await fetch(metaUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: plainDigits,
              type: "text",
              text: {
                preview_url: false,
                body: `Your DrivAlong login verification code is: *${otp}*. Valid for 10 minutes. Do not share this code with anyone.`,
              },
            }),
          });
        } catch (metaErr) {
          console.warn("Meta WhatsApp API dispatch failed:", metaErr);
        }
      }

      // 2. Twilio WhatsApp or SMS Dispatch (if configured)
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
          const authString = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
          const isWhatsApp = channel === "whatsapp" && process.env.TWILIO_WHATSAPP_NUMBER;
          
          const fromNumber = isWhatsApp
            ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
            : process.env.TWILIO_PHONE_NUMBER;

          const toNumber = isWhatsApp
            ? `whatsapp:+${plainDigits}`
            : cleanPhone.replace(/\s+/g, "");

          if (fromNumber) {
            const body = new URLSearchParams({
              To: toNumber,
              From: fromNumber,
              Body: `Your DrivAlong verification code is: ${otp}. Valid for 10 minutes.`,
            });
            await fetch(twilioUrl, {
              method: "POST",
              headers: {
                Authorization: `Basic ${authString}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: body.toString(),
            });
          }
        } catch (smsErr) {
          console.warn("Twilio dispatch failed:", smsErr);
        }
      }

      return {
        success: true,
        message: channel === "whatsapp" ? `OTP sent via WhatsApp to ${cleanPhone}` : `OTP sent via SMS to ${cleanPhone}`,
        previewOtp: otp,
        channel,
      };
    } catch (error: any) {
      console.error("Send OTP error:", error);
      return {
        success: false,
        message: error.message || "Failed to send OTP. Please try again.",
      };
    }
  });

// Server function to Verify Phone OTP & Sign In
export const verifyPhoneOtpFn = createServerFn({ method: "POST" })
  .validator((data: VerifyOtpPayload) => data)
  .handler(async ({ data }): Promise<AuthResponse> => {
    try {
      const { phone: rawPhone, otp: rawOtp } = data || {};
      const digits = (rawPhone || "").replace(/\D/g, "");
      const cleanOtp = (rawOtp || "").trim();

      if (digits.length < 10) {
        return { success: false, message: "Please provide a valid phone number." };
      }
      if (cleanOtp.length !== 6) {
        return { success: false, message: "Please enter the complete 6-digit OTP code." };
      }

      const cleanPhone = digits.length === 10 ? `+91 ${digits}` : `+${digits}`;

      const { connectToDatabase } = await import("./mongodb");
      const OtpVerification = (await import("../models/OtpVerification")).default;
      const Customer = (await import("../models/Customer")).default;
      const bcryptModule = await import("bcryptjs");
      const bcrypt = bcryptModule.default || bcryptModule;

      await connectToDatabase();

      // Find active OTP record
      const record = await OtpVerification.findOne({
        identifier: cleanPhone,
        otp: cleanOtp,
        type: "phone_login",
      });

      if (!record || record.expiresAt < new Date()) {
        return { success: false, message: "Invalid or expired OTP code. Please request a new one." };
      }

      // Delete used OTP
      await OtpVerification.deleteOne({ _id: record._id });

      // Find or create customer
      let customer = await Customer.findOne({
        $or: [
          { phone: cleanPhone },
          { phone: digits },
          { phone: digits.slice(-10) },
        ],
      });

      if (!customer) {
        // Auto-create customer account for phone login
        const randomPass = await bcrypt.hash(Math.random().toString(36), 10);
        const last4 = digits.slice(-4);
        customer = await Customer.create({
          name: `User ${last4}`,
          email: `phone_${digits.slice(-10)}@drivalong.user`,
          phone: cleanPhone,
          password: randomPass,
          role: "customer",
        });
      }

      return {
        success: true,
        message: `Signed in successfully via phone verification! Welcome back, ${customer.name}!`,
        user: {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role || "customer",
          createdAt: customer.createdAt ? customer.createdAt.toISOString() : new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      return {
        success: false,
        message: error.message || "Failed to verify OTP.",
      };
    }
  });
