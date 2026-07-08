import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SiteNotificationToast } from "@/components/notifications/site-notification-toast";
import { ThemeProvider } from "@/lib/theme/use-theme";
import "./globals.css";

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
    <html lang="ru" data-scroll-behavior="smooth">
      <body className="font-sans font-semibold antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('raid-nexus-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}}catch(e){}"
          }}
        />
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
