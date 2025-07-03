import type { Metadata } from 'next'
import { generateToolSchema, generateBreadcrumbSchema, PageMetadata } from '@/utils/structuredData'
import JsonComparePage from './JsonComparePage'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  
  const metadata: PageMetadata = {
    title: locale === 'zh-CN' ? 'JSON智能比较工具 - 专业差异检测' : 'JSON Smart Compare Tool - Professional Diff Detection',
    description: locale === 'zh-CN' 
      ? 'professional JSON比较工具，智能检测两个JSON文件的差异。支持大文件、复杂嵌套结构、数组移动检测，提供可视化差异标注。免费在线使用。'
      : 'Professional JSON compare tool with intelligent diff detection. Supports large files, complex nested structures, array movement detection with visual diff highlighting. Free online tool.',
    keywords: locale === 'zh-CN'
      ? 'JSON比较,JSON差异检测,JSON对比工具,JSON文件比较,在线JSON比较器,JSON差异分析'
      : 'JSON compare,JSON diff,JSON comparison tool,JSON file compare,online JSON comparator,JSON difference analyzer',
    path: '/compare',
    locale
  }

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://jsontools.pro/${locale}/compare`,
      siteName: locale === 'zh-CN' ? 'JSON工具箱' : 'JSON Tools',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description
    },
    alternates: {
      canonical: `https://jsontools.pro/${locale}/compare`,
      languages: {
        'zh-CN': 'https://jsontools.pro/zh-CN/compare',
        'en': 'https://jsontools.pro/en/compare'
      }
    }
  }
}

export default function Page() {
  return <JsonComparePage />
}