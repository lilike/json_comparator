import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jsontools.pro'
  const lastModified = new Date()

  // 支持的语言
  const locales = ['en', 'zh-CN']
  
  // 基础页面
  const basePages = [
    '',
    '/compare',
    '/format', 
    '/validate',
    '/repair',
    '/convert',
    '/minify',
    '/escape',
    '/schema',
    '/path'
  ]

  const sitemap: MetadataRoute.Sitemap = []

  // 为每个语言生成页面
  locales.forEach(locale => {
    basePages.forEach(page => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8
      })
    })
  })

  return sitemap
}