'use client'

import { useState } from 'react'
import { Settings, Copy, Minimize2, ArrowUpDown, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import JsonInput from '@/components/JsonInput'
import { formatJson, minifyJson } from '@/utils/jsonFormatter'
import { sortJson, SortOption } from '@/utils/jsonSorter'
import { downloadJson, copyToClipboard } from '@/utils/jsonRepairer'

export default function JsonFormatPage() {
  const t = useTranslations()
  
  const [inputJson, setInputJson] = useState<string>('')
  const [outputJson, setOutputJson] = useState<string>('')
  const [sortOption, setSortOption] = useState<SortOption>('none')
  
  // 状态管理
  const [inputError, setInputError] = useState<string>('')
  const [outputError, setOutputError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  const handleFormat = async (mode: 'format' | 'minify' = 'format') => {
    if (!inputJson.trim()) {
      setInputError(t('errors.enterJsonContent'))
      return
    }

    setIsProcessing(true)
    setInputError('')
    setOutputError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let result = mode === 'format' ? formatJson(inputJson) : minifyJson(inputJson)
      
      if (result.success && result.formattedJson) {
        // 如果选择了排序选项，则应用排序
        if (sortOption !== 'none') {
          const sortResult = sortJson(result.formattedJson, sortOption, t)
          if (sortResult.success && sortResult.sortedJson) {
            result.formattedJson = sortResult.sortedJson
          }
        }
        
        setOutputJson(result.formattedJson)
        setOutputError('')
      } else {
        setOutputError(result.error || t('errors.formatFailed'))
        setOutputJson('')
      }
    } catch (error) {
      setOutputError(t('errors.formatError'))
      setOutputJson('')
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
      setOutputError(t('errors.copyFailed'))
    }
  }

  const handleDownload = () => {
    if (!outputJson) return
    
    try {
      downloadJson(outputJson, 'formatted-json')
    } catch (error) {
      setOutputError(t('errors.downloadFailed'))
    }
  }

  const handleLoadExample = () => {
    const exampleJson = `{"name":"John Doe","age":30,"email":"john@example.com","address":{"street":"123 Main St","city":"New York","zipCode":10001},"hobbies":["reading","coding","traveling"],"isActive":true,"metadata":{"lastLogin":"2024-01-15T10:30:00Z","preferences":{"theme":"dark","language":"en"}}}`
    
    setInputJson(exampleJson)
    setOutputJson('')
    setInputError('')
    setOutputError('')
  }

  return (
    <div className="min-h-screen">
      {/* 页面头部 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            {t('pages.format.title')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('pages.format.subtitle')}
          </p>
        </div>
      </div>

      {/* 工具页面内容 */}
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col overflow-hidden">
        {/* 控制面板 - 固定高度 */}
        <div className="flex-shrink-0 px-4 py-1">
          <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">{t('pages.format.sortLabel')}:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm border border-gray-600"
              >
                <option value="none">{t('pages.format.sortNone')}</option>
                <option value="alphabetical">{t('pages.format.sortAlpha')}</option>
                <option value="type">{t('pages.format.sortType')}</option>
              </select>
            </div>
            
            <button
              onClick={() => handleFormat('format')}
              disabled={isProcessing || !inputJson.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('status.processing')}
                </>
              ) : (
                <>
                  <Settings size={16} />
                  {t('pages.format.formatButton')}
                </>
              )}
            </button>
            
            <button
              onClick={() => handleFormat('minify')}
              disabled={isProcessing || !inputJson.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <Minimize2 size={16} />
              {t('pages.format.minifyButton')}
            </button>
            
            <button
              onClick={handleLoadExample}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {t('buttons.loadExample')}
            </button>
            
            {outputJson && (
              <>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    copySuccess 
                      ? 'bg-green-600 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Copy size={16} />
                  {copySuccess ? t('messages.copied') : t('buttons.copyResult')}
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download size={16} />
                  {t('buttons.downloadJson')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 主要内容区域 - 占满剩余视口空间 */}
        <div className="flex-1 px-4 min-h-0 overflow-hidden">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 h-full">
            {/* 左侧：输入区域 */}
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">{t('pages.format.originalLabel')}</h2>
                <div className="text-sm text-gray-400">
                  {t('placeholders.jsonToFormat')}
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <JsonInput
                  value={inputJson}
                  onChange={(value) => {
                    setInputJson(value)
                    if (inputError) setInputError('')
                    if (outputJson) setOutputJson('')
                  }}
                  placeholder={t('placeholders.jsonToFormat')}
                  error={inputError}
                  isFormatting={isProcessing}
                />
              </div>
            </div>

            {/* 右侧：结果区域 */}
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">{t('pages.format.resultLabel')}</h2>
                {outputJson && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {t('messages.formatSuccess')}
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0">
                {outputJson ? (
                  <JsonInput
                    value={outputJson}
                    onChange={() => {}}
                    placeholder=""
                    error={outputError}
                    isFormatting={false}
                    readOnly={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-600 rounded-lg">
                    <div className="text-center text-gray-400">
                      <div className="text-lg mb-2">
                        {t('messages.waitingFormat')}
                      </div>
                      <div className="text-sm">
                        {t('messages.inputAndClick')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部提示 - 固定高度 */}
        <div className="flex-shrink-0 px-4 py-1">
          <p className="text-gray-400 text-xs text-center">
            {t('footer.format')}
          </p>
        </div>
      </div>
    </div>
  )
}