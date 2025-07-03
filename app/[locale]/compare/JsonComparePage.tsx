'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, Minimize2, ArrowUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import JsonInput from '@/components/JsonInput'
import ControlPanel from '@/components/ControlPanel'
import ColorLegend from '@/components/ColorLegend'
import JsonDiffViewer from '@/components/JsonDiffViewer'
import { formatJson, minifyJson } from '@/utils/jsonFormatter'
import { sortJson, SortOption } from '@/utils/jsonSorter'
import { compareJson, DiffResult, DiffType } from '@/utils/jsonDiffAdapter'

export default function JsonComparePage() {
  const t = useTranslations()
  
  const [leftJson, setLeftJson] = useState<string>('')
  const [rightJson, setRightJson] = useState<string>('')
  const [sortOption, setSortOption] = useState<SortOption>('none')
  
  // 状态管理
  const [leftError, setLeftError] = useState<string>('')
  const [rightError, setRightError] = useState<string>('')
  const [leftFormatting, setLeftFormatting] = useState<boolean>(false)
  const [rightFormatting, setRightFormatting] = useState<boolean>(false)
  const [leftSorting, setLeftSorting] = useState<boolean>(false)
  const [rightSorting, setRightSorting] = useState<boolean>(false)
  
  // 比较结果状态
  const [compareResult, setCompareResult] = useState<DiffResult | null>(null)
  const [isComparing, setIsComparing] = useState<boolean>(false)
  const [showComparison, setShowComparison] = useState<boolean>(false)

  const handleCompare = async () => {
    // 检查输入
    if (!leftJson.trim() || !rightJson.trim()) {
      setLeftError(!leftJson.trim() ? t('errors.enterLeftJson') : '')
      setRightError(!rightJson.trim() ? t('errors.enterRightJson') : '')
      return
    }

    // 开始比较
    setIsComparing(true)
    setCompareResult(null)

    try {
      // 模拟异步操作，提供视觉反馈
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const result = compareJson(leftJson, rightJson)
      
      if (result.success) {
        setCompareResult(result)
        setShowComparison(true)
        // 清除错误状态
        setLeftError('')
        setRightError('')
      } else {
        // 显示比较错误
        if (result.error?.includes('左侧') || result.error?.includes('left')) {
          setLeftError(result.error)
        } else if (result.error?.includes('右侧') || result.error?.includes('right')) {
          setRightError(result.error)
        } else {
          setLeftError(result.error || t('errors.compareFailed'))
        }
      }
    } catch (error) {
      setLeftError(t('errors.compareError'))
    } finally {
      setIsComparing(false)
    }
  }

  const handleFormat = async (side: 'left' | 'right', mode: 'format' | 'minify' = 'format') => {
    const isLeft = side === 'left'
    const currentJson = isLeft ? leftJson : rightJson
    const setJson = isLeft ? setLeftJson : setRightJson
    const setError = isLeft ? setLeftError : setRightError
    const setFormatting = isLeft ? setLeftFormatting : setRightFormatting

    // 清除之前的错误
    setError('')
    
    // 检查是否为空
    if (!currentJson.trim()) {
      setError(t('errors.enterJsonContent'))
      return
    }

    // 开始格式化
    setFormatting(true)

    try {
      // 模拟异步操作，提供视觉反馈
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result = mode === 'format' ? formatJson(currentJson) : minifyJson(currentJson)
      
      if (result.success && result.formattedJson) {
        setJson(result.formattedJson)
        setError('')
      } else {
        setError(result.error || t('errors.formatFailed'))
      }
    } catch (error) {
      setError(t('errors.formatError'))
    } finally {
      setFormatting(false)
    }
  }

  // 排序处理函数
  const handleSort = useCallback(async (side: 'left' | 'right', sortType: SortOption) => {
    const isLeft = side === 'left'
    const currentJson = isLeft ? leftJson : rightJson
    const setJson = isLeft ? setLeftJson : setRightJson
    const setError = isLeft ? setLeftError : setRightError
    const setSorting = isLeft ? setLeftSorting : setRightSorting

    // 清除之前的错误
    setError('')
    
    // 检查是否为空
    if (!currentJson.trim()) {
      return
    }

    // 开始排序
    setSorting(true)

    try {
      // 模拟异步操作，提供视觉反馈
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const result = sortJson(currentJson, sortType, t)
      
      if (result.success && result.sortedJson) {
        setJson(result.sortedJson)
        setError('')
      } else {
        setError(result.error || t('errors.sortFailed'))
      }
    } catch (error) {
      setError(t('errors.sortError'))
    } finally {
      setSorting(false)
    }
  }, [leftJson, rightJson, setLeftJson, setRightJson, setLeftError, setRightError, setLeftSorting, setRightSorting, t])

  // 自动排序：当排序选项改变时，自动应用到有内容的JSON
  useEffect(() => {
    const applySort = async () => {
      const promises: Promise<void>[] = []
      
      if (leftJson.trim() && sortOption !== 'none') {
        promises.push(handleSort('left', sortOption))
      }
      
      if (rightJson.trim() && sortOption !== 'none') {
        promises.push(handleSort('right', sortOption))
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }
    }

    applySort()
  }, [sortOption, leftJson, rightJson, handleSort])

  // 手动排序按钮处理
  const handleManualSort = async (side: 'left' | 'right') => {
    await handleSort(side, sortOption)
  }

  // 一键格式化两边的JSON
  const handleFormatBoth = async () => {
    const promises: Promise<void>[] = []
    
    if (leftJson.trim()) {
      promises.push(handleFormat('left', 'format'))
    }
    
    if (rightJson.trim()) {
      promises.push(handleFormat('right', 'format'))
    }

    await Promise.all(promises)
  }

  // 加载示例数据
  const handleLoadExample = () => {
    // 第一个JSON - 用户数据结构
    const exampleJson1 = `{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@company.com",
      "role": "developer",
      "skills": ["JavaScript", "React", "Node.js"],
      "active": true,
      "joinDate": "2023-01-15"
    },
    {
      "id": 2,
      "name": "Bob Smith", 
      "email": "bob@company.com",
      "role": "designer",
      "skills": ["Figma", "Photoshop"],
      "active": true,
      "joinDate": "2023-02-20"
    }
  ],
  "department": "Engineering",
  "budget": 50000,
  "projects": ["Website Redesign", "Mobile App"]
}`

    // 第二个JSON - 修改后的数据
    const exampleJson2 = `{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice.johnson@company.com",
      "role": "senior-developer",
      "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
      "active": true,
      "joinDate": "2023-01-15",
      "salary": 85000
    },
    {
      "id": 3,
      "name": "Charlie Wilson",
      "email": "charlie@company.com", 
      "role": "developer",
      "skills": ["Python", "Django"],
      "active": true,
      "joinDate": "2023-03-10"
    }
  ],
  "department": "Engineering",
  "budget": 75000,
  "projects": ["Website Redesign", "Mobile App", "API Development"],
  "manager": "David Brown"
}`

    // 设置示例数据
    setLeftJson(exampleJson1)
    setRightJson(exampleJson2)
    
    // 清除错误状态
    setLeftError('')
    setRightError('')
    
    // 如果当前在比较模式，切换回编辑模式
    setShowComparison(false)
    setCompareResult(null)
  }

  return (
    <div className="min-h-screen">
      {/* 页面头部 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t('pages.compare.title')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('pages.compare.subtitle')}
          </p>
        </div>

        {/* 状态图例 */}
        <div className="flex justify-center mb-6">
          <ColorLegend />
        </div>
      </div>

      {/* 工具页面内容 */}
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col overflow-hidden">
        {/* 控制面板 - 固定高度 */}
        <div className="flex-shrink-0 px-4 py-1">
          <ControlPanel 
            sortOption={sortOption}
            onSortChange={setSortOption}
            onCompare={handleCompare}
            onFormatBoth={handleFormatBoth}
            onLoadExample={handleLoadExample}
            hasContent={leftJson.trim() !== '' || rightJson.trim() !== ''}
            isComparing={isComparing}
          />
        </div>

        {/* 主要内容区域 - 占满剩余视口空间 */}
        <div className="flex-1 px-4 min-h-0 overflow-hidden">
          {!showComparison ? (
            /* 编辑模式 */
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 h-full">
              {/* 左侧JSON输入 */}
              <div className="flex flex-col h-full min-h-0">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-white">{t('pages.compare.originalLabel')}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFormat('left', 'format')}
                      disabled={leftFormatting || leftSorting || !leftJson.trim()}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors"
                    >
                      <Settings size={14} />
                      {t('buttons.format')}
                    </button>
                    <button
                      onClick={() => handleFormat('left', 'minify')}
                      disabled={leftFormatting || leftSorting || !leftJson.trim()}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors"
                    >
                      <Minimize2 size={14} />
                      {t('buttons.minify')}
                    </button>
                    {sortOption !== 'none' && (
                      <button
                        onClick={() => handleManualSort('left')}
                        disabled={leftFormatting || leftSorting || !leftJson.trim()}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors"
                      >
                        <ArrowUpDown size={14} />
                        {t('buttons.sort')}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <JsonInput
                    value={leftJson}
                    onChange={(value) => {
                      setLeftJson(value)
                      if (leftError) setLeftError('')
                    }}
                    placeholder={t('placeholders.leftJson')}
                    error={leftError}
                    isFormatting={leftFormatting || leftSorting}
                  />
                </div>
              </div>

              {/* 右侧JSON输入 */}
              <div className="flex flex-col h-full min-h-0">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-white">{t('pages.compare.comparedLabel')}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFormat('right', 'format')}
                      disabled={rightFormatting || rightSorting || !rightJson.trim()}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors"
                    >
                      <Settings size={14} />
                      {t('buttons.format')}
                    </button>
                    <button
                      onClick={() => handleFormat('right', 'minify')}
                      disabled={rightFormatting || rightSorting || !rightJson.trim()}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors"
                    >
                      <Minimize2 size={14} />
                      {t('buttons.minify')}
                    </button>
                    {sortOption !== 'none' && (
                      <button
                        onClick={() => handleManualSort('right')}
                        disabled={rightFormatting || rightSorting || !rightJson.trim()}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors"
                      >
                        <ArrowUpDown size={14} />
                        {t('buttons.sort')}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <JsonInput
                    value={rightJson}
                    onChange={(value) => {
                      setRightJson(value)
                      if (rightError) setRightError('')
                    }}
                    placeholder={t('placeholders.rightJson')}
                    error={rightError}
                    isFormatting={rightFormatting || rightSorting}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 比较模式 */
            <div className="h-full flex flex-col min-h-0">
              {/* 差异统计 */}
              {compareResult && (
                <div className="flex-shrink-0 mb-4 bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">{t('pages.compare.statsTitle')}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400">{t('pages.compare.statsAdded')}: {compareResult.diffs?.filter(d => d.type === DiffType.ADDED).length || 0}</span>
                      <span className="text-red-400">{t('pages.compare.statsRemoved')}: {compareResult.diffs?.filter(d => d.type === DiffType.REMOVED).length || 0}</span>
                      <span className="text-yellow-400">{t('pages.compare.statsChanged')}: {compareResult.diffs?.filter(d => d.type === DiffType.CHANGED).length || 0}</span>
                      <span className="text-blue-400">{t('pages.compare.statsMoved')}: {compareResult.diffs?.filter(d => d.type === DiffType.MOVED).length || 0}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 并排的JSON差异显示 */}
              <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0">
                <JsonDiffViewer
                  json={compareResult?.leftFormatted || leftJson}
                  diffs={compareResult?.diffs || []}
                  side="left"
                  label={t('pages.compare.originalLabel')}
                />
                <JsonDiffViewer
                  json={compareResult?.rightFormatted || rightJson}
                  diffs={compareResult?.diffs || []}
                  side="right"
                  label={t('pages.compare.comparedLabel')}
                />
              </div>
              
              {/* 返回编辑按钮 */}
              <div className="text-center py-2 flex-shrink-0">
                <button
                  onClick={() => setShowComparison(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  {t('buttons.backToEdit')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 - 固定高度 */}
        <div className="flex-shrink-0 px-4 py-1">
          <p className="text-gray-400 text-xs text-center">
            {t('footer.tip')}
          </p>
        </div>
      </div>
    </div>
  )
}