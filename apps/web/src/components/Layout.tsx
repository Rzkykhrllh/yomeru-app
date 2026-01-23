"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "New Text", icon: "📝" },
    { href: "/vocabs", label: "Vocabs", icon: "📚" },
    { href: "/texts", label: "Texts", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop: 3-column layout */}
      <div className="hidden md:flex h-screen">
        {/* Icon Bar */}
        <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-6 gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title={item.label}
            >
              <span className="text-2xl">{item.icon}</span>
            </Link>
          ))}
        </div>

        {/* List Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {navItems.find((item) => item.href === pathname)?.label || "Navigation"}
            </h2>
            {/* Placeholder for list items - akan diisi per page */}
            <div className="text-sm text-gray-500">Select an item to view details</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-5xl mx-auto">{children}</div>
        </div>
      </div>

      {/* Mobile: Stack layout */}
      <div className="md:hidden">
        {/* Top navigation bar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-around py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
