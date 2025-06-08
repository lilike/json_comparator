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
      <body className={inter.className}>{children}</body>
    </html>
  )
} 