/**
 * SEO结构化数据生成器
 */

export interface PageMetadata {
  title: string
  description: string
  keywords: string
  path: string
  locale: string
}

export function generateWebApplicationSchema(metadata: PageMetadata) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": metadata.locale === 'zh-CN' ? "JSON工具箱" : "JSON Tools",
    "description": metadata.description,
    "url": `https://jsontools.pro/${metadata.locale}${metadata.path}`,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": metadata.locale === 'zh-CN' ? [
      "JSON比较工具",
      "JSON格式化工具", 
      "JSON验证工具",
      "JSON修复工具",
      "JSON转换工具"
    ] : [
      "JSON Compare Tool",
      "JSON Format Tool",
      "JSON Validate Tool", 
      "JSON Repair Tool",
      "JSON Convert Tool"
    ]
  }
}

export function generateToolSchema(metadata: PageMetadata) {
  const toolNames = {
    '/compare': metadata.locale === 'zh-CN' ? 'JSON智能比较工具' : 'JSON Smart Compare Tool',
    '/format': metadata.locale === 'zh-CN' ? 'JSON格式化工具' : 'JSON Format Tool',
    '/validate': metadata.locale === 'zh-CN' ? 'JSON验证工具' : 'JSON Validate Tool',
    '/repair': metadata.locale === 'zh-CN' ? 'JSON修复工具' : 'JSON Repair Tool',
    '/convert': metadata.locale === 'zh-CN' ? 'JSON转换工具' : 'JSON Convert Tool',
    '/minify': metadata.locale === 'zh-CN' ? 'JSON压缩工具' : 'JSON Minify Tool'
  }

  const toolName = toolNames[metadata.path as keyof typeof toolNames] || metadata.title

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": toolName,
    "description": metadata.description,
    "url": `https://jsontools.pro/${metadata.locale}${metadata.path}`,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": metadata.locale === 'zh-CN' ? "JSON工具箱团队" : "JSON Tools Team"
    }
  }
}

export function generateBreadcrumbSchema(metadata: PageMetadata) {
  const breadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": metadata.locale === 'zh-CN' ? "首页" : "Home",
      "item": `https://jsontools.pro/${metadata.locale}`
    }
  ]

  if (metadata.path !== '') {
    const toolNames = {
      '/compare': metadata.locale === 'zh-CN' ? 'JSON比较' : 'JSON Compare',
      '/format': metadata.locale === 'zh-CN' ? 'JSON格式化' : 'JSON Format',
      '/validate': metadata.locale === 'zh-CN' ? 'JSON验证' : 'JSON Validate',
      '/repair': metadata.locale === 'zh-CN' ? 'JSON修复' : 'JSON Repair',
      '/convert': metadata.locale === 'zh-CN' ? 'JSON转换' : 'JSON Convert'
    }

    breadcrumbs.push({
      "@type": "ListItem",
      "position": 2,
      "name": toolNames[metadata.path as keyof typeof toolNames] || metadata.title,
      "item": `https://jsontools.pro/${metadata.locale}${metadata.path}`
    })
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs
  }
}

export function generateFAQSchema(metadata: PageMetadata) {
  const faqs = metadata.locale === 'zh-CN' ? [
    {
      question: "JSON工具箱是免费的吗？",
      answer: "是的，我们的所有JSON工具都是完全免费的，无需注册即可使用。"
    },
    {
      question: "JSON工具箱支持大文件吗？",
      answer: "是的，我们的工具经过优化，可以处理大型JSON文件，响应时间通常在100毫秒以内。"
    },
    {
      question: "数据是否安全？",
      answer: "绝对安全。所有处理都在您的浏览器本地进行，数据不会上传到我们的服务器。"
    },
    {
      question: "支持哪些浏览器？",
      answer: "支持所有现代浏览器，包括Chrome、Firefox、Safari、Edge等。"
    }
  ] : [
    {
      question: "Is JSON Tools free to use?",
      answer: "Yes, all our JSON tools are completely free and no registration is required."
    },
    {
      question: "Does JSON Tools support large files?",
      answer: "Yes, our tools are optimized to handle large JSON files with response times typically under 100ms."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. All processing is done locally in your browser, and data is never uploaded to our servers."
    },
    {
      question: "Which browsers are supported?",
      answer: "All modern browsers are supported including Chrome, Firefox, Safari, Edge, and more."
    }
  ]

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}