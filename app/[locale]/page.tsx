import type { Metadata } from 'next'
import { generateWebApplicationSchema, generateFAQSchema, PageMetadata } from '@/utils/structuredData'
import HomePage from './HomePage'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  
  const metadata: PageMetadata = {
    title: locale === 'zh-CN' ? 'JSON工具箱 - 专业JSON处理工具集' : 'JSON Tools - Professional JSON Processing Suite',
    description: locale === 'zh-CN' 
      ? '免费在线JSON工具站，提供JSON比较、格式化、验证、修复、转换等功能。专业的JSON处理工具，支持大文件，智能错误修复。适合开发者和数据分析师使用。'
      : 'Free online JSON tools suite including compare, format, validate, repair, and convert. Professional JSON processing tools with large file support and intelligent error fixing for developers and data analysts.',
    keywords: locale === 'zh-CN'
      ? 'JSON工具,JSON比较,JSON格式化,JSON验证,JSON修复,JSON转换,在线JSON工具,JSON处理器,JSON编辑器'
      : 'JSON tools,JSON compare,JSON format,JSON validate,JSON repair,JSON convert,online JSON tools,JSON processor,JSON editor',
    path: '',
    locale
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://jsontools.pro/${locale}`,
      siteName: locale === 'zh-CN' ? 'JSON工具箱' : 'JSON Tools',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description
    },
    alternates: {
      canonical: `https://jsontools.pro/${locale}`,
      languages: {
        'zh-CN': 'https://jsontools.pro/zh-CN',
        'en': 'https://jsontools.pro/en'
      }
    }
  }
}

export default function Page() {
  return <HomePage />
}