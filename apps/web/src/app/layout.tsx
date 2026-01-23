import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import Layout from "@/components/Layout";

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
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
