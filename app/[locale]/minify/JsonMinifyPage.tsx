'use client'

import { useState } from 'react'
import { Minimize2, Copy, Download, BarChart3, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import JsonInput from '@/components/JsonInput'
import { minifyJson } from '@/utils/jsonFormatter'
import { copyToClipboard } from '@/utils/jsonRepairer'

interface CompressionStats {
  originalSize: number
  minifiedSize: number
  compressionRatio: number
  spaceSaved: number
}

export default function JsonMinifyPage() {
  const t = useTranslations()
  
  const [inputJson, setInputJson] = useState<string>('')
  const [outputJson, setOutputJson] = useState<string>('')
  const [stats, setStats] = useState<CompressionStats | null>(null)
  
  const [inputError, setInputError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  const calculateCompressionStats = (original: string, minified: string): CompressionStats => {
    const originalSize = new Blob([original]).size
    const minifiedSize = new Blob([minified]).size
    const spaceSaved = originalSize - minifiedSize
    const compressionRatio = originalSize > 0 ? (spaceSaved / originalSize) * 100 : 0

    return {
      originalSize,
      minifiedSize,
      compressionRatio,
      spaceSaved
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleMinify = async () => {
    if (!inputJson.trim()) {
      setInputError('请输入JSON内容')
      return
    }

    setIsProcessing(true)
    setInputError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result = minifyJson(inputJson)
      
      if (result.success && result.formattedJson) {
        setOutputJson(result.formattedJson)
        setStats(calculateCompressionStats(inputJson, result.formattedJson))
        setInputError('')
      } else {
        setInputError(result.error || '压缩失败')
        setOutputJson('')
        setStats(null)
      }
    } catch (error) {
      setInputError('压缩过程中发生错误')
      setOutputJson('')
      setStats(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = async () => {
    if (!outputJson) return
    
    try {
      const success = await copyToClipboard(outputJson)
      if (success) {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      }
    } catch (error) {
      setInputError('复制失败')
    }
  }

  const handleDownload = () => {
    if (!outputJson) return
    
    try {
      const blob = new Blob([outputJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'minified.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setInputError('下载失败')
    }
  }

  const handleLoadExample = () => {
    const exampleJson = `{
  "companyInfo": {
    "name": "Tech Solutions Inc.",
    "founded": 2015,
    "headquarters": {
      "address": "123 Innovation Drive, Tech City",
      "coordinates": {
        "latitude": 37.7749,
        "longitude": -122.4194
      }
    },
    "employees": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "position": "Senior Software Engineer",
        "department": "Engineering",
        "skills": [
          "JavaScript",
          "Python",
          "React",
          "Node.js",
          "Docker"
        ],
        "contact": {
          "email": "john.doe@company.com",
          "phone": "+1-555-0123"
        },
        "startDate": "2020-03-15",
        "active": true
      },
      {
        "id": 2,
        "firstName": "Jane",
        "lastName": "Smith",
        "position": "Product Manager",
        "department": "Product",
        "skills": [
          "Product Strategy",
          "User Research",
          "Analytics",
          "Agile"
        ],
        "contact": {
          "email": "jane.smith@company.com",
          "phone": "+1-555-0456"
        },
        "startDate": "2019-08-22",
        "active": true
      }
    ]
  },
  "products": [
    {
      "name": "CloudSync Pro",
      "version": "2.1.0",
      "description": "Advanced cloud synchronization solution for enterprise",
      "features": [
        "Real-time sync",
        "End-to-end encryption",
        "Multi-platform support",
        "Advanced analytics"
      ]
    }
  ]
}`
    
    setInputJson(exampleJson)
    setOutputJson('')
    setStats(null)
    setInputError('')
  }

  return (
    <div className="min-h-screen">
      {/* 页面头部 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
            JSON压缩工具
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            智能JSON压缩工具，移除多余空格、换行符和注释，大幅减小文件大小。
            保持JSON结构完整性，让数据传输更高效。
          </p>
        </div>
      </div>

      {/* 工具页面内容 */}
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col overflow-hidden">
        {/* 控制面板 */}
        <div className="flex-shrink-0 px-4 py-1">
          <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
            <button
              onClick={handleMinify}
              disabled={isProcessing || !inputJson.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  压缩中...
                </>
              ) : (
                <>
                  <Minimize2 size={16} />
                  压缩JSON
                </>
              )}
            </button>
            
            <button
              onClick={handleLoadExample}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              <FileText size={16} />
              加载示例
            </button>
            
            {outputJson && (
              <>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    copySuccess 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Copy size={16} />
                  {copySuccess ? '已复制' : '复制结果'}
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download size={16} />
                  下载JSON
                </button>
              </>
            )}
          </div>
        </div>

        {/* 压缩统计 */}
        {stats && (
          <div className="flex-shrink-0 px-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={18} className="text-green-400" />
                <h3 className="text-white font-semibold">压缩统计</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-400">原始大小</div>
                  <div className="text-white font-medium">{formatBytes(stats.originalSize)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">压缩后</div>
                  <div className="text-green-400 font-medium">{formatBytes(stats.minifiedSize)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">节省空间</div>
                  <div className="text-blue-400 font-medium">{formatBytes(stats.spaceSaved)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">压缩率</div>
                  <div className="text-yellow-400 font-medium">{stats.compressionRatio.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="flex-1 px-4 min-h-0 overflow-hidden">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 h-full">
            {/* 左侧：输入区域 */}
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">原始JSON</h2>
                <div className="text-sm text-gray-400">
                  支持格式化的JSON
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <JsonInput
                  value={inputJson}
                  onChange={(value) => {
                    setInputJson(value)
                    if (inputError) setInputError('')
                    if (outputJson) {
                      setOutputJson('')
                      setStats(null)
                    }
                  }}
                  placeholder="粘贴需要压缩的JSON..."
                  error={inputError}
                  isFormatting={isProcessing}
                />
              </div>
            </div>

            {/* 右侧：结果区域 */}
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">压缩结果</h2>
                {outputJson && stats && (
                  <div className="text-sm text-green-400">
                    减小 {stats.compressionRatio.toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0">
                {outputJson ? (
                  <JsonInput
                    value={outputJson}
                    onChange={() => {}}
                    placeholder=""
                    error=""
                    isFormatting={false}
                    readOnly={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-600 rounded-lg">
                    <div className="text-center text-gray-400">
                      <Minimize2 size={48} className="mx-auto mb-4 opacity-50" />
                      <div className="text-lg mb-2">等待压缩</div>
                      <div className="text-sm">输入JSON并点击压缩按钮</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="flex-shrink-0 px-4 py-1">
          <p className="text-gray-400 text-xs text-center">
            智能压缩算法，最大化减小文件大小的同时保持JSON结构完整性
          </p>
        </div>
      </div>
    </div>
  )
}