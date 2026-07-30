import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "./mongodb";
import Customer from "../models/Customer";

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

// Server function for Customer Sign Up (Stores user data in MongoDB)
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

      const bcryptModule = await import("bcryptjs");
      const bcrypt = bcryptModule.default || bcryptModule;

      // Connect to MongoDB
      await connectToDatabase();

      // Check if user with email already exists in MongoDB
      const existingUser = await Customer.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return { success: false, message: "An account with this email already exists." };
      }

      // Hash password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new Customer in MongoDB
      const newCustomer = await Customer.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        role: "customer",
      });

      const userResponse: AuthUser = {
        id: newCustomer._id.toString(),
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        role: newCustomer.role,
        createdAt: newCustomer.createdAt.toISOString(),
      };

      return {
        success: true,
        message: "Account created successfully!",
        user: userResponse,
      };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return {
        success: false,
        message: error?.message || "Failed to create account in database.",
      };
    }
  });

// Server function for Customer Sign In (Authenticates user against MongoDB)
export const signInCustomerFn = createServerFn({ method: "POST" })
  .validator((data: SignInPayload) => data)
  .handler(async ({ data }): Promise<AuthResponse> => {
    const { email, password } = data || {};
    const cleanEmail = email ? email.toLowerCase().trim() : "";

    try {
      if (!email || !password) {
        return { success: false, message: "Please provide email and password." };
      }

      // System Administrator Fallback Check for Vercel / Production environment
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

      const bcryptModule = await import("bcryptjs");
      const bcrypt = bcryptModule.default || bcryptModule;

      // Connect to MongoDB
      await connectToDatabase();

      // Find customer by email in MongoDB
      const customer = await Customer.findOne({ email: cleanEmail });
      if (!customer || !customer.password) {
        return { success: false, message: "Invalid email or password." };
      }

      // Verify password match using bcryptjs
      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) {
        return { success: false, message: "Invalid email or password." };
      }

      const userResponse: AuthUser = {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
        createdAt: customer.createdAt ? customer.createdAt.toISOString() : new Date().toISOString(),
      };

      return {
        success: true,
        message: "Signed in successfully!",
        user: userResponse,
      };
    } catch (error: any) {
      console.error("Sign in error:", error);
      const cleanEmail = email.toLowerCase().trim();
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
      return {
        success: false,
        message: error?.message || "Failed to sign in. Please try again.",
      };
    }
  });
