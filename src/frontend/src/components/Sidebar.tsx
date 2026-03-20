import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  LayoutDashboard,
  LogIn,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/make-order", label: "Make Order", icon: PlusCircle },
  { path: "/pending-orders", label: "Pending Orders", icon: Clock },
  { path: "/completed-orders", label: "Completed Orders", icon: CheckCircle2 },
];

export default function Sidebar() {
  const { location } = useRouterState();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">
              C
            </span>
          </div>
          <span className="text-sidebar-foreground font-display font-bold text-xl tracking-tight">
            Clario
          </span>
        </div>
        <p className="text-sidebar-foreground/50 text-xs mt-1 font-sans">
          Order Management
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              data-ocid={`nav.${label.toLowerCase().replace(/ /g, "_")}.link`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Auth */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        {isLoggedIn ? (
          <div className="space-y-2">
            <p className="text-sidebar-foreground/50 text-xs px-3 truncate">
              {identity.getPrincipal().toString().slice(0, 20)}...
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              onClick={() => clear()}
              data-ocid="auth.logout.button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="auth.login.button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loginStatus === "logging-in" ? "Connecting..." : "Login"}
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-4">
        <p className="text-sidebar-foreground/30 text-xs">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sidebar-foreground/50 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}
