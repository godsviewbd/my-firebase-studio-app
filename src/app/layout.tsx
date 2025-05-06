import type {Metadata} from 'next';
import { Inter } from 'next/font/google'
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'WisdomWell - Multi-Faith Wisdom AI',
  description: 'Seek spiritual guidance from authentic scriptural sources.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning={true}>
        {children}
        <Toaster />
        {/* Google Translate Element Script */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        {/* Google Translate Initialization Function */}
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              if (typeof google !== 'undefined' && google.translate) {
                new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
              }
            }
          `}
        </Script>
      </body>
    </html>
  );
}
