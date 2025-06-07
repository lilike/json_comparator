/**
 * 差异类型枚举
 */
export enum DiffType {
  ADDED = 'added',           // 新增字段
  REMOVED = 'removed',       // 删除字段
  DIFFERENT = 'different',   // 不同（包括值不同和类型不同）
  UNCHANGED = 'unchanged'    // 无变化
}

/**
 * 差异项接口
 */
export interface DiffItem {
  path: string[]             // JSON路径
  type: DiffType            // 差异类型
  leftValue?: any           // 左侧值
  rightValue?: any          // 右侧值
  leftType?: string         // 左侧数据类型
  rightType?: string        // 右侧数据类型
  description: string       // 差异描述
}

/**
 * 差异检测结果接口
 */
export interface DiffResult {
  success: boolean
  diffs: DiffItem[]
  error?: string
  leftParsed?: any
  rightParsed?: any
}

/**
 * 获取值的类型字符串
 */
const getValueType = (value: any): string => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

/**
 * 格式化路径为可读字符串
 */
const formatPath = (path: string[]): string => {
  if (path.length === 0) return 'root'
  return path.map(p => isNaN(Number(p)) ? p : `[${p}]`).join('.')
}

/**
 * 格式化值为显示字符串
 */
const formatValue = (value: any): string => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (Array.isArray(value)) return `[${value.length} items]`
  if (typeof value === 'object') return `{${Object.keys(value).length} fields}`
  return String(value)
}

/**
 * 深度比较两个JSON对象
 * @param left 左侧JSON对象
 * @param right 右侧JSON对象
 * @param path 当前路径
 * @returns 差异项数组
 */
const compareObjects = (left: any, right: any, path: string[] = []): DiffItem[] => {
  const diffs: DiffItem[] = []

  // 处理null值
  if (left === null && right === null) {
    return diffs
  }
  
  if (left === null) {
    diffs.push({
      path,
      type: DiffType.ADDED,
      rightValue: right,
      rightType: getValueType(right),
      description: `新增字段: ${formatValue(right)}`
    })
    return diffs
  }
  
  if (right === null) {
    diffs.push({
      path,
      type: DiffType.REMOVED,
      leftValue: left,
      leftType: getValueType(left),
      description: `删除字段: ${formatValue(left)}`
    })
    return diffs
  }

  const leftType = getValueType(left)
  const rightType = getValueType(right)

  // 类型不同
  if (leftType !== rightType) {
    diffs.push({
      path,
      type: DiffType.DIFFERENT,
      leftValue: left,
      rightValue: right,
      leftType,
      rightType,
      description: `类型不同: ${leftType} → ${rightType}`
    })
    return diffs
  }

  // 处理数组
  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLength = Math.max(left.length, right.length)
    
    for (let i = 0; i < maxLength; i++) {
      if (i >= left.length) {
        diffs.push({
          path: [...path, String(i)],
          type: DiffType.ADDED,
          rightValue: right[i],
          rightType: getValueType(right[i]),
          description: `新增数组元素: ${formatValue(right[i])}`
        })
      } else if (i >= right.length) {
        diffs.push({
          path: [...path, String(i)],
          type: DiffType.REMOVED,
          leftValue: left[i],
          leftType: getValueType(left[i]),
          description: `删除数组元素: ${formatValue(left[i])}`
        })
      } else {
        diffs.push(...compareObjects(left[i], right[i], [...path, String(i)]))
      }
    }
    return diffs
  }

  // 处理对象
  if (typeof left === 'object' && typeof right === 'object') {
    const allKeys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)]))
    
    for (const key of allKeys) {
      const leftHasKey = key in left
      const rightHasKey = key in right
      
      if (!leftHasKey && rightHasKey) {
        diffs.push({
          path: [...path, key],
          type: DiffType.ADDED,
          rightValue: right[key],
          rightType: getValueType(right[key]),
          description: `新增字段: ${formatValue(right[key])}`
        })
      } else if (leftHasKey && !rightHasKey) {
        diffs.push({
          path: [...path, key],
          type: DiffType.REMOVED,
          leftValue: left[key],
          leftType: getValueType(left[key]),
          description: `删除字段: ${formatValue(left[key])}`
        })
      } else {
        diffs.push(...compareObjects(left[key], right[key], [...path, key]))
      }
    }
    return diffs
  }

  // 处理基本类型值
  if (left !== right) {
    diffs.push({
      path,
      type: DiffType.DIFFERENT,
      leftValue: left,
      rightValue: right,
      leftType,
      rightType,
      description: `值不同: ${formatValue(left)} → ${formatValue(right)}`
    })
  }

  return diffs
}

/**
 * 比较两个JSON字符串
 * @param leftJson 左侧JSON字符串
 * @param rightJson 右侧JSON字符串
 * @returns 差异检测结果
 */
export const compareJson = (leftJson: string, rightJson: string): DiffResult => {
  try {
    // 检查输入
    if (!leftJson.trim() && !rightJson.trim()) {
      return {
        success: false,
        diffs: [],
        error: '请输入要比较的JSON内容'
      }
    }
    
    if (!leftJson.trim()) {
      return {
        success: false,
        diffs: [],
        error: '左侧JSON不能为空'
      }
    }
    
    if (!rightJson.trim()) {
      return {
        success: false,
        diffs: [],
        error: '右侧JSON不能为空'
      }
    }

    // 解析JSON
    let leftParsed: any
    let rightParsed: any
    
    try {
      leftParsed = JSON.parse(leftJson)
    } catch (error) {
      return {
        success: false,
        diffs: [],
        error: '左侧JSON格式错误'
      }
    }
    
    try {
      rightParsed = JSON.parse(rightJson)
    } catch (error) {
      return {
        success: false,
        diffs: [],
        error: '右侧JSON格式错误'
      }
    }

    // 执行差异检测
    const diffs = compareObjects(leftParsed, rightParsed)
    
    return {
      success: true,
      diffs,
      leftParsed,
      rightParsed
    }
  } catch (error) {
    return {
      success: false,
      diffs: [],
      error: `比较过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

/**
 * 获取差异类型的颜色类名
 * @param diffType 差异类型
 * @returns Tailwind CSS类名
 */
export const getDiffColorClass = (diffType: DiffType): string => {
  switch (diffType) {
    case DiffType.ADDED:
      return 'bg-green-500/20 border-green-500 text-green-400'
    case DiffType.REMOVED:
      return 'bg-red-500/20 border-red-500 text-red-400'
    case DiffType.DIFFERENT:
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
    default:
      return 'bg-gray-500/20 border-gray-500 text-gray-400'
  }
}

/**
 * 获取差异类型的图标
 * @param diffType 差异类型
 * @returns 图标字符
 */
export const getDiffIcon = (diffType: DiffType): string => {
  switch (diffType) {
    case DiffType.ADDED:
      return '+'
    case DiffType.REMOVED:
      return '-'
    case DiffType.DIFFERENT:
      return '~'
    default:
      return '='
  }
}

/**
 * 统计差异数量
 * @param diffs 差异项数组
 * @returns 差异统计对象
 */
export const getDiffStats = (diffs: DiffItem[]) => {
  const stats = {
    added: 0,
    removed: 0,
    different: 0,
    total: diffs.length
  }
  
  diffs.forEach(diff => {
    switch (diff.type) {
      case DiffType.ADDED:
        stats.added++
        break
      case DiffType.REMOVED:
        stats.removed++
        break
      case DiffType.DIFFERENT:
        stats.different++
        break
    }
  })
  
  return stats
} 