import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { PwaRegistration } from "@/components/layout/PwaRegistration";

export const metadata: Metadata = {
  title: {
    default: "Project Legacy",
    template: "%s | Project Legacy",
  },
  description: "Et rolig familiesystem for hverdagen.",
  applicationName: "Project Legacy",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Project Legacy",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F4EA",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("project-legacy-theme");
    const theme = storedTheme === "dark" ? "dark" : "light";
    document.documentElement.classList.remove("theme-light", "theme-dark");
    document.documentElement.classList.add("theme-" + theme);
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.classList.add("theme-light");
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className="theme-light"
      data-theme="light"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <PwaRegistration />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
