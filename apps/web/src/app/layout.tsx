import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "Yomeru - Japanese Reading & Vocab Learning",
  description: "Learn Japanese by reading. Save texts, click words to build your vocabulary with meanings, furigana, and notes. Track your progress as your vocabulary grows.",
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
