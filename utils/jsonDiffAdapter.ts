/**
 * JSON Diff Adapter - 使用jsondiffpatch第三方库
 * 集成最佳开源JSON比对算法，支持复杂嵌套结构和数组智能匹配
 */

import * as jsondiffpatch from 'jsondiffpatch'
import * as jsonDiff from 'json-diff'

/**
 * 差异类型枚举
 */
export enum DiffType {
  ADDED = 'added',
  REMOVED = 'removed', 
  CHANGED = 'changed',
  MOVED = 'moved'
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
  oldIndex?: number // 用于移动操作
  newIndex?: number // 用于移动操作
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
  leftFormatted?: string
  rightFormatted?: string
  rawDiff?: any
  engine?: 'jsondiffpatch' | 'json-diff' // 使用的比较引擎
}

/**
 * jsondiffpatch实例配置
 */
const diffPatcher = jsondiffpatch.create({
  // 数组匹配算法配置
  arrays: {
    detectMove: true, // 检测数组元素移动
    includeValueOnMove: false
  },
  // 对象属性匹配
  propertyFilter: function(name: string, context: any) {
    return true // 比较所有属性
  }
})

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
 * 解析jsondiffpatch的差异结果
 * jsondiffpatch格式：
 * - [oldValue, newValue] - 表示值变更
 * - [newValue] - 表示新增
 * - [oldValue, 0, 0] - 表示删除
 * - ["text_diff", textDiffResult] - 表示文本差异
 * - _t: "a" - 表示数组类型
 */
const parseJsonDiffPatchResult = (
  diffResult: any,
  leftParsed: any,
  rightParsed: any,
  path: string = ''
): DiffItem[] => {
  const diffs: DiffItem[] = []
  
  if (!diffResult || typeof diffResult !== 'object') {
    return diffs
  }
  
  const processDelta = (delta: any, currentPath: string, leftObj: any, rightObj: any) => {
    if (!delta || typeof delta !== 'object') return
    
    // 检查是否是数组差异
    if (delta._t === 'a') {
      parseArrayDelta(delta, currentPath, leftObj, rightObj, diffs)
      return
    }
    
    Object.keys(delta).forEach(key => {
      if (key === '_t') return // 跳过类型标记
      
      const value = delta[key]
      const fullPath = currentPath ? `${currentPath}.${key}` : key
      
      if (Array.isArray(value)) {
        if (value.length === 1) {
          // 新增
          diffs.push({
            path: fullPath,
            type: DiffType.ADDED,
            rightValue: value[0],
            description: `新增字段: ${formatValue(value[0])}`
          })
        } else if (value.length === 2) {
          // 变更
          diffs.push({
            path: fullPath,
            type: DiffType.CHANGED,
            leftValue: value[0],
            rightValue: value[1],
            description: `值变更: ${formatValue(value[0])} → ${formatValue(value[1])}`
          })
        } else if (value.length === 3 && value[2] === 0) {
          // 删除
          diffs.push({
            path: fullPath,
            type: DiffType.REMOVED,
            leftValue: value[0],
            description: `删除字段: ${formatValue(value[0])}`
          })
        }
      } else if (typeof value === 'object') {
        // 嵌套对象差异
        const leftChild = leftObj && typeof leftObj === 'object' ? leftObj[key] : undefined
        const rightChild = rightObj && typeof rightObj === 'object' ? rightObj[key] : undefined
        processDelta(value, fullPath, leftChild, rightChild)
      }
    })
  }
  
  processDelta(diffResult, path, leftParsed, rightParsed)
  return diffs
}

/**
 * 解析数组差异（jsondiffpatch格式）
 */
const parseArrayDelta = (
  delta: any,
  path: string,
  leftArray: any[],
  rightArray: any[],
  diffs: DiffItem[]
) => {
  Object.keys(delta).forEach(key => {
    if (key === '_t') return
    
    const value = delta[key]
    const index = parseInt(key)
    
    if (Array.isArray(value)) {
      const itemPath = `${path}[${index}]`
      
      if (value.length === 1) {
        // 新增
        diffs.push({
          path: itemPath,
          type: DiffType.ADDED,
          rightValue: value[0],
          description: `新增数组元素: ${formatValue(value[0])}`
        })
      } else if (value.length === 2) {
        // 变更
        diffs.push({
          path: itemPath,
          type: DiffType.CHANGED,
          leftValue: value[0],
          rightValue: value[1],
          description: `数组元素变更: ${formatValue(value[0])} → ${formatValue(value[1])}`
        })
      } else if (value.length === 3) {
        if (value[2] === 0) {
          // 删除
          diffs.push({
            path: itemPath,
            type: DiffType.REMOVED,
            leftValue: value[0],
            description: `删除数组元素: ${formatValue(value[0])}`
          })
        } else if (value[2] === 3) {
          // 移动
          diffs.push({
            path: itemPath,
            type: DiffType.MOVED,
            leftValue: value[0],
            rightValue: value[0],
            oldIndex: index,
            newIndex: value[1],
            description: `数组元素移动: 从位置${index} → ${value[1]}`
          })
        }
      }
    } else if (typeof value === 'object') {
      // 嵌套对象差异
      const itemPath = `${path}[${index}]`
      const leftItem = leftArray && leftArray[index]
      const rightItem = rightArray && rightArray[index]
      
      if (value._t === 'a') {
        parseArrayDelta(value, itemPath, leftItem, rightItem, diffs)
      } else {
        const nestedDiffs = parseJsonDiffPatchResult(value, leftItem, rightItem, itemPath)
        diffs.push(...nestedDiffs)
      }
    }
  })
}

/**
 * 回退到json-diff的解析逻辑
 */
const parseJsonDiffResult = (
  diffResult: any,
  leftParsed: any,
  rightParsed: any,
  path: string = ''
): DiffItem[] => {
  const diffs: DiffItem[] = []

  if (!diffResult) {
    return diffs
  }
  
  // 特殊处理：如果顶层 diffResult 就是数组，说明比较的是数组类型
  if (Array.isArray(diffResult)) {
    parseArrayDiff(diffResult, path || 'root', diffs)
    return diffs
  }
  
  if (typeof diffResult !== 'object') {
    return diffs
  }
  
  const processDiff = (obj: any, currentPath: string) => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return
    }
    
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      
      if (key.endsWith('__added')) {
        // 新增字段
        const fieldName = key.substring(0, key.length - '__added'.length)
        const fullPath = currentPath ? `${currentPath}.${fieldName}` : fieldName
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
        parseArrayDiff(value, fullPath, diffs)
      } else if (typeof value === 'object' && value !== null) {
        // 嵌套对象 - 继续递归处理
        const fullPath = currentPath ? `${currentPath}.${key}` : key
        processDiff(value, fullPath)
      }
    })
  }
  
  processDiff(diffResult, path)
  return diffs
}

/**
 * 解析数组差异（json-diff格式）
 */
const parseArrayDiff = (arrayDiff: any[], path: string, diffs: DiffItem[]) => {
  // 先收集所有的操作
  const operations: Array<{operation: string, value: any, index: number}> = []
  
  arrayDiff.forEach((item, index) => {
    if (Array.isArray(item) && item.length >= 2) {
      const [operation, value] = item
      operations.push({ operation, value, index })
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
    } else if (operation.operation === '-') {
      diffs.push({
        path: itemPath,
        type: DiffType.REMOVED,
        leftValue: operation.value,
        description: `删除数组元素: ${formatValue(operation.value)}`
      })
    } else if (operation.operation === '~') {
      // 直接的修改操作
      diffs.push({
        path: itemPath,
        type: DiffType.CHANGED,
        leftValue: arrayDiff[operation.index][1],
        rightValue: arrayDiff[operation.index][2],
        description: `数组元素变更: ${formatValue(arrayDiff[operation.index][1])} → ${formatValue(arrayDiff[operation.index][2])}`
      })
    }
  }
}

/**
 * 智能合并删除和新增操作为变更操作
 */
const mergeDiffsIntoChanges = (diffs: DiffItem[]): DiffItem[] => {
  const mergedDiffs: DiffItem[] = []
  const processedIndices = new Set<number>()
  
  for (let i = 0; i < diffs.length; i++) {
    if (processedIndices.has(i)) continue
    
    const currentDiff = diffs[i]
    
    // 查找相同路径的配对操作
    let pairedIndex = -1
    for (let j = i + 1; j < diffs.length; j++) {
      if (processedIndices.has(j)) continue
      
      const nextDiff = diffs[j]
      
      // 检查是否是相同路径的删除+新增配对
      if (currentDiff.path === nextDiff.path &&
          ((currentDiff.type === DiffType.REMOVED && nextDiff.type === DiffType.ADDED) ||
           (currentDiff.type === DiffType.ADDED && nextDiff.type === DiffType.REMOVED))) {
        pairedIndex = j
        break
      }
    }
    
    if (pairedIndex !== -1) {
      // 找到配对，合并为CHANGED类型
      const pairedDiff = diffs[pairedIndex]
      const leftValue = currentDiff.type === DiffType.REMOVED ? currentDiff.leftValue : pairedDiff.leftValue
      const rightValue = currentDiff.type === DiffType.ADDED ? currentDiff.rightValue : pairedDiff.rightValue
      
      mergedDiffs.push({
        path: currentDiff.path,
        type: DiffType.CHANGED,
        leftValue,
        rightValue,
        description: `值变更: ${formatValue(leftValue)} → ${formatValue(rightValue)}`
      })
      
      // 标记两个差异都已处理
      processedIndices.add(i)
      processedIndices.add(pairedIndex)
    } else {
      // 没有找到配对，保持原差异
      mergedDiffs.push(currentDiff)
      processedIndices.add(i)
    }
  }
  
  return mergedDiffs
}

/**
 * 比较两个JSON字符串 - 智能选择最佳引擎
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

    // 优先使用jsondiffpatch引擎
    try {
      const jsondiffpatchResult = diffPatcher.diff(leftParsed, rightParsed)
      
      if (jsondiffpatchResult) {
        const rawDiffs = parseJsonDiffPatchResult(jsondiffpatchResult, leftParsed, rightParsed)
        const optimizedDiffs = mergeDiffsIntoChanges(rawDiffs)
        
        return {
          success: true,
          diffs: optimizedDiffs,
          leftParsed,
          rightParsed,
          leftFormatted: JSON.stringify(leftParsed, null, 2),
          rightFormatted: JSON.stringify(rightParsed, null, 2),
          rawDiff: jsondiffpatchResult,
          engine: 'jsondiffpatch'
        }
      }
    } catch (jsondiffpatchError) {
      console.warn('jsondiffpatch failed, falling back to json-diff:', jsondiffpatchError)
    }

    // 回退到json-diff引擎
    const jsonDiffResult = jsonDiff.diff(leftParsed, rightParsed)
    const rawDiffs = jsonDiffResult ? parseJsonDiffResult(jsonDiffResult, leftParsed, rightParsed) : []
    const optimizedDiffs = mergeDiffsIntoChanges(rawDiffs)

    return {
      success: true,
      diffs: optimizedDiffs,
      leftParsed,
      rightParsed,
      leftFormatted: JSON.stringify(leftParsed, null, 2),
      rightFormatted: JSON.stringify(rightParsed, null, 2),
      rawDiff: jsonDiffResult,
      engine: 'json-diff'
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
    case DiffType.MOVED:
      return 'bg-blue-500/20 border-blue-500 text-blue-400'
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
    case DiffType.MOVED:
      return '↔'
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
    moved: 0,
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
      case DiffType.MOVED:
        stats.moved++
        break
    }
  })
  
  return stats
}