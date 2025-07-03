'use client'

import { useState } from 'react'
import { Settings, Copy, Download, AlertTriangle, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import JsonInput from '@/components/JsonInput'
import { repairJson, RepairResult, downloadJson, copyToClipboard } from '@/utils/jsonRepairer'

export default function JsonRepairPage() {
  const t = useTranslations()
  
  const [repairInput, setRepairInput] = useState<string>('')
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null)
  const [isRepairing, setIsRepairing] = useState<boolean>(false)
  const [repairError, setRepairError] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  const handleRepairJson = async () => {
    if (!repairInput.trim()) {
      setRepairError(t('errors.enterJsonContent'))
      return
    }

    setIsRepairing(true)
    setRepairError('')
    setRepairResult(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const result = repairJson(repairInput)
      setRepairResult(result)
      
      if (!result.success) {
        setRepairError(result.error || t('errors.repairFailed'))
      }
    } catch (error) {
      setRepairError(t('errors.repairError'))
    } finally {
      setIsRepairing(false)
    }
  }

  const handleCopyRepaired = async () => {
    if (!repairResult?.repairedJson) return
    
    try {
      const success = await copyToClipboard(repairResult.repairedJson)
      if (success) {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      }
    } catch (error) {
      setRepairError(t('errors.copyFailed'))
    }
  }

  const handleDownloadRepaired = () => {
    if (!repairResult?.repairedJson) return
    
    try {
      downloadJson(repairResult.repairedJson, 'repaired-json')
    } catch (error) {
      setRepairError(t('errors.downloadFailed'))
    }
  }

  const handleLoadExample = () => {
    const brokenJson = `{
    name: 'John Doe', // 姓名注释
    age: 30,
    email: "john@example.com"
    address: {
      street: '123 Main St',
      city: "New York",
      zipCode: 10001,
    },
    hobbies: ['reading', "coding", 'traveling',],
    isActive: true,
    spouse: undefined,
    'phone-number': '+1234567890',
    metadata: {
      created: new Date(),
      tags: ["user", "active",]
    }
}`
    
    setRepairInput(brokenJson)
    setRepairResult(null)
    setRepairError('')
  }

  return (
    <div className="min-h-screen">
      {/* 页面头部 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            {t('pages.repair.title')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('pages.repair.subtitle')}
          </p>
        </div>
      </div>

      {/* 工具页面内容 */}
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col overflow-hidden">
        {/* 控制面板 */}
        <div className="flex-shrink-0 px-4 py-1">
          <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
            <button
              onClick={handleRepairJson}
              disabled={isRepairing || !repairInput.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isRepairing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('status.repairing')}
                </>
              ) : (
                <>
                  <Settings size={16} />
                  {t('pages.repair.repairButton')}
                </>
              )}
            </button>
            
            <button
              onClick={handleLoadExample}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {t('pages.repair.loadExample')}
            </button>
            
            {repairResult?.success && (
              <>
                <button
                  onClick={handleCopyRepaired}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    copySuccess 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Copy size={16} />
                  {copySuccess ? t('messages.copied') : t('buttons.copyRepaired')}
                </button>
                
                <button
                  onClick={handleDownloadRepaired}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download size={16} />
                  {t('buttons.downloadJson')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 px-4 min-h-0 overflow-hidden">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 h-full">
            {/* 左侧：输入区域 */}
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">{t('pages.repair.inputLabel')}</h2>
                <div className="text-sm text-gray-400">
                  {t('placeholders.brokenJson')}
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <JsonInput
                  value={repairInput}
                  onChange={(value) => {
                    setRepairInput(value)
                    if (repairError) setRepairError('')
                    if (repairResult) setRepairResult(null)
                  }}
                  placeholder={t('placeholders.brokenJson')}
                  error={repairError}
                  isFormatting={isRepairing}
                />
              </div>
            </div>

            {/* 右侧：结果区域 */}
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">{t('pages.repair.resultLabel')}</h2>
                {repairResult?.success && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle size={16} />
                    {t('pages.repair.repairSuccess')}
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0">
                {repairResult ? (
                  <div className="h-full flex flex-col">
                    {repairResult.success ? (
                      <>
                        {/* 修复后的JSON */}
                        <div className="flex-1 min-h-0 mb-4">
                          <JsonInput
                            value={repairResult.repairedJson || ''}
                            onChange={() => {}}
                            placeholder=""
                            error=""
                            isFormatting={false}
                            readOnly={true}
                          />
                        </div>
                        
                        {/* 修复信息 */}
                        <div className="flex-shrink-0 bg-gray-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle size={18} className="text-green-400" />
                            <h3 className="text-sm font-medium text-green-400">
                              {t('pages.repair.repairSuccess')} (引擎: {repairResult.engine})
                            </h3>
                          </div>
                          
                          {repairResult.fixes && repairResult.fixes.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-white mb-2">{t('pages.repair.appliedFixes')}:</h4>
                              <ul className="text-xs text-gray-300 space-y-1">
                                {repairResult.fixes.map((fix, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-400 mt-0.5">•</span>
                                    <span>{fix}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {repairResult.warnings && repairResult.warnings.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-yellow-400 mb-2 flex items-center gap-1">
                                <AlertTriangle size={14} />
                                {t('pages.repair.warnings')}:
                              </h4>
                              <ul className="text-xs text-gray-300 space-y-1">
                                {repairResult.warnings.map((warning, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-yellow-400 mt-0.5">⚠</span>
                                    <span>{warning}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      /* 修复失败 */
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
                          <div className="text-red-400 text-lg mb-2">{t('pages.repair.repairFailed')}</div>
                          <div className="text-gray-400 text-sm max-w-md">
                            {repairResult.error}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 初始状态 */
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-600 rounded-lg">
                    <div className="text-center text-gray-400">
                      <Settings size={48} className="mx-auto mb-4 opacity-50" />
                      <div className="text-lg mb-2">{t('messages.waitingRepair')}</div>
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

        {/* 底部提示 */}
        <div className="flex-shrink-0 px-4 py-1">
          <p className="text-gray-400 text-xs text-center">
            {t('footer.repair')}
          </p>
        </div>
      </div>
    </div>
  )
}