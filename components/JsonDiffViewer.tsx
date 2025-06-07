import { useMemo } from 'react'
import { DiffItem, DiffType, getDiffColorClass, getDiffIcon } from '@/utils/jsonDiffer'
import { simpleButAccurateMatch } from '@/utils/preciseJsonMatcher'

interface JsonDiffViewerProps {
  json: string
  diffs: DiffItem[]
  side: 'left' | 'right'
  label: string
}

interface LineInfo {
  lineNumber: number
  content: string
  diffs: DiffItem[]
}

export default function JsonDiffViewer({ json, diffs, side, label }: JsonDiffViewerProps) {
  
  // 解析JSON并生成带行号的结构  
  const linesWithDiffs = useMemo(() => {
    if (!json.trim()) return []
    
    const lines = json.split('\n')
    const result: LineInfo[] = []
    
    // 使用精确匹配算法
    const lineMatchMap = simpleButAccurateMatch(json, diffs, side)
    
    lines.forEach((content, index) => {
      const lineNumber = index + 1
      
      // 获取这一行的差异（如果有）
      const lineDiffs = lineMatchMap.get(lineNumber) || []
      
      result.push({
        lineNumber,
        content,
        diffs: lineDiffs
      })
    })
    
    return result
  }, [json, diffs, side])

  // 获取差异统计用于显示标题
  const stats = useMemo(() => {
    const sideRelevantDiffs = diffs.filter(diff => {
      if (side === 'left') {
        return diff.type === DiffType.REMOVED || diff.type === DiffType.DIFFERENT
      } else {
        return diff.type === DiffType.ADDED || diff.type === DiffType.DIFFERENT
      }
    })
    
    return {
      added: sideRelevantDiffs.filter(d => d.type === DiffType.ADDED).length,
      removed: sideRelevantDiffs.filter(d => d.type === DiffType.REMOVED).length,
      different: sideRelevantDiffs.filter(d => d.type === DiffType.DIFFERENT).length,
      total: sideRelevantDiffs.length
    }
  }, [diffs, side])

  // 渲染单行内容
  const renderLine = (lineInfo: LineInfo) => {
    const { lineNumber, content, diffs: lineDiffs } = lineInfo
    
    if (lineDiffs.length === 0) {
      return (
        <div key={lineNumber} className="flex">
          <div className="w-12 text-gray-500 text-right pr-4 select-none text-sm">
            {lineNumber}
          </div>
          <div className="flex-1 text-gray-300">{content}</div>
        </div>
      )
    }

    // 有差异的行，需要高亮显示
    const primaryDiff = lineDiffs[0] // 使用第一个差异的样式
    const colorClass = getDiffColorClass(primaryDiff.type)
    const icon = getDiffIcon(primaryDiff.type)
    
    return (
      <div key={lineNumber} className={`flex ${colorClass} rounded-r-md`}>
        <div className="w-12 text-right pr-4 select-none text-sm font-medium">
          {lineNumber}
        </div>
        <div className="flex-1 relative group">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{icon}</span>
            <span className="font-mono">{content}</span>
          </div>
          
          {/* 悬浮提示 */}
          <div className="absolute left-0 top-full mt-1 bg-black/90 text-white text-xs rounded px-2 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {lineDiffs.map((diff, index) => (
              <div key={index}>{diff.description}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* 标题栏 */}
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">{label}</h3>
          {stats.total > 0 && (
            <div className="flex items-center gap-2 text-sm">
              {stats.added > 0 && (
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  +{stats.added}
                </span>
              )}
              {stats.removed > 0 && (
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  -{stats.removed}
                </span>
              )}
              {stats.different > 0 && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  ~{stats.different}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* JSON内容 */}
      <div className="p-4 font-mono text-sm max-h-96 overflow-auto">
        {linesWithDiffs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {json.trim() ? '无法解析JSON' : '请输入JSON内容'}
          </div>
        ) : (
          <div className="space-y-1">
            {linesWithDiffs.map(renderLine)}
          </div>
        )}
      </div>
    </div>
  )
} 