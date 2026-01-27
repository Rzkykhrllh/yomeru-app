"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RectangleStackIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import { ToastProvider } from "@/contexts/ToastContext";
import ToastContainer from "@/components/ToastContainer";

interface LayoutProps {
  children: ReactNode;
}
export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const navItems = [
    { href: "/texts", label: "Texts", icon: RectangleStackIcon },
    { href: "/vocabs", label: "Vocabs", icon: BookOpenIcon },
  ];
  return (
    <ToastProvider>
      <div className="min-h-screen bg-app-gradient text-body font-sans">
        {/* Desktop: Icon bar + content */}
        <div className="hidden md:flex h-screen">
          {/* Icon Bar */}
          <div className="w-16 bg-panel border-r border-line flex flex-col items-center py-6 gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-accent-soft text-ink"
                    : "text-muted hover:text-ink hover:bg-highlight"
                }`}
                title={item.label}
              >
                <item.icon className="h-6 w-6" />
              </Link>
            ))}
          </div>
          {/* Content Area - Full width, pages control their own layout */}
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
        {/* Mobile: Stack layout */}
        <div className="md:hidden">
          {/* Top navigation bar */}
          <div className="sticky top-0 bg-panel border-b border-line z-10">
            <div className="flex items-center justify-around py-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    pathname.startsWith(item.href) ? "text-ink" : "text-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          {/* Content */}
          <div>{children}</div>
        </div>
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}
