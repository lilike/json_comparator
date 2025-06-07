import { useMemo } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { isValidJson } from '@/utils/jsonFormatter'

interface JsonInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  isFormatting?: boolean
}

export default function JsonInput({ 
  value, 
  onChange, 
  placeholder, 
  error,
  isFormatting = false 
}: JsonInputProps) {
  // 验证JSON是否有效
  const isValid = useMemo(() => {
    if (!value.trim()) return null
    return isValidJson(value)
  }, [value])

  // 计算行数和字符数
  const stats = useMemo(() => {
    const lines = value.split('\n').length
    const chars = value.length
    return { lines, chars }
  }, [value])

  return (
    <div className="relative h-full flex flex-col">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isFormatting}
        className={`w-full flex-1 p-4 bg-gray-800 border rounded-lg text-white font-mono text-sm resize-none outline-none transition-all ${
          isFormatting 
            ? 'opacity-50 cursor-not-allowed border-gray-600' 
            : error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              : isValid === false
                ? 'border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent'
                : isValid === true
                  ? 'border-green-500 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  : 'border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        }`}
        spellCheck={false}
      />
      
      {/* 状态指示器 */}
      {value.trim() && !isFormatting && (
        <div className="absolute top-3 right-3">
          {error ? (
            <AlertCircle size={16} className="text-red-400" />
          ) : isValid === false ? (
            <AlertCircle size={16} className="text-yellow-400" />
          ) : isValid === true ? (
            <CheckCircle size={16} className="text-green-400" />
          ) : null}
        </div>
      )}

      {/* 格式化加载指示器 */}
      {isFormatting && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 text-blue-400">
            <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <span className="text-sm">格式化中...</span>
          </div>
        </div>
      )}
      
      {/* 统计信息 */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
        {stats.lines} 行 · {stats.chars} 字符
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-2 p-2 bg-red-900/20 border border-red-500 rounded text-red-400 text-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* JSON语法错误提示 */}
      {!error && value.trim() && isValid === false && (
        <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500 rounded text-yellow-400 text-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>JSON格式不正确，请检查语法</span>
          </div>
        </div>
      )}

      {/* 成功提示 */}
      {!error && value.trim() && isValid === true && (
        <div className="mt-2 p-2 bg-green-900/20 border border-green-500 rounded text-green-400 text-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} />
            <span>JSON格式正确</span>
          </div>
        </div>
      )}
    </div>
  )
} 