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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Driv A Long Private Limited Logo"
            className="h-9 w-auto max-w-[42px] object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div>
            <span className="text-[17px] font-bold tracking-tight block leading-tight">
              Driv <span className="text-primary">A</span> Long
            </span>
            <span className="hidden text-[10px] font-semibold text-muted-foreground tracking-widest uppercase sm:block">
              Pvt. Ltd.
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted/80 hover:text-foreground"
              activeProps={{ className: "text-primary bg-primary/10 font-bold" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-xl bg-muted/80 px-3 py-1.5 text-xs font-semibold">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="max-w-[110px] truncate">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                Login
              </Link>
              <Link to="/signup" className="rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all duration-200">
                Sign Up
              </Link>
            </>
          )}

          <Link to="/book" className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft transition-all duration-200 hover:brightness-110 active:scale-98">
            Book a Chauffeur
          </Link>
        </div>

        <button aria-label="Menu" className="grid h-10 w-10 place-items-center rounded-xl border border-border/80 bg-background text-foreground md:hidden active:scale-95 transition-transform" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden shadow-lift animate-fade-in">
          <div className="container-px mx-auto flex max-w-7xl flex-col gap-1.5 py-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                {l.label}
              </Link>
            ))}

            {user ? (
              <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <User className="h-4 w-4 text-primary" /> {user.name}
                </div>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="text-xs font-bold text-destructive">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2 text-center text-xs font-semibold text-foreground">Login</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="rounded-xl bg-primary/10 text-primary border border-primary/30 px-4 py-2 text-center text-xs font-bold">Sign Up</Link>
              </div>
            )}

            <Link to="/book" onClick={() => setOpen(false)} className="mt-2 text-center rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-soft">
              Book a Chauffeur
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
