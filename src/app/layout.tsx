import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SiteNotificationToast } from "@/components/notifications/site-notification-toast";
import { ThemeProvider } from "@/lib/theme/use-theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter"
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel"
});

export const metadata: Metadata = {
  title: "Raid Portal MVP",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg"
  },
  description: "Dark fantasy портал Raid: Shadow Legends с маркетплейсом, базой героев, чатами и кабинетами."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <SiteNotificationToast />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
