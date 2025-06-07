import { ArrowLeftRight, SortAsc, Settings, Zap, Info, FileText } from 'lucide-react'
import { getSortDescription, SortOption } from '@/utils/jsonSorter'

interface ControlPanelProps {
  sortOption: SortOption
  onSortChange: (option: SortOption) => void
  onCompare: () => void
  onFormatBoth?: () => void
  onLoadExample?: () => void
  hasContent?: boolean
  isComparing?: boolean
}

export default function ControlPanel({ 
  sortOption, 
  onSortChange, 
  onCompare, 
  onFormatBoth,
  onLoadExample,
  hasContent = false,
  isComparing = false 
}: ControlPanelProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
          {/* 排序选项 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <SortAsc size={20} className="text-gray-300" />
                <span className="text-white font-medium">排序方式：</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSortChange('none')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    sortOption === 'none'
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  原始顺序
                </button>
                <button
                  onClick={() => onSortChange('alphabetical')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    sortOption === 'alphabetical'
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  字母排序
                </button>
                <button
                  onClick={() => onSortChange('type')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    sortOption === 'type'
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  类型排序
                </button>
              </div>
            </div>
            
            {/* 排序说明 */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Info size={14} />
              <span>{getSortDescription(sortOption)}</span>
            </div>
          </div>

          {/* 快捷操作按钮 */}
          <div className="flex gap-3">
            {onFormatBoth && (
              <button
                onClick={onFormatBoth}
                disabled={!hasContent}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
              >
                <Zap size={16} />
                一键格式化
              </button>
            )}

            {/* 加载示例数据按钮 */}
            {onLoadExample && (
              <button
                onClick={onLoadExample}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
              >
                <FileText size={16} />
                加载示例数据
              </button>
            )}
          </div>
        </div>

        {/* 比较按钮 */}
        <button
          onClick={onCompare}
          disabled={isComparing || !hasContent}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-lg"
        >
          {isComparing ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              正在比较...
            </>
          ) : (
            <>
              <ArrowLeftRight size={20} />
              开始比较
            </>
          )}
        </button>
      </div>
    </div>
  )
} 