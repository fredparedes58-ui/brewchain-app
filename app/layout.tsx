import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

export const viewport: Viewport = {
  themeColor: '#8B5E3C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "BREW CHAIN — De la semilla a tu taza",
  description: "Primera plataforma digital all-in-one del café de especialidad en español. Trazada, verificada, conectada.",
  keywords: ["café", "especialidad", "trazabilidad", "EUDR", "QR", "caficultor"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BREW CHAIN",
    // Splash screens por dispositivo — generados con scripts/generate-pwa-assets.mjs
    startupImage: [
      { url: "/splash/splash-750x1334.png",  media: "(device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" },
      { url: "/splash/splash-1125x2436.png", media: "(device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" },
      { url: "/splash/splash-828x1792.png",  media: "(device-width:414px) and (device-height:896px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" },
      { url: "/splash/splash-1080x2340.png", media: "(device-width:360px) and (device-height:780px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" },
      { url: "/splash/splash-1170x2532.png", media: "(device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" },
      { url: "/splash/splash-1284x2778.png", media: "(device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" },
      { url: "/splash/splash-1179x2556.png", media: "(device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" },
      { url: "/splash/splash-1290x2796.png", media: "(device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" },
      { url: "/splash/splash-1488x2266.png", media: "(device-width:744px) and (device-height:1133px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" },
      { url: "/splash/splash-1668x2388.png", media: "(device-width:834px) and (device-height:1194px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" },
      { url: "/splash/splash-2048x2732.png", media: "(device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#1A0D05",
    "msapplication-TileImage": "/icons/icon-144.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        style={{ backgroundColor: '#1A0D05', color: '#FBF6EE', minHeight: '100vh' }}
        suppressHydrationWarning
      >
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
