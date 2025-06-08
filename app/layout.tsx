import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import {locales} from '../i18n'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart JSON Comparison Tool',
  description: 'Professional JSON comparison tool that solves formatting, sorting, and difference marking issues',
}

type Props = {
  children: React.ReactNode;
  params: {locale: string};
}

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default function RootLayout({
  children,
  params: {locale}
}: Props) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-6C1W3Z37QW"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6C1W3Z37QW');
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 