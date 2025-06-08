'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, Copy, Minimize2, ArrowUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import JsonInput from '@/components/JsonInput'
import ControlPanel from '@/components/ControlPanel'
import ColorLegend from '@/components/ColorLegend'
import JsonDiffViewer from '@/components/JsonDiffViewer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { formatJson, minifyJson } from '@/utils/jsonFormatter'
import { sortJson, SortOption } from '@/utils/jsonSorter'
import { compareJson, DiffResult } from '@/utils/jsonDiffAdapter'

export default function HomePage() {
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
    // 第一个JSON - 格式化的
    const exampleJson1 = `{
    "bpRel": 2,
    "payDt": "202506",
    "empCd": "80558419",
    "drTagCds": [
        "空"
    ],
    "dateTyp": "付款日期",
    "liveTyps": [
        "全部"
    ],
    "institutionNams": [
        "空"
    ],
    "businessClasses": [
        "\\"中腰达人\\" "
    ],
    "rondaScenes": [
        "全选"
    ],
    "dyAccountNam": "全选",
    "dyAccountIds": [
        "全选"
    ],
    "drUids": [
        "全选"
    ],
    "mediaTyps": [
        "全选"
    ],
    "bdCds": [
        "全选"
    ],
    "bigGroupCds": [
        "全选"
    ],
    "smallGroupCds": [
        "全选"
    ],
    "productCds": [
        "全选"
    ],
    "productTags": [
        "全选"
    ],
    "productTyps": [
        "全选"
    ],
    "costCaliberCd": "1",
    "drTagTyp": 1,
    "orderOrTarget": 5
}`

    // 第二个JSON - 压缩的
    const exampleJson2 = `{"payDt":"202506","dyAccountIds":["全选"],"bpRel":2,"sortTyp":0,"drTagTyp":1,"drTagCds":["空"],"institutionNams":["空"],"orderOrTarget":5,"indexs":["AMV","不保量坑位费"],"productCds":["全选"],"drUids":["全选"],"dateTyp":"付款日期","costCaliberCd":"1","rondaScenes":["全选"],"businessClasses":["中腰达人"],"mediaTyps":["全选"],"bigGroupCds":["全选"],"smallGroupCds":["O10041017"],"bdCds":["全选"],"liveTyps":["全部"],"productTags":["全选"],"productTyps":["全选"],"pageNumber":1}`

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
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col overflow-hidden">
      {/* 页面头部 - 固定高度 */}
      <div className="flex-shrink-0 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* 左侧：标题区域 */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">
              {t('meta.title')}
            </h1>
            <p className="text-gray-300 text-xs">
              {t('meta.description')}
            </p>
          </div>
          
          {/* 中间：状态图例 */}
          <ColorLegend />
          
          {/* 右侧：语言切换器 */}
          <LanguageSwitcher />
        </div>
      </div>

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
                <h2 className="text-lg font-semibold text-white">JSON A</h2>
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
                    if (leftError) setLeftError('') // 清除错误状态
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
                <h2 className="text-lg font-semibold text-white">JSON B</h2>
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
                    if (rightError) setRightError('') // 清除错误状态
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
            {/* 并排的JSON差异显示 */}
            <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0">
              <JsonDiffViewer
                json={compareResult?.leftFormatted || leftJson}
                diffs={compareResult?.diffs || []}
                side="left"
                label="JSON A (左侧)"
              />
              <JsonDiffViewer
                json={compareResult?.rightFormatted || rightJson}
                diffs={compareResult?.diffs || []}
                side="right"
                label="JSON B (右侧)"
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
  )
}