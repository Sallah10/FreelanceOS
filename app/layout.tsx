import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/context/auth-context";
import { Toaster } from "sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FreelanceOS - Command Center for African Freelancers",
    template: "%s | FreelanceOS",
  },
  description:
    "Manage clients, track projects, generate invoices, and receive international payments via Raenest - all in one place.",
  keywords: ["freelance", "invoice", "Raenest", "payments", "Africa", "Nigeria"],
  authors: [{ name: "FreelanceOS" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    title: "FreelanceOS - Command Center for African Freelancers",
    description: "Manage clients, projects, and get paid internationally via Raenest.",
    siteName: "FreelanceOS",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },

};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} h-full `}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >

          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{ classNames: { toast: "font-sans" } }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}