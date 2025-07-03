import '../globals.css'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '../../i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Link from 'next/link'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode;
  params: {locale: string};
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const t = await getTranslations('nav');
  const tFooter = await getTranslations('footer');

  const tMeta = await getTranslations('meta');
  const tPages = await getTranslations('pages.home');
  
  const siteConfig = {
    name: tPages('title'),
    description: tPages('subtitle'),
    keywords: locale === 'zh-CN'
      ? "JSON工具,JSON比较,JSON格式化,JSON验证,JSON修复,JSON转换,在线JSON工具"
      : "JSON tools,JSON compare,JSON format,JSON validate,JSON repair,JSON convert,online JSON tools",
    author: locale === 'zh-CN' ? "JSON工具箱团队" : "JSON Tools Team",
    url: "https://jsontools.pro"
  }

  return (
    <html lang={locale} className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={siteConfig.description} />
        <meta name="keywords" content={siteConfig.keywords} />
        <meta name="author" content={siteConfig.author} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="Content-Language" content={locale} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteConfig.name} />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:url" content={`${siteConfig.url}/${locale}`} />
        <meta property="og:site_name" content="Best JSON Compare" />
        <meta property="og:locale" content={locale === 'zh-CN' ? 'zh_CN' : 'en_US'} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteConfig.name} />
        <meta name="twitter:description" content={siteConfig.description} />
        <meta name="twitter:site" content="@jsontools" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${siteConfig.url}/${locale}`} />
        
        {/* Alternate languages */}
        <link rel="alternate" hrefLang="en" href={`${siteConfig.url}/en`} />
        <link rel="alternate" hrefLang="zh-CN" href={`${siteConfig.url}/zh-CN`} />
        <link rel="alternate" hrefLang="x-default" href={`${siteConfig.url}/en`} />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        <title>{siteConfig.name}</title>
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          {/* 导航栏 */}
          <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <Link href={`/${locale}`} className="text-2xl font-bold text-blue-400 hover:text-blue-300">
                    {tPages('title')}
                  </Link>
                  
                  <div className="hidden md:flex space-x-6">
                    <Link href={`/${locale}`} className="text-gray-300 hover:text-white transition-colors">
                      {t('home')}
                    </Link>
                    <Link href={`/${locale}/compare`} className="text-gray-300 hover:text-white transition-colors">
                      {t('compare')}
                    </Link>
                    <Link href={`/${locale}/format`} className="text-gray-300 hover:text-white transition-colors">
                      {t('format')}
                    </Link>
                    <Link href={`/${locale}/validate`} className="text-gray-300 hover:text-white transition-colors">
                      {t('validate')}
                    </Link>
                    <Link href={`/${locale}/repair`} className="text-gray-300 hover:text-white transition-colors">
                      {t('repair')}
                    </Link>
                    <Link href={`/${locale}/convert`} className="text-gray-300 hover:text-white transition-colors">
                      {t('convert')}
                    </Link>
                  </div>
                </div>
                
                <LanguageSwitcher />
              </div>
            </div>
          </nav>

          {/* 主要内容 */}
          <main className="flex-1">
            {children}
          </main>

          {/* 页脚 */}
          <footer className="border-t border-gray-700 bg-gray-900/50 mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">{locale === 'zh-CN' ? 'JSON工具' : 'JSON Tools'}</h3>
                  <ul className="space-y-2">
                    <li><Link href={`/${locale}/compare`} className="text-gray-400 hover:text-white">{t('compare')}</Link></li>
                    <li><Link href={`/${locale}/format`} className="text-gray-400 hover:text-white">{t('format')}</Link></li>
                    <li><Link href={`/${locale}/validate`} className="text-gray-400 hover:text-white">{t('validate')}</Link></li>
                    <li><Link href={`/${locale}/repair`} className="text-gray-400 hover:text-white">{t('repair')}</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">{locale === 'zh-CN' ? '核心工具' : 'Core Tools'}</h3>
                  <ul className="space-y-2">
                    <li><Link href={`/${locale}/compare`} className="text-gray-400 hover:text-white">{t('compare')}</Link></li>
                    <li><Link href={`/${locale}/format`} className="text-gray-400 hover:text-white">{t('format')}</Link></li>
                    <li><Link href={`/${locale}/validate`} className="text-gray-400 hover:text-white">{t('validate')}</Link></li>
                    <li><Link href={`/${locale}/repair`} className="text-gray-400 hover:text-white">{t('repair')}</Link></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">{locale === 'zh-CN' ? '高级功能' : 'Advanced Features'}</h3>
                  <ul className="space-y-2">
                    <li><Link href={`/${locale}/convert`} className="text-gray-400 hover:text-white">{t('convert')}</Link></li>
                    <li><Link href={`/${locale}/minify`} className="text-gray-400 hover:text-white">{t('minify')}</Link></li>
                    <li><span className="text-gray-600 text-sm cursor-not-allowed">{locale === 'zh-CN' ? '更多工具开发中...' : 'More tools coming soon...'}</span></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">{locale === 'zh-CN' ? '关于我们' : 'About Us'}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {locale === 'zh-CN' 
                      ? '专业的JSON处理工具站，提供全方位的JSON操作功能。免费、快速、安全，支持大文件处理。'
                      : 'Professional JSON processing tools suite providing comprehensive JSON operations. Free, fast, secure with large file support.'}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                <p className="text-gray-400 text-sm">
                  {locale === 'zh-CN' 
                    ? '© 2024 JSON工具箱. 专业JSON处理工具站 | 免费在线使用'
                    : '© 2024 JSON Tools. Professional JSON Processing Suite | Free Online Use'}
                </p>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 