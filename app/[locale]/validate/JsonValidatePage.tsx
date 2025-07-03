'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import JsonInput from '@/components/JsonInput'
import { copyToClipboard } from '@/utils/jsonRepairer'

interface ValidationResult {
  valid: boolean
  error?: string
  line?: number
  column?: number
  errorType?: string
  suggestion?: string
  details?: string
}

export default function JsonValidatePage() {
  const t = useTranslations()
  
  const [inputJson, setInputJson] = useState<string>('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  const validateJson = async () => {
    if (!inputJson.trim()) {
      setValidationResult({
        valid: false,
        error: t('errors.enterJsonContent'),
        errorType: 'empty'
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 尝试解析JSON
      JSON.parse(inputJson)
      
      // 如果成功，JSON是有效的
      setValidationResult({
        valid: true
      })
    } catch (error: any) {
      // 解析错误，提供详细的错误信息
      let errorLine = 1
      let errorColumn = 1
      let errorType = 'syntax'
      let suggestion = ''
      let details = error.message

      // 尝试从错误消息中提取行号和列号
      const lineMatch = error.message.match(/line (\d+)/i)
      const columnMatch = error.message.match(/column (\d+)/i)
      const positionMatch = error.message.match(/position (\d+)/i)

      if (lineMatch) {
        errorLine = parseInt(lineMatch[1])
      }
      if (columnMatch) {
        errorColumn = parseInt(columnMatch[1])
      }

      // 分析错误类型并提供建议（这里应该根据语言提供不同的建议，但为了简化，先用通用的）
      if (error.message.includes('Unexpected token')) {
        errorType = 'unexpected_token'
        suggestion = t('errors.invalidJsonFormat')
      } else if (error.message.includes('Unexpected end')) {
        errorType = 'unexpected_end'  
        suggestion = t('errors.invalidJsonFormat')
      } else if (error.message.includes('Bad control character')) {
        errorType = 'control_character'
        suggestion = t('errors.invalidJsonFormat')
      }

      setValidationResult({
        valid: false,
        error: error.message,
        line: errorLine,
        column: errorColumn,
        errorType,
        suggestion,
        details
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleCopy = async () => {
    if (!inputJson) return
    
    try {
      const success = await copyToClipboard(inputJson)
      if (success) {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      }
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const handleLoadExample = (type: 'valid' | 'invalid') => {
    if (type === 'valid') {
      const validJson = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": 10001
  },
  "hobbies": ["reading", "coding", "traveling"],
  "isActive": true,
  "metadata": {
    "lastLogin": "2024-01-15T10:30:00Z",
    "preferences": {
      "theme": "dark",
      "language": "en"
    }
  }
}`
      setInputJson(validJson)
    } else {
      const invalidJson = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": 10001,
  },
  "hobbies": ["reading", "coding", "traveling",],
  "isActive": true,
}`
      setInputJson(invalidJson)
    }
    setValidationResult(null)
  }

  return (
    <div className="min-h-screen">
      {/* 页面头部 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            {t('pages.validate.title')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('pages.validate.subtitle')}
          </p>
        </div>
      </div>

      {/* 工具页面内容 */}
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col overflow-hidden">
        {/* 控制面板 - 固定高度 */}
        <div className="flex-shrink-0 px-4 py-1">
          <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
            <button
              onClick={validateJson}
              disabled={isValidating || !inputJson.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('status.validating')}
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  {t('pages.validate.validateButton')}
                </>
              )}
            </button>
            
            <button
              onClick={() => handleLoadExample('valid')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('pages.validate.validExample')}
            </button>
            
            <button
              onClick={() => handleLoadExample('invalid')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('pages.validate.invalidExample')}
            </button>
            
            {inputJson && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  copySuccess 
                    ? 'bg-green-600 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Copy size={16} />
                {copySuccess ? t('messages.copied') : t('buttons.copy')}
              </button>
            )}
          </div>
        </div>

        {/* 主要内容区域 - 占满剩余视口空间 */}
        <div className="flex-1 px-4 min-h-0 overflow-hidden">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 h-full">
            {/* 左侧：输入区域 */}
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">{t('pages.validate.inputLabel')}</h2>
                <div className="text-sm text-gray-400">
                  {t('placeholders.jsonToValidate')}
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <JsonInput
                  value={inputJson}
                  onChange={(value) => {
                    setInputJson(value)
                    if (validationResult) setValidationResult(null)
                  }}
                  placeholder={t('placeholders.jsonToValidate')}
                  error=""
                  isFormatting={isValidating}
                />
              </div>
            </div>

            {/* 右侧：验证结果区域 */}
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">{t('pages.validate.resultLabel')}</h2>
                {validationResult && (
                  <div className={`flex items-center gap-2 text-sm ${
                    validationResult.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      validationResult.valid ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    {validationResult.valid ? t('status.valid') : 'JSON无效'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0">
                {validationResult ? (
                  <div className="h-full bg-gray-800 rounded-lg p-4 overflow-y-auto">
                    {validationResult.valid ? (
                      /* 验证成功 */
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <CheckCircle size={64} className="text-green-400 mb-4" />
                        <h3 className="text-xl font-semibold text-green-400 mb-2">
                          {t('pages.validate.validResult')}
                        </h3>
                        <p className="text-gray-300">
                          {t('pages.validate.validMessage')}
                        </p>
                      </div>
                    ) : (
                      /* 验证失败 */
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <XCircle size={24} className="text-red-400 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-semibold text-red-400 mb-2">
                              {t('pages.validate.errorTitle')}
                            </h3>
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
                              <p className="text-red-300 text-sm font-mono">
                                {validationResult.error}
                              </p>
                            </div>
                          </div>
                        </div>

                        {(validationResult.line || validationResult.column) && (
                          <div className="bg-gray-700 rounded-lg p-3">
                            <h4 className="text-white font-medium mb-2">{t('pages.validate.errorLocation')}</h4>
                            <p className="text-gray-300 text-sm">
                              行 {validationResult.line}, 列 {validationResult.column}
                            </p>
                          </div>
                        )}

                        {validationResult.suggestion && (
                          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="text-yellow-400 font-medium mb-1">{t('pages.validate.errorSuggestion')}</h4>
                                <p className="text-yellow-300 text-sm">
                                  {validationResult.suggestion}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-700 rounded-lg p-3">
                          <h4 className="text-white font-medium mb-2">{t('pages.validate.commonErrors')}</h4>
                          <ul className="text-gray-300 text-sm space-y-1">
                            <li>• 缺少逗号分隔符</li>
                            <li>• 多余的尾随逗号</li>
                            <li>• 未闭合的引号或括号</li>
                            <li>• 使用单引号而非双引号</li>
                            <li>• 对象键名未使用引号</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-600 rounded-lg">
                    <div className="text-center text-gray-400">
                      <div className="text-lg mb-2">
                        {t('messages.waitingValidate')}
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
            {t('footer.validation')}
          </p>
        </div>
      </div>
    </div>
  )
}