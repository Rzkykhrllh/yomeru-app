import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yomeru - Japanese Reading & Vocab Learning",
  description: "Paste Japanese text, annotate vocabulary, and track your learning progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
