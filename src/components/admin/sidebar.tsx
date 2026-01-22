"use client";

// Dashboard sidebar navigation component
// Responsive: desktop shows fixed sidebar, mobile shows hamburger menu with overlay

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Zap,
  FolderKanban,
  FileText,
  Mail,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/backstage/dashboard", icon: LayoutDashboard },
  { name: "Bio", href: "/backstage/dashboard/bio", icon: User },
  { name: "Skills", href: "/backstage/dashboard/skills", icon: Zap },
  { name: "Projects", href: "/backstage/dashboard/projects", icon: FolderKanban },
  { name: "Resume", href: "/backstage/dashboard/resume", icon: FileText },
  { name: "Contact", href: "/backstage/dashboard/contact", icon: Mail },
];

interface SidebarProps {
  /** Map of section paths to dirty state for unsaved changes indicator */
  dirtyStates?: Record<string, boolean>;
}

export function Sidebar({ dirtyStates = {} }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/backstage/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/backstage" });
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const isDirty = dirtyStates[item.href] || false;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative"
        style={{
          backgroundColor: active ? "rgba(211, 177, 150, 0.15)" : "transparent",
          color: active ? "var(--color-primary)" : "var(--color-text)",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = "rgba(211, 177, 150, 0.08)";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        <Icon size={20} />
        <span className="font-medium">{item.name}</span>
        {/* Unsaved changes indicator dot */}
        {isDirty && (
          <span
            className="absolute right-4 w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--color-accent)" }}
            title="Unsaved changes"
          />
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Title */}
      <div className="px-4 py-6 border-b" style={{ borderColor: "rgba(243, 233, 226, 0.1)" }}>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Backstage
        </h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(243, 233, 226, 0.1)" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left"
          style={{ color: "var(--color-text)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(211, 177, 150, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={20} />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "rgba(243, 233, 226, 0.1)",
        }}
      >
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
          Backstage
        </h1>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--color-text)" }}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:left-0 border-r"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "rgba(243, 233, 226, 0.1)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar Panel */}
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 flex flex-col"
            style={{ backgroundColor: "var(--color-background)" }}
          >
            {/* Close Button */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(243, 233, 226, 0.1)" }}>
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Backstage
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--color-text)" }}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(243, 233, 226, 0.1)" }}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left"
                style={{ color: "var(--color-text)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(211, 177, 150, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <LogOut size={20} />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
