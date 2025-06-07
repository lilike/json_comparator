import { useState } from 'react'
import { ChevronDown, ChevronRight, Eye, Info } from 'lucide-react'
import { DiffItem, DiffType, getDiffColorClass, getDiffIcon, getDiffStats } from '@/utils/jsonDiffer'

interface DiffViewProps {
  diffs: DiffItem[]
  leftJson?: any
  rightJson?: any
}

export default function DiffView({ diffs, leftJson, rightJson }: DiffViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showOnlyDiffs, setShowOnlyDiffs] = useState<boolean>(true)
  
  const stats = getDiffStats(diffs)
  
  // 切换展开状态
  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedItems(newExpanded)
  }

  // 格式化路径显示
  const formatPath = (path: string[]): string => {
    if (path.length === 0) return 'root'
    return path.map(p => isNaN(Number(p)) ? p : `[${p}]`).join('.')
  }

  // 渲染差异项
  const renderDiffItem = (diff: DiffItem, index: number) => {
    const pathKey = diff.path.join('.')
    const isExpanded = expandedItems.has(pathKey)
    const colorClass = getDiffColorClass(diff.type)
    const icon = getDiffIcon(diff.type)

    return (
      <div
        key={index}
        className={`border rounded-lg p-4 transition-all hover:shadow-md ${colorClass}`}
      >
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleExpand(pathKey)}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="font-mono text-sm font-medium">
              {icon} {formatPath(diff.path)}
            </span>
            <span className="text-xs px-2 py-1 rounded-full border">
              {diff.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="text-xs opacity-75">
            {diff.description}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pl-6 space-y-3 border-l-2 border-current/30">
            {/* 路径信息 */}
            <div className="text-sm">
              <span className="font-medium">路径: </span>
              <code className="bg-black/20 px-2 py-1 rounded text-xs">
                {formatPath(diff.path)}
              </code>
            </div>

            {/* 值信息 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {diff.leftValue !== undefined && (
                <div>
                  <div className="text-xs font-medium mb-1 text-red-400">左侧 (A)</div>
                  <div className="bg-black/20 p-2 rounded text-xs font-mono">
                    <div className="text-gray-400">类型: {diff.leftType}</div>
                    <div className="mt-1 break-all">
                      {JSON.stringify(diff.leftValue, null, 2)}
                    </div>
                  </div>
                </div>
              )}

              {diff.rightValue !== undefined && (
                <div>
                  <div className="text-xs font-medium mb-1 text-green-400">右侧 (B)</div>
                  <div className="bg-black/20 p-2 rounded text-xs font-mono">
                    <div className="text-gray-400">类型: {diff.rightType}</div>
                    <div className="mt-1 break-all">
                      {JSON.stringify(diff.rightValue, null, 2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (diffs.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-green-400 text-lg font-medium mb-2">
          🎉 完全一致！
        </div>
        <div className="text-gray-400">
          两个JSON结构和内容完全相同
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* 差异统计 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">差异检测结果</h3>
          <button
            onClick={() => setShowOnlyDiffs(!showOnlyDiffs)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
          >
            <Eye size={14} />
            {showOnlyDiffs ? '显示全部' : '仅显示差异'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-center">
            <div className="text-green-400 text-2xl font-bold">{stats.added}</div>
            <div className="text-green-400 text-sm">新增</div>
          </div>
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-center">
            <div className="text-red-400 text-2xl font-bold">{stats.removed}</div>
            <div className="text-red-400 text-sm">删除</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 text-center">
            <div className="text-yellow-400 text-2xl font-bold">{stats.different}</div>
            <div className="text-yellow-400 text-sm">不同</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Info size={14} />
          <span>共发现 {stats.total} 处差异，点击展开查看详情</span>
        </div>
      </div>

      {/* 差异列表 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {diffs.map((diff, index) => renderDiffItem(diff, index))}
      </div>

      {/* 操作提示 */}
      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-400">
        💡 提示：点击差异项可查看详细对比信息。不同颜色代表不同类型的差异。
      </div>
    </div>
  )
} 