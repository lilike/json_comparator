import type { Metadata } from 'next'
import { generateToolSchema, generateBreadcrumbSchema, PageMetadata } from '@/utils/structuredData'
import JsonConvertPage from './JsonConvertPage'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  
  const metadata: PageMetadata = {
    title: locale === 'zh-CN' ? 'JSON转换工具 - 多格式数据转换器' : 'JSON Convert Tool - Multi-format Data Converter',
    description: locale === 'zh-CN' 
      ? '专业的JSON转换工具，支持JSON与XML、CSV、YAML、SQL等格式的相互转换。批量处理，保持数据结构，自定义配置选项。免费在线使用。'
      : 'Professional JSON conversion tool supporting JSON to XML, CSV, YAML, SQL format conversion. Batch processing with data structure preservation and custom configuration options. Free online tool.',
    keywords: locale === 'zh-CN'
      ? 'JSON转换,JSON转XML,JSON转CSV,JSON转YAML,数据格式转换,在线JSON转换器'
      : 'JSON convert,JSON to XML,JSON to CSV,JSON to YAML,data format conversion,online JSON converter',
    path: '/convert',
    locale
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://jsontools.pro/${locale}/convert`,
      siteName: locale === 'zh-CN' ? 'JSON工具箱' : 'JSON Tools',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description
    },
    alternates: {
      canonical: `https://jsontools.pro/${locale}/convert`,
      languages: {
        'zh-CN': 'https://jsontools.pro/zh-CN/convert',
        'en': 'https://jsontools.pro/en/convert'
      }
    }
  }
}

export default function Page() {
  return <JsonConvertPage />
}