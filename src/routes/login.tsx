import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Phone,
  Chrome,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import {
  signInCustomerFn,
  resetPasswordFn,
  sendPasswordResetOtpFn,
  sendPhoneOtpFn,
  verifyPhoneOtpFn,
  validatePassword,
} from "@/lib/auth-server";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { setStoredUser } from "@/lib/auth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Driv A Long Private Limited" },
      { name: "description", content: "Sign in to book chauffeurs, manage trips, and access saved addresses." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"email" | "phone">("email");

  // Email sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP sign in state
  const [phone, setPhone] = useState("");
  const [otpChannel, setOtpChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [activeSentChannel, setActiveSentChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [phoneStep, setPhoneStep] = useState<"enter_phone" | "enter_otp">("enter_phone");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [previewOtpCode, setPreviewOtpCode] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);

  // Forgot password state (2-Step Email Verification)
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<"enter_email" | "enter_code">("enter_email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetPreviewOtp, setResetPreviewOtp] = useState<string | null>(null);
  const [resetTimer, setResetTimer] = useState(0);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  // Shared state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // OTP resend countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Email reset OTP countdown timer
  useEffect(() => {
    if (resetTimer <= 0) return;
    const interval = setInterval(() => {
      setResetTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resetTimer]);

  // Handle successful navigation after login
  const handleLoginSuccess = (user: any) => {
    setStoredUser(user);
    toast.success(`Welcome back, ${user.name}!`);
    const redirectParam =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirect")
        : null;

    if (user.role === "admin") {
      navigate({ to: "/admin" });
    } else if (user.role === "rider" || user.role === "driver") {
      navigate({ to: "/driver" });
    } else if (redirectParam) {
      navigate({ to: redirectParam });
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  // 1. Submit Email Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    // Instant Admin Login Fallback
    if (cleanEmail === "admin@drivalong.com" && password === "AdminSecretPass123!") {
      const adminUser = {
        id: "ADMIN_SYSTEM_01",
        name: "System Administrator",
        email: "admin@drivalong.com",
        phone: "+91 99999 99999",
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      setLoading(false);
      handleLoginSuccess(adminUser);
      return;
    }

    try {
      const res = await signInCustomerFn({
        data: { email: cleanEmail, password },
      });

      if (res && res.success && res.user) {
        handleLoginSuccess(res.user);
      } else {
        setErrorMsg(res?.message || "Invalid email or password.");
        toast.error(res?.message || "Sign in failed.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to sign in. Please verify your credentials.");
      toast.error("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Send Phone OTP (Supports WhatsApp & SMS)
  const handleSendPhoneOtp = async (e?: React.FormEvent, targetChannel: "whatsapp" | "sms" = otpChannel) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendPhoneOtpFn({
        data: { phone, channel: targetChannel },
      });

      if (res.success) {
        setPhoneStep("enter_otp");
        setPhoneOtp("");
        setPreviewOtpCode(res.previewOtp || null);
        setActiveSentChannel(res.channel || targetChannel);
        setOtpTimer(30);

        const channelLabel = (res.channel || targetChannel) === "whatsapp" ? "WhatsApp" : "SMS";
        if (res.previewOtp) {
          toast.success(`OTP sent to ${channelLabel} (${phone})! Code: ${res.previewOtp}`, {
            duration: 8000,
          });
        } else {
          toast.success(`Verification code dispatched to ${channelLabel} (${phone})`);
        }
      } else {
        setErrorMsg(res.message || "Failed to send OTP.");
        toast.error(res.message || "Could not send OTP.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to send OTP. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Verify Phone OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (phoneOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyPhoneOtpFn({
        data: { phone, otp: phoneOtp },
      });

      if (res.success && res.user) {
        handleLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || "Invalid or expired OTP code.");
        toast.error(res.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Send Password Reset Verification Code to Email
  const handleSendResetCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleanEmail = resetEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid registered email address.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await sendPasswordResetOtpFn({
        data: { email: cleanEmail },
      });

      if (res.success) {
        setResetStep("enter_code");
        setResetOtp("");
        setResetPreviewOtp(res.previewOtp || null);
        setResetTimer(30);

        toast.success(`Verification code sent to ${cleanEmail}. Please check your inbox.`);
      } else {
        setErrorMsg(res.message || "Failed to send verification code.");
        toast.error(res.message || "Could not send verification code.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to send reset code. Please check your connection.");
    } finally {
      setResetLoading(false);
    }
  };

  // 5. Submit Password Reset (Verifies 6-digit OTP code before updating in MongoDB)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!resetEmail || !resetOtp || !resetNewPassword || !resetConfirmPassword) {
      setErrorMsg("Please complete all fields, including the 6-digit verification code.");
      return;
    }

    if (resetOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMsg("New passwords do not match. Please verify.");
      return;
    }

    const check = validatePassword(resetNewPassword);
    if (!check.valid) {
      setErrorMsg(check.message || "Password does not meet requirements.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await resetPasswordFn({
        data: {
          email: resetEmail.toLowerCase().trim(),
          otp: resetOtp.trim(),
          newPassword: resetNewPassword,
        },
      });

      if (res.success) {
        toast.success("Password updated in database! You can now sign in.");
        setEmail(resetEmail);
        setPassword("");
        setResetSuccessMessage("Password successfully updated! Please sign in with your new password.");
        setShowForgotPassword(false);
        setResetStep("enter_email");
        setResetOtp("");
        setResetNewPassword("");
        setResetConfirmPassword("");
        setResetPreviewOtp(null);
      } else {
        setErrorMsg(res.message || "Failed to update password.");
        toast.error(res.message || "Password update failed.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to update password. Please verify your connection.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="bg-subtle py-14 min-h-[calc(100vh-4rem)] flex items-center">
      <div className="container-px mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
        {/* Left Column: Platform Highlights */}
        <div className="hidden md:block">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Welcome back
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Your chauffeur is waiting.
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Sign in to access your trip history, saved addresses, and live chauffeur bookings.
          </p>
          <ul className="mt-8 space-y-3 text-sm font-medium">
            {[
              "Instant WhatsApp & SMS OTP authentication",
              "MongoDB secured customer credentials",
              "Direct chauffeur booking with transparent base fares",
              "24/7 dedicated support via WhatsApp",
            ].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {x}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="rounded-3xl border border-border bg-background p-8 shadow-lift relative">
          {/* ============================================================== */}
          {/* VIEW: FORGOT PASSWORD / RESET PASSWORD IN DATABASE            */}
          {/* ============================================================== */}
          {showForgotPassword ? (
            <div>
              {resetStep === "enter_email" ? (
                /* ============================================================== */
                /* STEP 1: ENTER REGISTERED EMAIL                                */
                /* ============================================================== */
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setErrorMsg("");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign in
                    </button>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" /> MongoDB Secure
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Forgot Password</h2>
                      <p className="text-xs text-muted-foreground">
                        Step 1 of 2: Enter your registered email to receive a code.
                      </p>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSendResetCode} className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Registered Email Address
                      </label>
                      <InputRow
                        icon={<Mail className="h-4 w-4" />}
                        type="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We will send a 6-digit verification code to this email to ensure you own the account.
                    </p>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending Verification Code...
                        </>
                      ) : (
                        <>
                          Send 6-Digit Code <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* ============================================================== */
                /* STEP 2: ENTER CODE & SET NEW PASSWORD                         */
                /* ============================================================== */
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep("enter_email");
                        setErrorMsg("");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Change Email ({resetEmail})
                    </button>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      <Mail className="h-3 w-3" /> Email Verification
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Set New Password</h2>
                      <p className="text-xs text-muted-foreground">
                        Step 2 of 2: Verify the 6-digit code sent to {resetEmail}.
                      </p>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
                      {errorMsg}
                    </div>
                  )}


                  <form onSubmit={handleResetPasswordSubmit} className="mt-5 space-y-4">
                    {/* 6-Digit OTP Box */}
                    <div className="space-y-2 text-center">
                      <label className="block text-xs font-semibold text-muted-foreground">
                        Enter 6-Digit Verification Code
                      </label>
                      <div className="flex justify-center py-1">
                        <InputOTP
                          maxLength={6}
                          value={resetOtp}
                          onChange={(val) => setResetOtp(val)}
                        >
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="h-11 w-9 sm:w-11 text-base font-bold rounded-xl border" />
                            <InputOTPSlot index={1} className="h-11 w-9 sm:w-11 text-base font-bold rounded-xl border" />
                            <InputOTPSlot index={2} className="h-11 w-9 sm:w-11 text-base font-bold rounded-xl border" />
                            <InputOTPSlot index={3} className="h-11 w-9 sm:w-11 text-base font-bold rounded-xl border" />
                            <InputOTPSlot index={4} className="h-11 w-9 sm:w-11 text-base font-bold rounded-xl border" />
                            <InputOTPSlot index={5} className="h-11 w-9 sm:w-11 text-base font-bold rounded-xl border" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span>Didn't receive email code?</span>
                        {resetTimer > 0 ? (
                          <span className="font-semibold text-muted-foreground">
                            Resend in {resetTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendResetCode()}
                            disabled={resetLoading}
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" /> Resend Code
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        New Password
                      </label>
                      <div className="relative">
                        <InputRow
                          icon={<Lock className="h-4 w-4" />}
                          type={showResetPassword ? "text" : "password"}
                          placeholder="Enter strong new password"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Confirm New Password
                      </label>
                      <InputRow
                        icon={<Lock className="h-4 w-4" />}
                        type={showResetPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="rounded-xl border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">Password Requirements:</p>
                      <p>• At least 8 characters</p>
                      <p>• Uppercase (A-Z) & Lowercase (a-z) letters</p>
                      <p>• At least one number (0-9) & one symbol (!@#$%^&*)</p>
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading || resetOtp.length !== 6}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Verifying Code & Updating...
                        </>
                      ) : (
                        <>
                          Verify & Update Password <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* VIEW: STANDARD SIGN IN (EMAIL OR PHONE WITH OTP)               */
            /* ============================================================== */
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Continue with email password, phone OTP, or Google.
              </p>

              {/* Password Updated Success Banner */}
              {resetSuccessMessage && (
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{resetSuccessMessage}</span>
                </div>
              )}

              {/* Google Sign In */}
              <button
                type="button"
                onClick={() => toast.info("Google OAuth login simulation")}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background py-3 text-sm font-semibold transition hover:bg-muted cursor-pointer"
              >
                <Chrome className="h-4 w-4" /> Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
              </div>

              {/* Tabs: Email vs Phone */}
              <div className="inline-flex w-full rounded-2xl bg-muted p-1 text-sm mb-4">
                {(["email", "phone"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setErrorMsg("");
                    }}
                    className={`flex-1 rounded-xl py-2 font-medium capitalize transition cursor-pointer ${
                      mode === m ? "bg-background shadow-soft font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {m === "email" ? "Email Password" : "Phone OTP"}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
                  {errorMsg}
                </div>
              )}

              {/* MODE 1: EMAIL SIGN IN */}
              {mode === "email" && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <InputRow
                    icon={<Mail className="h-4 w-4" />}
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="relative">
                    <InputRow
                      icon={<Lock className="h-4 w-4" />}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" /> Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setShowForgotPassword(true);
                        setErrorMsg("");
                        setResetSuccessMessage("");
                      }}
                      className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        Sign in <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* MODE 2: PHONE NUMBER OTP SIGN IN (WHATSAPP & SMS) */}
              {mode === "phone" && (
                <div>
                  {phoneStep === "enter_phone" ? (
                    <form onSubmit={(e) => handleSendPhoneOtp(e, otpChannel)} className="space-y-4">
                      {/* Delivery Channel Selector */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                          Delivery Channel
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setOtpChannel("whatsapp")}
                            className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition cursor-pointer ${
                              otpChannel === "whatsapp"
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <WhatsAppIcon className="h-4 w-4 fill-current text-[#25D366]" />
                            <span>WhatsApp OTP</span>
                            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                              Free
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOtpChannel("sms")}
                            className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition cursor-pointer ${
                              otpChannel === "sms"
                                ? "border-primary/40 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>Standard SMS</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                          Mobile Number
                        </label>
                        <InputRow
                          icon={<Phone className="h-4 w-4" />}
                          type="tel"
                          placeholder="+91 98450 12345"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {otpChannel === "whatsapp"
                          ? "We will send an automated 6-digit verification code to your WhatsApp."
                          : "We will send an automated 6-digit verification code via cellular SMS."}
                      </p>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold shadow-soft transition disabled:opacity-50 cursor-pointer ${
                          otpChannel === "whatsapp"
                            ? "bg-[#25D366] text-white hover:bg-[#20ba59]"
                            : "bg-primary text-primary-foreground hover:brightness-110"
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...
                          </>
                        ) : otpChannel === "whatsapp" ? (
                          <>
                            <WhatsAppIcon className="h-4 w-4 fill-current" /> Send OTP via WhatsApp{" "}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Send OTP via SMS <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Enter OTP */
                    <form onSubmit={handleVerifyPhoneOtp} className="space-y-5">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneStep("enter_phone");
                            setErrorMsg("");
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" /> Change Number ({phone})
                        </button>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            activeSentChannel === "whatsapp"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {activeSentChannel === "whatsapp" ? (
                            <>
                              <WhatsAppIcon className="h-3 w-3 fill-current text-[#25D366]" /> WhatsApp Verification
                            </>
                          ) : (
                            <>
                              <Phone className="h-3 w-3" /> SMS Verification
                            </>
                          )}
                        </span>
                      </div>

                      {/* Development / Demo OTP Helper Badge */}
                      {previewOtpCode && (
                        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs">
                          <div>
                            <span className="font-semibold text-primary">Demo OTP Code: </span>
                            <span className="font-mono font-bold tracking-wider text-foreground">
                              {previewOtpCode}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPhoneOtp(previewOtpCode)}
                            className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                          >
                            Auto-Fill
                          </button>
                        </div>
                      )}

                      <div className="space-y-2 text-center">
                        <label className="block text-xs font-semibold text-muted-foreground">
                          Enter 6-Digit Verification Code
                        </label>
                        <div className="flex justify-center py-2">
                          <InputOTP
                            maxLength={6}
                            value={phoneOtp}
                            onChange={(val) => setPhoneOtp(val)}
                          >
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot index={0} className="h-12 w-10 sm:w-12 text-base font-bold rounded-xl border" />
                              <InputOTPSlot index={1} className="h-12 w-10 sm:w-12 text-base font-bold rounded-xl border" />
                              <InputOTPSlot index={2} className="h-12 w-10 sm:w-12 text-base font-bold rounded-xl border" />
                              <InputOTPSlot index={3} className="h-12 w-10 sm:w-12 text-base font-bold rounded-xl border" />
                              <InputOTPSlot index={4} className="h-12 w-10 sm:w-12 text-base font-bold rounded-xl border" />
                              <InputOTPSlot index={5} className="h-12 w-10 sm:w-12 text-base font-bold rounded-xl border" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-1 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>
                            Didn't receive code on {activeSentChannel === "whatsapp" ? "WhatsApp" : "SMS"}?
                          </span>
                          {otpTimer > 0 ? (
                            <span className="font-semibold text-muted-foreground">
                              Resend in {otpTimer}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSendPhoneOtp(undefined, activeSentChannel)}
                              disabled={loading}
                              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3" /> Resend OTP
                            </button>
                          )}
                        </div>

                        {/* Alternate delivery channel option */}
                        {otpTimer === 0 && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const nextChannel = activeSentChannel === "whatsapp" ? "sms" : "whatsapp";
                                handleSendPhoneOtp(undefined, nextChannel);
                              }}
                              disabled={loading}
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                            >
                              {activeSentChannel === "whatsapp" ? (
                                <>
                                  <Phone className="h-3 w-3" /> Try sending via SMS instead
                                </>
                              ) : (
                                <>
                                  <WhatsAppIcon className="h-3.5 w-3.5 fill-current text-[#25D366]" /> Try sending via WhatsApp instead
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || phoneOtp.length !== 6}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Verifying OTP...
                          </>
                        ) : (
                          <>
                            Verify & Sign In <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              <p className="mt-6 text-center text-sm text-muted-foreground">
                New to Driv A Long?{" "}
                <Link
                  to="/signup"
                  search={
                    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redirect")
                      ? { redirect: new URLSearchParams(window.location.search).get("redirect")! }
                      : undefined
                  }
                  className="font-semibold text-primary hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputRow({ icon, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:shadow-ring">
      <span className="text-muted-foreground">{icon}</span>
      <input {...rest} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
    </div>
  );
}
