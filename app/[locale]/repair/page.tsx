import type { Metadata } from 'next'
import { generateToolSchema, generateBreadcrumbSchema, PageMetadata } from '@/utils/structuredData'
import JsonRepairPage from './JsonRepairPage'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  
  const metadata: PageMetadata = {
    title: locale === 'zh-CN' ? 'JSON修复工具 - 智能JSON错误修复器' : 'JSON Repair Tool - Intelligent JSON Error Fixer',
    description: locale === 'zh-CN' 
      ? '专业的JSON修复工具，自动检测和修复常见JSON语法错误。支持AI生成的错误JSON、缺失引号、多余逗号等问题。免费在线使用。'
      : 'Professional JSON repair tool that automatically detects and fixes common JSON syntax errors. Supports AI-generated malformed JSON, missing quotes, trailing commas and more. Free online tool.',
    keywords: locale === 'zh-CN'
      ? 'JSON修复,JSON错误修复,JSON语法修复,AI JSON修复,在线JSON修复器,JSON自动修复'
      : 'JSON repair,JSON error fix,JSON syntax repair,AI JSON repair,online JSON fixer,JSON auto repair',
    path: '/repair',
    locale
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://jsontools.pro/${locale}/repair`,
      siteName: locale === 'zh-CN' ? 'JSON工具箱' : 'JSON Tools',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description
    },
    alternates: {
      canonical: `https://jsontools.pro/${locale}/repair`,
      languages: {
        'zh-CN': 'https://jsontools.pro/zh-CN/repair',
        'en': 'https://jsontools.pro/en/repair'
      }
    }
  }
}

export default function Page() {
  return <JsonRepairPage />
}