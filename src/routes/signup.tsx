import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { signUpCustomerFn } from "@/lib/auth-server";
import { setStoredUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Driv A Long Private Limited" },
      { name: "description", content: "Create an account to book professional chauffeurs, track trips, and manage bookings." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const passwordRules = [
    { label: "At least 8 characters long", test: (p: string) => p.length >= 8 },
    { label: "At least 1 uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
    { label: "At least 1 lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
    { label: "At least 1 number (0-9)", test: (p: string) => /[0-9]/.test(p) },
    { label: "At least 1 special symbol (e.g. @, #, $, !)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Please enter your phone number.");
      return;
    }

    const failedRule = passwordRules.find((rule) => !rule.test(formData.password));
    if (failedRule) {
      setErrorMsg(`Invalid Password: ${failedRule.label}`);
      toast.warning(`Password Warning: ${failedRule.label}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      toast.warning("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await signUpCustomerFn({
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
      });

      if (res.success && res.user) {
        setStoredUser(res.user);
        toast.success("Account created successfully! Saved to MongoDB.");
        navigate({ to: "/" });
      } else {
        setErrorMsg(res.message || "Failed to create account.");
        toast.error(res.message || "Sign up failed.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during sign up.");
      toast.error("Sign up failed. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-subtle py-14 min-h-[calc(100vh-4rem)] flex items-center">
      <div className="container-px mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
        {/* Left Column Info */}
        <div className="hidden md:block">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Get Started</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Create your Driv A Long account.</h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Sign up today to enjoy verified personal drivers, live ride tracking, instant booking, and priority service.
          </p>
          <ul className="mt-8 space-y-4 text-sm font-medium">
            {[
              "Verified & background-checked professional drivers",
              "Customer data stored securely in MongoDB",
              "Instant trip confirmation & real-time tracking",
              "24/7 dedicated concierge & booking support",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sign Up Form Card */}
        <div className="rounded-3xl border border-border bg-background p-8 shadow-lift">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Create Account</h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" /> Customer Portal
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Enter your details to register as a new customer.</p>

          {errorMsg && (
            <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <InputRow
              icon={<User className="h-4 w-4" />}
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <InputRow
              icon={<Mail className="h-4 w-4" />}
              type="email"
              name="email"
              placeholder="Email Address (you@example.com)"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <InputRow
              icon={<Phone className="h-4 w-4" />}
              type="tel"
              name="phone"
              placeholder="Phone Number (+91 98450 12345)"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <div className="relative">
              <InputRow
                icon={<Lock className="h-4 w-4" />}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (e.g. Secret@123)"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Requirements Live Checklist */}
            {formData.password.length > 0 && (
              <div className="rounded-2xl border border-border bg-muted/40 p-3.5 text-xs space-y-1.5 transition">
                <p className="font-semibold text-muted-foreground mb-1">Password Security Requirements:</p>
                {passwordRules.map((rule, idx) => {
                  const passed = rule.test(formData.password);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 font-medium transition ${
                        passed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <span className="text-xs font-bold">{passed ? "✓" : "•"}</span>
                      <span>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <InputRow
              icon={<Lock className="h-4 w-4" />}
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving to MongoDB...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputRow({
  icon,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:shadow-ring">
      <span className="text-muted-foreground">{icon}</span>
      <input
        {...rest}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
