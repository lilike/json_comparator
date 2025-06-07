import { useState } from 'react'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'
import { DiffItem, DiffType, getDiffColorClass, getDiffIcon, getDiffStats } from '@/utils/jsonDiffAdapter'

interface DiffViewProps {
  diffs: DiffItem[]
  leftJson?: any
  rightJson?: any
}

export default function DiffView({ diffs, leftJson, rightJson }: DiffViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const stats = getDiffStats(diffs)

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedItems(newExpanded)
  }

  const formatPath = (path: string): string => {
    if (!path) return 'root'
    return path.replace(/\./g, ' → ')
  }

  // 现在不再有UNCHANGED类型，所以直接使用所有差异
  const filteredDiffs = diffs

  const renderDiffItem = (diff: DiffItem, index: number) => {
    const pathKey = diff.path || 'root'
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
                    <div className="text-gray-400">类型: {typeof diff.leftValue}</div>
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
                    <div className="text-gray-400">类型: {typeof diff.rightValue}</div>
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
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* 统计信息和控制面板 */}
      <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-white font-medium">差异摘要</div>
            <div className="flex items-center gap-2 text-xs">
              {stats.added > 0 && (
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  +{stats.added} 新增
                </span>
              )}
              {stats.removed > 0 && (
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  -{stats.removed} 删除
                </span>
              )}
              {stats.changed > 0 && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  ~{stats.changed} 修改
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 差异列表 */}
      <div className="p-4 space-y-3 max-h-96 overflow-auto">
        {filteredDiffs.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Info size={48} className="mx-auto mb-2 opacity-50" />
            <div>没有要显示的差异项</div>
            <div className="text-xs mt-1">
              只显示有差异的字段
            </div>
          </div>
        ) : (
          filteredDiffs.map(renderDiffItem)
        )}
      </div>
    </div>
  )
} 