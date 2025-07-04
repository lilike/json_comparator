import { ArrowLeftRight, SortAsc, Settings, Zap, Info, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations()
  
  return (
    <div className="bg-gray-800 rounded-lg p-2 shadow-lg">
      <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full lg:w-auto">
          {/* 排序选项 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <SortAsc size={14} className="text-gray-300" />
              <span className="text-white text-xs font-medium">{t('sorting.label')}：</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onSortChange('none')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  sortOption === 'none'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('sorting.original')}
              </button>
              <button
                onClick={() => onSortChange('alphabetical')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  sortOption === 'alphabetical'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('sorting.alphabetical')}
              </button>
              <button
                onClick={() => onSortChange('type')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  sortOption === 'type'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t('sorting.byType')}
              </button>
            </div>
          </div>

          {/* 快捷操作按钮 */}
          <div className="flex gap-1">
            {onFormatBoth && (
              <button
                onClick={onFormatBoth}
                disabled={!hasContent}
                className="flex items-center gap-1 px-2 py-0.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors"
              >
                <Zap size={12} />
                {t('buttons.formatAll')}
              </button>
            )}

            {/* 加载示例数据按钮 */}
            {onLoadExample && (
              <button
                onClick={onLoadExample}
                className="flex items-center gap-1 px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
              >
                <FileText size={12} />
                {t('buttons.loadExample')}
              </button>
            )}
          </div>
        </div>

        {/* 排序说明 - 放在按钮中间 */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Info size={10} />
          <span>{getSortDescription(sortOption, t)}</span>
        </div>

        {/* 比较按钮 */}
        <button
          onClick={onCompare}
          disabled={isComparing || !hasContent}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors shadow-sm"
        >
          {isComparing ? (
            <>
              <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
              {t('status.comparing')}
            </>
          ) : (
            <>
              <ArrowLeftRight size={14} />
              {t('buttons.compare')}
            </>
          )}
        </button>
      </div>
    </div>
  )
} 