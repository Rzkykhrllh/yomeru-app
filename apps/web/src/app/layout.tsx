import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased" suppressHydrationWarning>
          <Script id="theme-init" strategy="beforeInteractive">
            {`
              (() => {
                try {
                  const storedTheme = window.localStorage.getItem("yomeru-theme");
                  const theme = storedTheme === "light" || storedTheme === "dark"
                    ? storedTheme
                    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                  document.documentElement.classList.toggle("dark", theme === "dark");
                } catch (error) {}
              })();
            `}
          </Script>
          <Providers>
            <Layout>{children}</Layout>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
