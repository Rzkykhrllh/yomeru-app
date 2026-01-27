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
    { href: "/texts", label: "Texts", icon: "📝" },
    { href: "/vocabs", label: "Vocabs", icon: "📚" },
  ];
  return (
    <div className="min-h-screen bg-white">
      {/* Desktop: Icon bar + content */}
      <div className="hidden md:flex h-screen">
        {/* Icon Bar */}
        <div className="w-16 bg-gray-900 flex flex-col items-center py-6 gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              title={item.label}
            >
              <span className="text-2xl">{item.icon}</span>
            </Link>
          ))}
        </div>
        {/* Content Area - Full width, pages control their own layout */}
        <div className="flex-1 overflow-hidden">{children}</div>
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
                  pathname.startsWith(item.href) ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
