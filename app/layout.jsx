import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { KYCProvider } from "@/context/KYCContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: {
    default: "KYC Verification",
    template: "%s · KYC Verification",
  },
  description:
    "Secure, live-camera identity verification — complete your KYC in three quick steps.",
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-slate-900 font-[family-name:var(--font-body)]">
        <KYCProvider>{children}</KYCProvider>
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            classNames: {
              toast: "rounded-lg border border-slate-200 shadow-lg",
            },
          }}
        />
      </body>
    </html>
  );
}