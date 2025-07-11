import { useMemo } from 'react'
import { DiffItem, DiffType, getDiffColorClass, getDiffIcon } from '@/utils/jsonDiffAdapter'

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

// 专门处理数组比较的方法
function matchArrayDiffsToLines(
  jsonString: string,
  diffs: DiffItem[],
  side: 'left' | 'right'
): Map<number, DiffItem[]> {
  const lineMatches = new Map<number, DiffItem[]>()
  
  if (!jsonString.trim()) return lineMatches
  
  const lines = jsonString.split('\n')
  
  // 首先尝试解析JSON来获取实际的数组结构
  let parsedArray: any[] = []
  try {
    parsedArray = JSON.parse(jsonString)
    if (!Array.isArray(parsedArray)) {
      parsedArray = []
    }
  } catch (e) {
    // 如果解析失败，fallback到基于行的匹配
    console.warn('Unable to parse JSON array, using line-based matching')
  }
  
  diffs.forEach(diff => {
    const path = diff.path
    if (!path) return
    
    // 根据差异类型和侧边决定是否应该显示
    const shouldShow = (() => {
      switch (diff.type) {
        case DiffType.ADDED:
          return side === 'right'
        case DiffType.REMOVED:
          return side === 'left'
        case DiffType.CHANGED:
          return true
        default:
          return false
      }
    })()
    
    if (!shouldShow) return
    
    // 解析数组索引路径，如 "root[0]" 或 "[0]"
    const parseArrayIndex = (path: string): number => {
      const match = path.match(/\[(\d+)\]/)
      return match ? parseInt(match[1]) : -1
    }
    
    const arrayIndex = parseArrayIndex(path)
    if (arrayIndex === -1) return
    
    // 获取目标值进行精确匹配
    const targetValue = (() => {
      if (diff.type === DiffType.ADDED) return diff.rightValue
      if (diff.type === DiffType.REMOVED) return diff.leftValue
      if (diff.type === DiffType.CHANGED) {
        return side === 'left' ? diff.leftValue : diff.rightValue
      }
      return undefined
    })()
    
    if (targetValue === undefined) return
    
    // 对于多行对象，找到对象的开始行（包含第一个字段的行）
    const targetStr = JSON.stringify(targetValue)
    let bestMatchLine = -1
    let bestScore = 0
    
    // 如果目标值是对象，我们需要找到包含该对象第一个字段的行
    if (typeof targetValue === 'object' && targetValue !== null) {
      const firstKey = Object.keys(targetValue)[0]
      const firstValue = targetValue[firstKey]
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        const lineNumber = i + 1
        
        // 跳过结构性字符行
        if (!line || line === '[' || line === ']' || line === ',') {
          continue
        }
        
        let score = 0
        
        // 检查是否包含第一个字段
        if (line.includes(`"${firstKey}"`)) {
          score += 50
          
          // 如果还包含对应的值，增加得分
          const valueStr = JSON.stringify(firstValue)
          if (line.includes(valueStr)) {
            score += 50
          }
        }
        
        if (score > bestScore) {
          bestScore = score
          bestMatchLine = lineNumber
        }
      }
    } else {
      // 对于基本值，直接查找包含该值的行
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        const lineNumber = i + 1
        
        if (!line || line === '[' || line === ']' || line === ',' || line === '{' || line === '}') {
          continue
        }
        
        if (line.includes(targetStr)) {
          bestScore = 100
          bestMatchLine = lineNumber
          break
        }
      }
    }
    
    // 如果找到匹配，记录它
    if (bestMatchLine > 0 && bestScore > 0) {
      if (!lineMatches.has(bestMatchLine)) {
        lineMatches.set(bestMatchLine, [])
      }
      lineMatches.get(bestMatchLine)!.push(diff)
    }
  })
  
  return lineMatches
}

// 检查是否为数组比较
function isArrayComparison(diffs: DiffItem[]): boolean {
  if (diffs.length === 0) return false
  
  // 检查是否大部分差异都是数组索引路径
  const arrayPathCount = diffs.filter(diff => {
    const path = diff.path
    return path && (path.match(/\[\d+\]/) !== null)
  }).length
  
  // 如果超过一半的差异是数组索引路径，认为是数组比较
  return arrayPathCount > diffs.length * 0.5
}

// 行匹配算法，基于关键词和值匹配
// 支持处理顶层数组索引格式如 "[0]" 以及嵌套对象路径 
function matchDiffsToLines(
  jsonString: string,
  diffs: DiffItem[],
  side: 'left' | 'right'
): Map<number, DiffItem[]> {
  const lineMatches = new Map<number, DiffItem[]>()
  
  if (!jsonString.trim()) return lineMatches
  
  const lines = jsonString.split('\n')
  
  // 为每个差异找到最佳匹配行，确保一对一匹配
  const usedLines = new Set<number>()
  
  diffs.forEach(diff => {
    const path = diff.path
    if (!path) return
    
    // 解析路径，区分普通字段和数组索引
    const parsePathInfo = (path: string) => {
      // 处理顶层数组的特殊情况，如 "root[0]"
      if (path.startsWith('root[') && path.endsWith(']')) {
        const indexMatch = path.match(/^root\[(\d+)\]$/)
        if (indexMatch) {
          return {
            isArrayIndex: true,
            fieldName: 'root',
            index: parseInt(indexMatch[1]),
            fullPath: path
          }
        }
      }
      
      const parts = path.split('.')
      const lastPart = parts[parts.length - 1]
      
      // 检查是否是数组索引格式，如 "fieldName[0]"
      const arrayIndexMatch = lastPart.match(/^(.+)\[(\d+)\]$/)
      if (arrayIndexMatch) {
        return {
          isArrayIndex: true,
          fieldName: arrayIndexMatch[1],
          index: parseInt(arrayIndexMatch[2]),
          fullPath: path
        }
      }
      
      return {
        isArrayIndex: false,
        fieldName: lastPart,
        index: -1,
        fullPath: path
      }
    }
    
    const pathInfo = parsePathInfo(path)
    
    // 根据差异类型和侧边决定是否应该显示
    const shouldShow = (() => {
      switch (diff.type) {
        case DiffType.ADDED:
          // 新增项只在右侧显示
          return side === 'right'
        case DiffType.REMOVED:
          // 删除项只在左侧显示
          return side === 'left'
        case DiffType.CHANGED:
          // 变更项在两侧都显示
          return true
        default:
          return false
      }
    })()
    
    if (!shouldShow) return
    
    let bestMatchLine = -1
    let bestMatchScore = 0
    
    // 查找最佳匹配行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1
      
      // 跳过已被其他差异使用的行（除非是CHANGED类型，可以在两侧共享）
      if (usedLines.has(lineNumber) && diff.type !== DiffType.CHANGED) {
        continue
      }
      
      let matchScore = 0
      
      // 1. 键名匹配 - 最高优先级
      if (pathInfo.isArrayIndex) {
        // 特殊处理顶层数组
        if (pathInfo.fieldName === 'root') {
          // 对于顶层数组，直接根据数组索引进行匹配
          // 由于这是顶层数组，我们需要找到对应的数组元素
          const targetValue = (() => {
            if (diff.type === DiffType.ADDED) return diff.rightValue
            if (diff.type === DiffType.REMOVED) return diff.leftValue
            if (diff.type === DiffType.CHANGED) {
              return side === 'left' ? diff.leftValue : diff.rightValue
            }
            return undefined
          })()
          
          if (targetValue !== undefined) {
            const valueStr = JSON.stringify(targetValue)
            if (line.includes(valueStr)) {
              matchScore += 100 // 直接值匹配得分最高
            }
          }
        } else {
          // 对于普通数组索引，匹配数组字段名
          const arrayFieldPattern = `"${pathInfo.fieldName}"\\s*:\\s*\\[`
          if (new RegExp(arrayFieldPattern).test(line)) {
            matchScore += 100 // 数组字段匹配得分最高
          }
        }
      } else {
        // 对于普通字段，匹配键名
        const keyPattern = `"${pathInfo.fieldName}"`
        if (line.includes(keyPattern + ':')) {
          matchScore += 100 // 键匹配得分最高
        }
      }
      
      // 2. 路径匹配 - 检查更完整的路径
      if (matchScore === 0) {
        const pathParts = path.split('.')
        const pathScore = pathParts.reduce((score, part, index) => {
          // 对于数组索引部分，只匹配字段名部分
          const cleanPart = part.replace(/\[\d+\]$/, '')
          if (line.includes(`"${cleanPart}"`)) {
            return score + (10 * (pathParts.length - index)) // 越靠后的路径部分权重越高
          }
          return score
        }, 0)
        matchScore += pathScore
      }
      
      // 3. 值匹配 - 较低优先级，只在没有键匹配时使用
      if (matchScore === 0 && !pathInfo.isArrayIndex) {
        const targetValue = (() => {
          if (diff.type === DiffType.ADDED) return diff.rightValue
          if (diff.type === DiffType.REMOVED) return diff.leftValue
          if (diff.type === DiffType.CHANGED) {
            return side === 'left' ? diff.leftValue : diff.rightValue
          }
          return undefined
        })()
        
        if (targetValue !== undefined) {
          const valueStr = typeof targetValue === 'string' 
            ? `"${targetValue}"` 
            : JSON.stringify(targetValue)
          
          if (line.includes(valueStr)) {
            matchScore += 1 // 值匹配得分最低
          }
        }
      }
      
      // 更新最佳匹配
      if (matchScore > bestMatchScore) {
        bestMatchScore = matchScore
        bestMatchLine = lineNumber
      }
    }
    
    // 如果找到了合适的匹配，记录它
    if (bestMatchLine > 0 && bestMatchScore > 0) {
      if (!lineMatches.has(bestMatchLine)) {
        lineMatches.set(bestMatchLine, [])
      }
      lineMatches.get(bestMatchLine)!.push(diff)
      
      // 标记该行已被使用（CHANGED类型除外，因为它需要在两侧都显示）
      if (diff.type !== DiffType.CHANGED) {
        usedLines.add(bestMatchLine)
      }
    }
  })
  
  return lineMatches
}

export default function JsonDiffViewer({ json, diffs, side, label }: JsonDiffViewerProps) {
  

  // 解析JSON并生成带行号的结构  
  const linesWithDiffs = useMemo(() => {
    if (!json.trim()) return []
    
    const lines = json.split('\n')
    const result: LineInfo[] = []
    
    // 根据差异类型选择匹配算法
    const isArrayDiff = isArrayComparison(diffs)
    const lineMatchMap = isArrayDiff 
      ? matchArrayDiffsToLines(json, diffs, side)
      : matchDiffsToLines(json, diffs, side)
    
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
  }, [json, diffs, side, label])

  // 获取差异统计用于显示标题
  const stats = useMemo(() => {
    const sideRelevantDiffs = diffs.filter(diff => {
      if (side === 'left') {
        return diff.type === DiffType.REMOVED || diff.type === DiffType.CHANGED
      } else {
        return diff.type === DiffType.ADDED || diff.type === DiffType.CHANGED
      }
    })
    
    return {
      added: sideRelevantDiffs.filter(d => d.type === DiffType.ADDED).length,
      removed: sideRelevantDiffs.filter(d => d.type === DiffType.REMOVED).length,
      changed: sideRelevantDiffs.filter(d => d.type === DiffType.CHANGED).length,
      unchanged: 0, // 不再显示相同项
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
          <div className="flex-1 text-gray-300 font-mono whitespace-pre">{content}</div>
        </div>
      )
    }

    // 有差异的行，需要高亮显示
    // 优先选择与当前侧边最相关的差异项
    const relevantDiff = lineDiffs.find(diff => {
      if (side === 'left') {
        return diff.type === DiffType.REMOVED || diff.type === DiffType.CHANGED
      } else {
        return diff.type === DiffType.ADDED || diff.type === DiffType.CHANGED
      }
    }) || lineDiffs[0]
    
    const colorClass = getDiffColorClass(relevantDiff.type)
    const icon = getDiffIcon(relevantDiff.type)
    
    // 根据差异类型决定显示内容
    let displayContent = content
    
    // 解析路径，区分普通字段和数组索引
    const parseFieldFromPath = (path: string) => {
      // 处理顶层数组的特殊情况，如 "root[0]"
      if (path.startsWith('[') && path.endsWith(']')) {
        const indexMatch = path.match(/^\[(\d+)\]$/)
        if (indexMatch) {
          return {
            isArrayIndex: true,
            fieldName: 'root',
            index: parseInt(indexMatch[1])
          }
        }
      }
      
      const parts = path.split('.')
      const lastPart = parts[parts.length - 1]
      
      // 检查是否是数组索引格式，如 "fieldName[0]"
      const arrayIndexMatch = lastPart.match(/^(.+)\[(\d+)\]$/)
      if (arrayIndexMatch) {
        return {
          isArrayIndex: true,
          fieldName: arrayIndexMatch[1],
          index: parseInt(arrayIndexMatch[2])
        }
      }
      
      return {
        isArrayIndex: false,
        fieldName: lastPart,
        index: -1
      }
    }
    
    if (relevantDiff.type === DiffType.CHANGED) {
      const targetValue = side === 'left' ? relevantDiff.leftValue : relevantDiff.rightValue
      if (targetValue !== undefined) {
        const fieldInfo = parseFieldFromPath(relevantDiff.path)
        
        if (fieldInfo.isArrayIndex) {
          // 特殊处理顶层数组
          if (fieldInfo.fieldName === 'root') {
            // 对于顶层数组，直接显示值
            displayContent = `${JSON.stringify(targetValue)}`
          } else {
            // 对于普通数组元素，尝试在原内容中找到并替换对应位置的值
            const fieldPattern = `"${fieldInfo.fieldName}"\\s*:\\s*\\[`
            const fieldRegex = new RegExp(fieldPattern)
            
            if (fieldRegex.test(content)) {
              // 保持原有的显示方式，不做替换
              displayContent = content
            } else {
              // 如果找不到匹配的数组字段，显示简单格式
              displayContent = `    "${fieldInfo.fieldName}[${fieldInfo.index}]": ${JSON.stringify(targetValue)}`
            }
          }
        } else {
          // 普通对象属性
          const keyPattern = `"${fieldInfo.fieldName}"`
          if (content.includes(keyPattern + ':')) {
            const valueStr = JSON.stringify(targetValue)
            const regex = new RegExp(`(${keyPattern}\\s*:\\s*)([^,}\\]]+)`)
            displayContent = content.replace(regex, `$1${valueStr}`)
          } else {
            displayContent = `    "${fieldInfo.fieldName}": ${JSON.stringify(targetValue)}`
          }
        }
      }
    } else if (relevantDiff.type === DiffType.ADDED && side === 'right') {
      // 对于新增项，保持原有显示
      displayContent = content
    } else if (relevantDiff.type === DiffType.REMOVED && side === 'left') {
      // 对于删除项，保持原有显示
      displayContent = content
    }
    
    return (
      <div key={lineNumber} className={`flex ${colorClass} rounded-r-md`}>
        <div className="w-12 text-right pr-4 select-none text-sm font-medium">
          {lineNumber}
        </div>
        <div className="flex-1 relative group">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{icon}</span>
            <span className="font-mono whitespace-pre">{displayContent}</span>
          </div>
          
          {/* 悬浮提示 - 增强CHANGED类型的提示信息 */}
          <div className="absolute left-0 -translate-x-[-300px] top-full mt-1 bg-black/90 text-white text-xs rounded px-2 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap max-w-md">
            {lineDiffs.map((diff, index) => (
              <div key={index} className="mb-1">
                <div className="font-medium">{diff.path}</div>
                <div>{diff.description}</div>
                {diff.type === DiffType.CHANGED && (
                  <div className="text-gray-300 mt-1">
                    <div>左侧: {JSON.stringify(diff.leftValue)}</div>
                    <div>右侧: {JSON.stringify(diff.rightValue)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col">
      {/* 标题栏 */}
      <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">{label}</h3>
          {stats.total > 0 && (
            <div className="flex items-center gap-2 text-xs">
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
              {stats.changed > 0 && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  ~{stats.changed}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* JSON内容 */}
      <div className="p-4 font-mono text-sm flex-1 overflow-auto">
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