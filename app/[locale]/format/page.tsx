import type { Metadata } from 'next'
import { generateToolSchema, generateBreadcrumbSchema, PageMetadata } from '@/utils/structuredData'
import JsonFormatPage from './JsonFormatPage'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  
  const metadata: PageMetadata = {
    title: locale === 'zh-CN' ? 'JSON格式化工具 - 专业JSON美化器' : 'JSON Format Tool - Professional JSON Beautifier',
    description: locale === 'zh-CN' 
      ? '专业的JSON格式化工具，智能美化JSON代码，支持自定义缩进、多种排序方式。快速压缩JSON，提高代码可读性。免费在线使用。'
      : 'Professional JSON format tool with intelligent code beautification, custom indentation, multiple sorting options. Fast JSON minification for improved code readability. Free online tool.',
    keywords: locale === 'zh-CN'
      ? 'JSON格式化,JSON美化,JSON压缩,JSON排序,在线JSON格式化器,JSON代码美化'
      : 'JSON format,JSON beautify,JSON minify,JSON sort,online JSON formatter,JSON code beautifier',
    path: '/format',
    locale
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://jsontools.pro/${locale}/format`,
      siteName: locale === 'zh-CN' ? 'JSON工具箱' : 'JSON Tools',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description
    },
    alternates: {
      canonical: `https://jsontools.pro/${locale}/format`,
      languages: {
        'zh-CN': 'https://jsontools.pro/zh-CN/format',
        'en': 'https://jsontools.pro/en/format'
      }
    }
  }
}

export default function Page() {
  return <JsonFormatPage />
}