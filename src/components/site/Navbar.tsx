import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, UserCheck, User, LogOut, LayoutDashboard, ShieldAlert, Car } from "lucide-react";
import { useAuthUser } from "@/lib/auth";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/dashboard", label: "Customer Dashboard" },
  { to: "/driver", label: "Driver Portal" },
  { to: "/admin", label: "Admin" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthUser();

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully.");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <UserCheck className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">
            Driv <span className="text-primary">A</span> Long
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-primary bg-primary/10 font-bold" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-1.5 text-sm font-semibold">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 rounded-2xl border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-2xl px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                Login
              </Link>
              <Link to="/signup" className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition">
                Sign Up
              </Link>
            </>
          )}

          <Link to="/book" className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110">
            Book a Chauffeur
          </Link>
        </div>

        <button aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-xl border border-border md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="container-px mx-auto flex max-w-7xl flex-col gap-1 py-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-[15px] font-medium hover:bg-muted">
                {l.label}
              </Link>
            ))}

            {user ? (
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-primary" /> {user.name}
                </div>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="text-xs font-semibold text-destructive">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-2xl border border-border px-4 py-2.5 text-center text-sm font-medium">Login</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="rounded-2xl bg-primary/10 text-primary border border-primary/30 px-4 py-2.5 text-center text-sm font-semibold">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
