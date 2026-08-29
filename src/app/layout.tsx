import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { IssuesProvider } from "@/hooks/useIssues";
import ConvexClientProvider from "./ConvexClientProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTracker from "@/components/PageTracker";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CivicPulse — Your Voice. Your Country. Your Change.",
  description:
    "India's civic engagement platform. Report issues, discuss solutions, upload evidence, and suggest reforms for a better nation.",
  keywords: [
    "civic engagement",
    "India",
    "public issues",
    "transparency",
    "democracy",
    "CivicPulse",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} scroll-smooth`}
    >
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`
        }} />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-background text-foreground">
        <ConvexClientProvider>
          <ThemeProvider>
            <AuthProvider>
              <IssuesProvider>
                <Navbar />
                <PageTracker />
                <main className="flex-1">{children}</main>
                <Footer />
              </IssuesProvider>
            </AuthProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
