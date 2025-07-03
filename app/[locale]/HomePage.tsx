'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { 
  ArrowLeftRight, 
  CheckCircle, 
  FileText, 
  Code, 
  RefreshCcw, 
  Database,
  Layers,
  Search,
  Zap,
  Shield,
  Globe,
  Users
} from 'lucide-react'

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()

  const tools = [
    {
      title: t('pages.compare.title'),
      description: t('pages.compare.subtitle'),
      icon: ArrowLeftRight,
      href: `/${locale}/compare`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      features: locale === 'zh-CN' 
        ? ['智能差异检测', '大文件支持', '可视化标注', '数组移动检测']
        : ['Smart Diff Detection', 'Large File Support', 'Visual Annotation', 'Array Move Detection']
    },
    {
      title: t('pages.format.title'),
      description: t('pages.format.subtitle'),
      icon: FileText,
      href: `/${locale}/format`,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      features: locale === 'zh-CN'
        ? ['智能格式化', '多种排序方式', '自定义缩进', '语法高亮']
        : ['Smart Formatting', 'Multiple Sort Options', 'Custom Indentation', 'Syntax Highlighting']
    },
    {
      title: t('pages.validate.title'),
      description: t('pages.validate.subtitle'),
      icon: CheckCircle,
      href: `/${locale}/validate`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      features: locale === 'zh-CN'
        ? ['语法验证', '错误定位', '修复建议', 'Schema验证']
        : ['Syntax Validation', 'Error Location', 'Fix Suggestions', 'Schema Validation']
    },
    {
      title: t('pages.repair.title'),
      description: t('pages.repair.subtitle'),
      icon: RefreshCcw,
      href: `/${locale}/repair`,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      features: locale === 'zh-CN'
        ? ['智能修复', 'AI错误检测', '批量处理', '详细报告']
        : ['Smart Repair', 'AI Error Detection', 'Batch Processing', 'Detailed Reports']
    },
    {
      title: t('pages.convert.title'),
      description: t('pages.convert.subtitle'),
      icon: Code,
      href: `/${locale}/convert`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      features: locale === 'zh-CN'
        ? ['多格式支持', '批量转换', '保持结构', '自定义配置']
        : ['Multi-format Support', 'Batch Conversion', 'Structure Preservation', 'Custom Configuration']
    },
    {
      title: t('pages.minify.title'),
      description: t('pages.minify.subtitle'),
      icon: Layers,
      href: `/${locale}/minify`,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      features: locale === 'zh-CN'
        ? ['智能压缩', '保持可读性', '批量处理', '大小统计']
        : ['Smart Compression', 'Preserve Readability', 'Batch Processing', 'Size Statistics']
    }
  ]

  const features = [
    {
      icon: Zap,
      title: t('features.speed.title'),
      description: t('features.speed.description')
    },
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.description')
    },
    {
      icon: Globe,
      title: t('features.i18n.title'),
      description: t('features.i18n.description')
    },
    {
      icon: Users,
      title: t('features.free.title'),
      description: t('features.free.description')
    }
  ]

  const stats = [
    { label: t('stats.filesProcessed'), value: '1M+' },
    { label: t('stats.users'), value: '10K+' },
    { label: t('stats.tools'), value: '12+' },
    { label: t('stats.averageTime'), value: '<100ms' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t('pages.home.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('pages.home.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href={`/${locale}/compare`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('pages.home.heroButton1')}
            </Link>
            <Link
              href={`/${locale}/format`}
              className="border border-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('pages.home.heroButton2')}
            </Link>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">{t('pages.home.toolsTitle')}</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            {t('pages.home.toolsSubtitle')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <Link key={index} href={tool.href}>
                  <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 border border-gray-700 hover:border-gray-600 group">
                    <div className={`${tool.bgColor} ${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h3>
                    
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((feature, featureIndex) => (
                        <span 
                          key={featureIndex}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">{t('pages.home.featuresTitle')}</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            {t('pages.home.featuresSubtitle')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-500/10 text-blue-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">{t('pages.home.ctaTitle')}</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('pages.home.ctaSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/compare`}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              {t('nav.compare')}
            </Link>
            <Link
              href={`/${locale}/format`}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              {t('nav.format')}
            </Link>
            <Link
              href={`/${locale}/repair`}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              {t('nav.repair')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}