"use client";

// Dashboard sidebar navigation component
// Responsive: desktop shows fixed sidebar, mobile shows hamburger menu with overlay
// Intercepts navigation when there are unsaved changes

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Zap,
  FolderKanban,
  FileText,
  Mail,
  Settings,
  Github,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useUnsavedChangesContext } from "@/contexts/unsaved-changes-context";
import { UnsavedChangesModal } from "@/components/admin/unsaved-changes-modal";

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
  { name: "SEO", href: "/backstage/dashboard/seo", icon: Settings },
  { name: "GitHub", href: "/backstage/dashboard/github", icon: Github },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get unsaved changes state from context
  const unsavedChangesContext = useUnsavedChangesContext();
  const dirtyStates = unsavedChangesContext?.dirtyStates ?? {};
  const pendingNavigation = unsavedChangesContext?.pendingNavigation ?? null;
  const setPendingNavigation =
    unsavedChangesContext?.setPendingNavigation ?? (() => {});

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

  // Check if current section has unsaved changes
  const currentSectionDirty = Object.entries(dirtyStates).some(
    ([path, isDirty]) => pathname.startsWith(path) && isDirty
  );

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/backstage" });
  };

  // Handle navigation click - intercept if dirty
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // If navigating to same page, allow
    if (pathname === href || pathname.startsWith(href + "/")) {
      return;
    }

    // Check if current section is dirty
    if (currentSectionDirty) {
      e.preventDefault();
      setPendingNavigation(href);
    }
  };

  // Handle modal confirm - navigate to pending URL
  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Handle modal cancel - stay on page
  const handleCancelNavigation = () => {
    setPendingNavigation(null);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const isDirty = dirtyStates[item.href] || false;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={(e) => handleNavClick(e, item.href)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
          active ? "" : "hover:bg-[rgba(211,177,150,0.08)]"
        }`}
        style={{
          backgroundColor: active ? "rgba(211, 177, 150, 0.15)" : "transparent",
          color: active ? "var(--color-primary)" : "var(--color-text)",
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
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left hover:bg-[rgba(211,177,150,0.08)]"
          style={{ color: "var(--color-text)" }}
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left hover:bg-[rgba(211,177,150,0.08)]"
                style={{ color: "var(--color-text)" }}
              >
                <LogOut size={20} />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={pendingNavigation !== null}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />
    </>
  );
}
