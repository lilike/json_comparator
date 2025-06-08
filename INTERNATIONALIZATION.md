# 国际化功能说明 / Internationalization Guide

## 概述 / Overview

本项目已完全支持国际化功能，支持英文（English）和中文（简体中文）两种语言。

This project fully supports internationalization with English and Simplified Chinese.

## 支持的语言 / Supported Languages

- **英文 (English)**: `en` - 默认语言 / Default language
- **中文 (简体中文)**: `zh-CN`

## 访问方式 / Access Methods

### 英文版本 / English Version
- 根路径自动重定向: `http://localhost:3000` → `http://localhost:3000/en`
- 直接访问: `http://localhost:3000/en`

### 中文版本 / Chinese Version
- 直接访问: `http://localhost:3000/zh-CN`

## 功能特性 / Features

### 1. 自动语言检测和重定向
- 访问根路径时自动重定向到默认语言（英文）
- 支持浏览器语言偏好检测

### 2. 语言切换器
- 页面顶部提供语言切换按钮
- 支持在英文和中文之间无缝切换
- 保持当前页面状态

### 3. 完整的界面翻译
- 页面标题和描述
- 所有按钮文本
- 错误提示信息
- 状态提示文本
- 占位符文本

### 4. SEO优化
- 正确的HTML lang属性
- hreflang标签支持
- 多语言metadata

## 技术实现 / Technical Implementation

### 使用的技术栈
- **Next.js 14**: App Router
- **next-intl 4.1.0**: 国际化库
- **TypeScript**: 类型安全

### 文件结构
```
├── app/
│   ├── [locale]/          # 本地化路由
│   │   ├── layout.tsx     # 本地化布局
│   │   └── page.tsx       # 主页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 根页面重定向
├── components/
│   └── LanguageSwitcher.tsx  # 语言切换组件
├── messages/              # 语言文件
│   ├── en.json           # 英文翻译
│   └── zh-CN.json        # 中文翻译
├── i18n.ts               # 国际化配置
└── middleware.ts         # 中间件配置
```

### 配置文件

#### 1. 中间件配置 (`middleware.ts`)
```typescript
import createMiddleware from 'next-intl/middleware';
import {locales} from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'en'
});
```

#### 2. 国际化配置 (`i18n.ts`)
```typescript
import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'zh-CN'];

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

## 开发指南 / Development Guide

### 添加新的翻译文本

1. 在 `messages/en.json` 中添加英文文本
2. 在 `messages/zh-CN.json` 中添加对应的中文翻译
3. 在组件中使用 `useTranslations` hook

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations();
  
  return <button>{t('buttons.submit')}</button>;
}
```

### 添加新语言

1. 在 `i18n.ts` 中的 `locales` 数组添加新语言代码
2. 在 `messages/` 目录下创建对应的语言文件
3. 在 `LanguageSwitcher.tsx` 中添加新语言选项
4. 更新中间件配置

### 类型安全

项目支持TypeScript类型检查，确保翻译键的正确性。可以通过类型增强来获得更好的开发体验。

## 测试 / Testing

### 本地测试
```bash
# 启动开发服务器
npm run dev

# 访问不同语言版本
# 英文: http://localhost:3000/en
# 中文: http://localhost:3000/zh-CN
```

### 构建测试
```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 注意事项 / Notes

1. **默认语言**: 英文是默认语言，访问根路径会自动重定向到 `/en`
2. **语言持久化**: 用户的语言选择会通过cookie保存
3. **SEO友好**: 每个语言版本都有独立的URL，有利于搜索引擎优化
4. **性能优化**: 语言文件按需加载，不会影响应用性能

## 故障排除 / Troubleshooting

### 常见问题

1. **构建错误**: 确保所有语言文件的JSON格式正确
2. **翻译缺失**: 检查翻译键是否在所有语言文件中都存在
3. **路由问题**: 确保中间件配置正确，matcher规则包含所需路径

### 调试技巧

1. 检查浏览器开发者工具的Network标签，确认正确的语言文件被加载
2. 查看控制台是否有next-intl相关的错误信息
3. 确认cookie中的NEXT_LOCALE值是否正确设置 