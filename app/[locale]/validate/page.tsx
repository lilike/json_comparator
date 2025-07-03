import type { Metadata } from 'next'
import { generateToolSchema, generateBreadcrumbSchema, PageMetadata } from '@/utils/structuredData'
import JsonValidatePage from './JsonValidatePage'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  
  const metadata: PageMetadata = {
    title: locale === 'zh-CN' ? 'JSON验证工具 - 专业JSON语法检查器' : 'JSON Validate Tool - Professional JSON Syntax Checker',
    description: locale === 'zh-CN' 
      ? '专业的JSON验证工具，智能检测JSON语法错误，提供详细错误报告和修复建议。支持大文件验证，快速定位问题。免费在线使用。'
      : 'Professional JSON validation tool with intelligent syntax error detection, detailed error reports and fix suggestions. Supports large file validation with quick error location. Free online tool.',
    keywords: locale === 'zh-CN'
      ? 'JSON验证,JSON语法检查,JSON错误检测,在线JSON验证器,JSON格式检查,JSON校验'
      : 'JSON validate,JSON syntax check,JSON error detection,online JSON validator,JSON format check,JSON verification',
    path: '/validate',
    locale
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://jsontools.pro/${locale}/validate`,
      siteName: locale === 'zh-CN' ? 'JSON工具箱' : 'JSON Tools',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description
    },
    alternates: {
      canonical: `https://jsontools.pro/${locale}/validate`,
      languages: {
        'zh-CN': 'https://jsontools.pro/zh-CN/validate',
        'en': 'https://jsontools.pro/en/validate'
      }
    }
  }
}

export default function Page() {
  return <JsonValidatePage />
}