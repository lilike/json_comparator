/**
 * JSON Diff Adapter - 使用json-diff第三方库
 * 替代原来的自研JSON比对算法
 */

import * as jsonDiff from 'json-diff'

/**
 * 差异类型枚举
 */
export enum DiffType {
  ADDED = 'added',
  REMOVED = 'removed', 
  CHANGED = 'changed'
}

/**
 * 差异项接口
 */
export interface DiffItem {
  path: string
  type: DiffType
  leftValue?: any
  rightValue?: any
  description: string
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
  leftFormatted?: string // 保留格式化后的左侧JSON字符串
  rightFormatted?: string // 保留格式化后的右侧JSON字符串
  rawDiff?: any // json-diff的原始结果
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
 * 根据路径获取对象中的值
 */
const getValueByPath = (obj: any, path: string): any => {
  if (!path) return obj
  
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }
  
  return current
}

/**
 * 改进的json-diff结果解析器
 * 严格按照json-diff库的输出格式进行解析：
 * - {__old: oldValue, __new: newValue}: 表示值发生变化
 * - key__added: value: 表示新增字段
 * - key__deleted: value: 表示删除字段
 * - 数组: 特殊格式 [' ', '-', '+'] 等
 */
const parseDiffResult = (
  diffResult: any,
  leftParsed: any,
  rightParsed: any,
  path: string = ''
): DiffItem[] => {
  const diffs: DiffItem[] = []
  
  console.log('parseDiffResult called with:', {
    diffResult,
    path,
    diffResultKeys: diffResult ? Object.keys(diffResult) : null,
    isArray: Array.isArray(diffResult)
  })
  
  if (!diffResult) {
    console.log('Early return: diffResult is null')
    return diffs
  }
  
  // 特殊处理：如果顶层 diffResult 就是数组，说明比较的是数组类型
  if (Array.isArray(diffResult)) {
    console.log('Top-level array diff detected, calling parseArrayDiff')
    parseArrayDiff(diffResult, path || 'root', diffs)
    return diffs
  }
  
  if (typeof diffResult !== 'object') {
    console.log('Early return: diffResult is not object')
    return diffs
  }
  
  const processDiff = (obj: any, currentPath: string) => {
    console.log(`processDiff called with path: "${currentPath}"`, obj)
    
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      console.log(`Skipping processing for path "${currentPath}" - not a valid object`)
      return
    }
    
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      console.log(`Processing key: "${key}" with value:`, value, `at path: "${currentPath}"`)
      
      if (key.endsWith('__added')) {
        // 新增字段
        const fieldName = key.substring(0, key.length - '__added'.length)
        const fullPath = currentPath ? `${currentPath}.${fieldName}` : fieldName
        console.log(`Found ADDED field: "${fieldName}" at path: "${fullPath}"`)
        diffs.push({
          path: fullPath,
          type: DiffType.ADDED,
          rightValue: value,
          description: `新增字段: ${formatValue(value)}`
        })
      } else if (key.endsWith('__deleted')) {
        // 删除字段
        const fieldName = key.substring(0, key.length - '__deleted'.length)
        const fullPath = currentPath ? `${currentPath}.${fieldName}` : fieldName
        console.log(`Found DELETED field: "${fieldName}" at path: "${fullPath}"`)
        diffs.push({
          path: fullPath,
          type: DiffType.REMOVED,
          leftValue: value,
          description: `删除字段: ${formatValue(value)}`
        })
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
                 '__old' in value && '__new' in value && Object.keys(value).length === 2) {
        // 值变更 - 严格检查只有__old和__new两个键
        const fullPath = currentPath ? `${currentPath}.${key}` : key
        console.log(`Found CHANGED field: "${key}" at path: "${fullPath}"`)
        diffs.push({
          path: fullPath,
          type: DiffType.CHANGED,
          leftValue: value.__old,
          rightValue: value.__new,
          description: `值变更: ${formatValue(value.__old)} → ${formatValue(value.__new)}`
        })
      } else if (Array.isArray(value)) {
        // 数组差异
        const fullPath = currentPath ? `${currentPath}.${key}` : key
        console.log(`Found ARRAY diff for field: "${key}" at path: "${fullPath}"`)
        parseArrayDiff(value, fullPath, diffs)
      } else if (typeof value === 'object' && value !== null) {
        // 嵌套对象 - 继续递归处理
        const fullPath = currentPath ? `${currentPath}.${key}` : key
        console.log(`Found nested object for field: "${key}" at path: "${fullPath}" - recursing`)
        processDiff(value, fullPath)
      } else {
        console.log(`Ignoring unchanged field: "${key}" at path: "${currentPath}"`)
      }
      // 其他情况（如普通值）直接忽略，因为它们表示未改变的部分
    })
  }
  
  processDiff(diffResult, path)
  console.log('Final parsed diffs:', diffs)
  return diffs
}

/**
 * 解析数组差异
 * json-diff的数组格式：[' ', '-', '+'] 等
 * 改进：检测连续的删除+新增操作，合并为CHANGED类型
 */
const parseArrayDiff = (arrayDiff: any[], path: string, diffs: DiffItem[]) => {
  console.log(`parseArrayDiff called for path: ${path}`, arrayDiff)
  
  // 先收集所有的操作
  const operations: Array<{operation: string, value: any, index: number}> = []
  
  arrayDiff.forEach((item, index) => {
    console.log(`Processing array item ${index}:`, item)
    
    if (Array.isArray(item) && item.length >= 2) {
      const [operation, value] = item
      operations.push({ operation, value, index })
      console.log(`Collected operation: ${operation}, value:`, value, `at index: ${index}`)
    } else {
      console.log(`Skipping non-array or short item at index ${index}:`, item)
    }
  })
  
  // 检测连续的删除+新增操作模式，将其合并为CHANGED
  const processedIndices = new Set<number>()
  
  for (let i = 0; i < operations.length; i++) {
    if (processedIndices.has(i)) continue
    
    const currentOp = operations[i]
    
    // 查找是否有配对的操作（删除+新增 或 新增+删除）
    let pairedOpIndex = -1
    for (let j = i + 1; j < operations.length; j++) {
      if (processedIndices.has(j)) continue
      
      const nextOp = operations[j]
      // 检查是否是配对的删除+新增操作
      if ((currentOp.operation === '-' && nextOp.operation === '+') ||
          (currentOp.operation === '+' && nextOp.operation === '-')) {
        pairedOpIndex = j
        break
      }
    }
    
    if (pairedOpIndex !== -1) {
      // 找到配对操作，创建CHANGED类型的差异
      const pairedOp = operations[pairedOpIndex]
      const leftValue = currentOp.operation === '-' ? currentOp.value : pairedOp.value
      const rightValue = currentOp.operation === '+' ? currentOp.value : pairedOp.value
      
      // 使用较小的索引作为路径
      const useIndex = Math.min(currentOp.index, pairedOp.index)
      const itemPath = `${path}[${useIndex}]`
      
      diffs.push({
        path: itemPath,
        type: DiffType.CHANGED,
        leftValue: leftValue,
        rightValue: rightValue,
        description: `数组元素变更: ${formatValue(leftValue)} → ${formatValue(rightValue)}`
      })
      
      console.log(`Added CHANGED diff for paired operations at path: ${itemPath}`)
      console.log(`  Left value:`, leftValue)
      console.log(`  Right value:`, rightValue)
      
      // 标记两个操作都已处理
      processedIndices.add(i)
      processedIndices.add(pairedOpIndex)
    }
  }
  
  // 处理未配对的操作（纯新增或纯删除）
  for (let i = 0; i < operations.length; i++) {
    if (processedIndices.has(i)) continue
    
    const operation = operations[i]
    const itemPath = `${path}[${operation.index}]`
    
    if (operation.operation === '+') {
      diffs.push({
        path: itemPath,
        type: DiffType.ADDED,
        rightValue: operation.value,
        description: `新增数组元素: ${formatValue(operation.value)}`
      })
      console.log(`Added ADDED diff for unpaired operation at path: ${itemPath}`)
    } else if (operation.operation === '-') {
      diffs.push({
        path: itemPath,
        type: DiffType.REMOVED,
        leftValue: operation.value,
        description: `删除数组元素: ${formatValue(operation.value)}`
      })
      console.log(`Added REMOVED diff for unpaired operation at path: ${itemPath}`)
    } else if (operation.operation === '~') {
      // 直接的修改操作
      diffs.push({
        path: itemPath,
        type: DiffType.CHANGED,
        leftValue: arrayDiff[operation.index][1],
        rightValue: arrayDiff[operation.index][2],
        description: `数组元素变更: ${formatValue(arrayDiff[operation.index][1])} → ${formatValue(arrayDiff[operation.index][2])}`
      })
      console.log(`Added CHANGED diff for ~ operation at path: ${itemPath}`)
    } else {
      console.log(`Unknown operation: ${operation.operation} for path: ${itemPath}`)
    }
  }
}

/**
 * 比较两个JSON字符串
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

    // 使用json-diff进行比较
    const rawDiff = jsonDiff.diff(leftParsed, rightParsed)
    console.log('rawDiff', rawDiff)
    
    // 特殊调试：检查bdCds相关的差异
    if (rawDiff && typeof rawDiff === 'object') {
      const bdCdsKeys = Object.keys(rawDiff).filter(key => key.includes('bdCds') || key.includes('Cds'))
      if (bdCdsKeys.length > 0) {
        console.log('发现bdCds相关的差异:', bdCdsKeys)
        bdCdsKeys.forEach(key => {
          console.log(`${key}:`, rawDiff[key])
        })
      }
    }
    
    // 解析差异结果（只包含真正的差异）
    const diffs = rawDiff ? parseDiffResult(rawDiff, leftParsed, rightParsed) : []
    console.log('diffs', diffs)
    


    return {
      success: true,
      diffs: diffs,
      leftParsed,
      rightParsed,
      leftFormatted: JSON.stringify(leftParsed, null, 2), // 格式化后的JSON字符串
      rightFormatted: JSON.stringify(rightParsed, null, 2), // 格式化后的JSON字符串
      rawDiff
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
 */
export const getDiffColorClass = (diffType: DiffType): string => {
  switch (diffType) {
    case DiffType.ADDED:
      return 'bg-green-500/20 border-green-500 text-green-400'
    case DiffType.REMOVED:
      return 'bg-red-500/20 border-red-500 text-red-400'
    case DiffType.CHANGED:
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
    default:
      return 'bg-gray-500/20 border-gray-500 text-gray-400'
  }
}

/**
 * 获取差异类型的图标
 */
export const getDiffIcon = (diffType: DiffType): string => {
  switch (diffType) {
    case DiffType.ADDED:
      return '+'
    case DiffType.REMOVED:
      return '-'
    case DiffType.CHANGED:
      return '~'
    default:
      return '?'
  }
}

/**
 * 统计差异数量
 */
export const getDiffStats = (diffs: DiffItem[]) => {
  const stats = {
    added: 0,
    removed: 0,
    changed: 0,
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
      case DiffType.CHANGED:
        stats.changed++
        break
    }
  })
  
  return stats
} 