'use client'

import { useState } from 'react'
import { ArrowRight, Copy, Download, FileType, Database } from 'lucide-react'
import { useTranslations } from 'next-intl'
import JsonInput from '@/components/JsonInput'
import { copyToClipboard } from '@/utils/jsonRepairer'

type ConvertFormat = 'xml' | 'csv' | 'yaml' | 'sql'

interface ConvertResult {
  success: boolean
  result?: string
  error?: string
  format: ConvertFormat
}

export default function JsonConvertPage() {
  const t = useTranslations()
  
  const [inputJson, setInputJson] = useState<string>('')
  const [outputFormat, setOutputFormat] = useState<ConvertFormat>('xml')
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null)
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  const formatLabels = {
    xml: t('pages.convert.formatXml'),
    csv: t('pages.convert.formatCsv'),
    yaml: t('pages.convert.formatYaml'), 
    sql: t('pages.convert.formatSql')
  }

  const convertToXML = (obj: any, rootName = 'root', indent = 0): string => {
    const spaces = '  '.repeat(indent)
    
    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        `${spaces}<item${index}>\n${convertToXML(item, 'item', indent + 1)}\n${spaces}</item${index}>`
      ).join('\n')
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).map(([key, value]) => {
        const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_')
        if (typeof value === 'object') {
          return `${spaces}<${safeKey}>\n${convertToXML(value, safeKey, indent + 1)}\n${spaces}</${safeKey}>`
        } else {
          return `${spaces}<${safeKey}>${String(value)}</${safeKey}>`
        }
      }).join('\n')
    }
    
    return `${spaces}${String(obj)}`
  }

  const convertToCSV = (obj: any): string => {
    if (Array.isArray(obj) && obj.length > 0) {
      const allKeys = new Set<string>()
      obj.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => allKeys.add(key))
        }
      })
      
      const headers = Array.from(allKeys)
      const csvHeaders = headers.map(h => `"${h}"`).join(',')
      
      const csvRows = obj.map(item => {
        return headers.map(header => {
          const value = item[header]
          if (value === undefined || value === null) return '""'
          if (typeof value === 'object') return `"${JSON.stringify(value)}"`
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      })
      
      return [csvHeaders, ...csvRows].join('\n')
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = Object.keys(obj)
      const headers = keys.map(k => `"${k}"`).join(',')
      const values = keys.map(k => {
        const value = obj[k]
        if (value === undefined || value === null) return '""'
        if (typeof value === 'object') return `"${JSON.stringify(value)}"`
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
      
      return `${headers}\n${values}`
    }
    
    return '"value"\n"' + String(obj).replace(/"/g, '""') + '"'
  }

  const convertToYAML = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent)
    
    if (Array.isArray(obj)) {
      return obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          return `${spaces}- ${convertToYAML(item, indent + 1).trim()}`
        } else {
          return `${spaces}- ${String(item)}`
        }
      }).join('\n')
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            return `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`
          } else {
            return `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`
          }
        } else {
          return `${spaces}${key}: ${String(value)}`
        }
      }).join('\n')
    }
    
    return `${spaces}${String(obj)}`
  }

  const convertToSQL = (obj: any): string => {
    if (Array.isArray(obj) && obj.length > 0) {
      const columns = new Set<string>()
      obj.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => columns.add(key))
        }
      })
      
      const columnList = Array.from(columns)
      const tableName = 'json_data'
      
      const createTable = `CREATE TABLE ${tableName} (\n${columnList.map(col => 
        `  ${col} TEXT`
      ).join(',\n')}\n);`
      
      const insertStatements = obj.map(item => {
        const values = columnList.map(col => {
          const value = item[col]
          if (value === undefined || value === null) return 'NULL'
          if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`
          return `'${String(value).replace(/'/g, "''")}'`
        })
        
        return `INSERT INTO ${tableName} (${columnList.join(', ')}) VALUES (${values.join(', ')});`
      })
      
      return [createTable, '', ...insertStatements].join('\n')
    } else if (typeof obj === 'object' && obj !== null) {
      const columns = Object.keys(obj)
      const tableName = 'json_data'
      
      const createTable = `CREATE TABLE ${tableName} (\n${columns.map(col => 
        `  ${col} TEXT`
      ).join(',\n')}\n);`
      
      const values = columns.map(col => {
        const value = obj[col]
        if (value === undefined || value === null) return 'NULL'
        if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`
        return `'${String(value).replace(/'/g, "''")}'`
      })
      
      const insertStatement = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`
      
      return [createTable, '', insertStatement].join('\n')
    }
    
    return `-- Cannot convert this JSON to SQL\n-- ${String(obj)}`
  }

  const handleConvert = async () => {
    if (!inputJson.trim()) {
      setConvertResult({
        success: false,
        error: t('errors.enterJsonContent'),
        format: outputFormat
      })
      return
    }

    setIsConverting(true)
    setConvertResult(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const jsonData = JSON.parse(inputJson)
      let convertedResult = ''

      switch (outputFormat) {
        case 'xml':
          convertedResult = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${convertToXML(jsonData, 'root', 1)}\n</root>`
          break
        case 'csv':
          convertedResult = convertToCSV(jsonData)
          break
        case 'yaml':
          convertedResult = convertToYAML(jsonData)
          break
        case 'sql':
          convertedResult = convertToSQL(jsonData)
          break
        default:
          throw new Error(t('errors.convertFailed'))
      }

      setConvertResult({
        success: true,
        result: convertedResult,
        format: outputFormat
      })
    } catch (error: any) {
      setConvertResult({
        success: false,
        error: error.message || t('errors.convertFailed'),
        format: outputFormat
      })
    } finally {
      setIsConverting(false)
    }
  }

  const handleCopy = async () => {
    if (!convertResult?.result) return
    
    try {
      const success = await copyToClipboard(convertResult.result)
      if (success) {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      }
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const handleDownload = () => {
    if (!convertResult?.result) return
    
    try {
      const extensions = { xml: 'xml', csv: 'csv', yaml: 'yml', sql: 'sql' }
      const blob = new Blob([convertResult.result], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      link.href = url
      link.download = `converted-data.${extensions[convertResult.format]}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
    }
  }

  const handleLoadExample = () => {
    const exampleJson = `{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "active": true,
      "joinDate": "2023-01-15"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com", 
      "active": false,
      "joinDate": "2023-02-20"
    }
  ],
  "department": "Engineering",
  "budget": 50000
}`
    
    setInputJson(exampleJson)
    setConvertResult(null)
  }

  return (
    <div className="min-h-screen">
      {/* 页面头部 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            {t('pages.convert.title')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('pages.convert.subtitle')}
          </p>
        </div>
      </div>

      {/* 工具页面内容 */}
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col overflow-hidden">
        {/* 控制面板 */}
        <div className="flex-shrink-0 px-4 py-1">
          <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">{t('pages.convert.convertButton')}:</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as ConvertFormat)}
                className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm border border-gray-600"
              >
                <option value="xml">{formatLabels.xml}</option>
                <option value="csv">{formatLabels.csv}</option>
                <option value="yaml">{formatLabels.yaml}</option>
                <option value="sql">{formatLabels.sql}</option>
              </select>
            </div>
            
            <button
              onClick={handleConvert}
              disabled={isConverting || !inputJson.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isConverting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('status.converting')}
                </>
              ) : (
                <>
                  <ArrowRight size={16} />
                  {t('pages.convert.convertButton')} {formatLabels[outputFormat]}
                </>
              )}
            </button>
            
            <button
              onClick={handleLoadExample}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {t('buttons.loadExample')}
            </button>
            
            {convertResult?.success && (
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
                  {copySuccess ? t('messages.copied') : t('buttons.copyResult')}
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download size={16} />
                  {t('buttons.download')}
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
                <h2 className="text-lg font-semibold text-white">{t('pages.convert.inputLabel')}</h2>
                <div className="text-sm text-gray-400">
                  {t('placeholders.jsonToConvert')}
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <JsonInput
                  value={inputJson}
                  onChange={(value) => {
                    setInputJson(value)
                    if (convertResult) setConvertResult(null)
                  }}
                  placeholder={t('placeholders.jsonToConvert')}
                  error=""
                  isFormatting={isConverting}
                />
              </div>
            </div>

            {/* 右侧：结果区域 */}
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white">{t('pages.convert.outputLabel')}</h2>
                {convertResult?.success && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <FileType size={16} />
                    {formatLabels[convertResult.format]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-h-0">
                {convertResult ? (
                  convertResult.success ? (
                    <JsonInput
                      value={convertResult.result || ''}
                      onChange={() => {}}
                      placeholder=""
                      error=""
                      isFormatting={false}
                      readOnly={true}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full border-2 border-dashed border-red-600 rounded-lg">
                      <div className="text-center text-red-400">
                        <div className="text-lg mb-2">{t('errors.convertFailed')}</div>
                        <div className="text-sm">{convertResult.error}</div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-600 rounded-lg">
                    <div className="text-center text-gray-400">
                      <Database size={48} className="mx-auto mb-4 opacity-50" />
                      <div className="text-lg mb-2">{t('messages.waitingConvert')}</div>
                      <div className="text-sm">{t('messages.inputAndClick')}</div>
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
            {t('footer.convert')}
          </p>
        </div>
      </div>
    </div>
  )
}