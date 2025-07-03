import type { Metadata } from 'next'
import { generateToolSchema, generateBreadcrumbSchema, PageMetadata } from '@/utils/structuredData'
import JsonMinifyPage from './JsonMinifyPage'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  
  const metadata: PageMetadata = {
    title: locale === 'zh-CN' ? 'JSON压缩工具 - 智能JSON文件压缩器' : 'JSON Minify Tool - Intelligent JSON File Compressor',
    description: locale === 'zh-CN' 
      ? '专业的JSON压缩工具，智能移除多余空格和换行符，大幅减小文件大小。保持JSON结构完整性，支持大文件批量处理。免费在线使用。'
      : 'Professional JSON minification tool that intelligently removes whitespace and line breaks to significantly reduce file size. Maintains JSON structure integrity with support for large file batch processing. Free online tool.',
    keywords: locale === 'zh-CN'
      ? 'JSON压缩,JSON精简,JSON文件压缩,JSON优化,在线JSON压缩器,JSON大小减小'
      : 'JSON minify,JSON compress,JSON file compression,JSON optimization,online JSON minifier,JSON size reduction',
    path: '/minify',
    locale
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://jsontools.pro/${locale}/minify`,
      siteName: locale === 'zh-CN' ? 'JSON工具箱' : 'JSON Tools',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description
    },
    alternates: {
      canonical: `https://jsontools.pro/${locale}/minify`,
      languages: {
        'zh-CN': 'https://jsontools.pro/zh-CN/minify',
        'en': 'https://jsontools.pro/en/minify'
      }
    }
  }
}

export default function Page() {
  return <JsonMinifyPage />
}