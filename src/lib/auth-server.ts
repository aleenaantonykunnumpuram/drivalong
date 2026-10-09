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

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}

export interface SendOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  previewOtp?: string;
  user?: AuthUser;
}

// Server function for Customer Password Reset (Edits password in MongoDB)
export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator((data: ResetPasswordPayload) => data)
  .handler(async ({ data }): Promise<AuthResponse> => {
    try {
      const { email, newPassword } = data || {};
      const cleanEmail = email ? email.toLowerCase().trim() : "";

      if (!cleanEmail || !newPassword) {
        return { success: false, message: "Please provide both your registered email and a new password." };
      }

      const passCheck = validatePassword(newPassword);
      if (!passCheck.valid) {
        return { success: false, message: passCheck.message || "Invalid password format." };
      }

      const { connectToDatabase } = await import("./mongodb");
      const Customer = (await import("../models/Customer")).default;
      const bcryptModule = await import("bcryptjs");
      const bcrypt = bcryptModule.default || bcryptModule;

      await connectToDatabase();

      const customer = await Customer.findOne({ email: cleanEmail });
      if (!customer) {
        return { success: false, message: "No registered account found with this email address." };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      customer.password = hashedPassword;
      await customer.save();

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

// Server function to Send OTP to Phone Number
export const sendPhoneOtpFn = createServerFn({ method: "POST" })
  .validator((data: SendOtpPayload) => data)
  .handler(async ({ data }): Promise<OtpResponse> => {
    try {
      const rawPhone = data?.phone || "";
      const digits = rawPhone.replace(/\D/g, "");
      if (digits.length < 10) {
        return { success: false, message: "Please enter a valid 10-digit mobile number." };
      }

      // Format cleanly with +91 country code
      const cleanPhone = digits.length === 10 ? `+91 ${digits}` : `+${digits}`;

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
      console.log(`[SMS OTP SERVICE] Verification Code for ${cleanPhone}: ${otp}`);
      console.log(`========================================\n`);

      // If Twilio credentials are configured in .env, send real SMS
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const authString = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
          const body = new URLSearchParams({
            To: cleanPhone.replace(/\s+/g, ""),
            From: process.env.TWILIO_PHONE_NUMBER,
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
        } catch (smsErr) {
          console.warn("Twilio SMS dispatch failed:", smsErr);
        }
      }

      return {
        success: true,
        message: `OTP code sent to ${cleanPhone}`,
        previewOtp: otp,
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
