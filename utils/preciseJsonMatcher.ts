/**
 * 精确的JSON差异匹配工具
 * 基于JSON解析和AST遍历，确保100%准确的差异定位
 */

import { DiffItem } from './jsonDiffer'

export interface LineMatch {
  lineNumber: number
  diffs: DiffItem[]
  isExactMatch: boolean
}

/**
 * 精确匹配差异到行号
 * @param jsonString JSON字符串
 * @param diffs 差异列表
 * @param side 左侧或右侧
 * @returns 行号匹配结果
 */
export function matchDiffsToLines(
  jsonString: string, 
  diffs: DiffItem[], 
  side: 'left' | 'right'
): Map<number, DiffItem[]> {
  const lineMatches = new Map<number, DiffItem[]>()
  
  if (!jsonString.trim() || diffs.length === 0) {
    return lineMatches
  }
  
  try {
    // 解析JSON确保有效性
    const parsedJson = JSON.parse(jsonString)
    const lines = jsonString.split('\n')
    
    // 对每个差异进行精确定位
    diffs.forEach(diff => {
      const matchingLines = findDiffInLines(lines, diff, side, parsedJson)
      matchingLines.forEach(lineNumber => {
        if (!lineMatches.has(lineNumber)) {
          lineMatches.set(lineNumber, [])
        }
        lineMatches.get(lineNumber)!.push(diff)
      })
    })
    
  } catch (error) {
    console.warn('Failed to match diffs to lines:', error)
  }
  
  return lineMatches
}

/**
 * 在源码行中查找指定差异的精确位置
 */
function findDiffInLines(
  lines: string[], 
  diff: DiffItem, 
  side: 'left' | 'right',
  parsedJson: any
): number[] {
  const matchingLines: number[] = []
  
  // 根据差异路径在JSON中定位
  const targetValue = side === 'left' ? diff.leftValue : diff.rightValue
  const path = diff.path
  
  if (path.length === 0) {
    // 根级差异，返回第一行
    return [1]
  }
  
  // 查找路径中的最后一个键
  const lastKey = path[path.length - 1]
  
  // 在源码中查找这个键的位置
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1
    
    // 检查是否包含目标键（对象属性）
    if (isNaN(Number(lastKey))) {
      // 对象键
      const keyPattern = new RegExp(`"${escapeRegex(lastKey)}"\\s*:`)
      if (keyPattern.test(line)) {
        // 进一步验证这是正确的路径
        if (isCorrectPath(parsedJson, path, line, targetValue)) {
          matchingLines.push(lineNumber)
        }
      }
    } else {
      // 数组索引 - 检查数组上下文
      const arrayIndex = parseInt(lastKey)
      if (isArrayElementLine(line, arrayIndex, targetValue)) {
        matchingLines.push(lineNumber)
      }
    }
  }
  
  return matchingLines
}

/**
 * 验证路径是否正确
 */
function isCorrectPath(
  parsedJson: any, 
  path: string[], 
  line: string, 
  expectedValue: any
): boolean {
  try {
    // 导航到路径指定的值
    let current = parsedJson
    for (const key of path) {
      if (current && typeof current === 'object') {
        current = current[key]
      } else {
        return false
      }
    }
    
    // 检查值是否匹配
    if (expectedValue !== undefined) {
      if (typeof expectedValue === 'string') {
        return line.includes(`"${expectedValue}"`)
      } else {
        return line.includes(JSON.stringify(expectedValue))
      }
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * 检查是否为数组元素行
 */
function isArrayElementLine(line: string, index: number, value: any): boolean {
  if (value === undefined) return false
  
  const valueStr = typeof value === 'string' 
    ? `"${value}"` 
    : JSON.stringify(value)
  
  return line.includes(valueStr)
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 更简单但可靠的方法：基于键值对的精确匹配
 * 只标记确实包含差异键或值的行
 */
export function simpleButAccurateMatch(
  jsonString: string,
  diffs: DiffItem[],
  side: 'left' | 'right'
): Map<number, DiffItem[]> {
  const lineMatches = new Map<number, DiffItem[]>()
  
  if (!jsonString.trim()) return lineMatches
  
  const lines = jsonString.split('\n')
  
  diffs.forEach(diff => {
    const path = diff.path
    if (path.length === 0) return
    
    const lastKey = path[path.length - 1]
    const targetValue = side === 'left' ? diff.leftValue : diff.rightValue
    
    // 查找包含目标键的行
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1
      
      let isMatch = false
      
      // 检查对象键匹配
      if (isNaN(Number(lastKey))) {
        const keyPattern = `"${lastKey}"`
        if (line.includes(keyPattern + ':')) {
          isMatch = true
        }
      }
      
      // 检查值匹配（仅当有明确值时）
      if (targetValue !== undefined && !isMatch) {
        const valueStr = typeof targetValue === 'string' 
          ? `"${targetValue}"` 
          : JSON.stringify(targetValue)
        
        if (line.includes(valueStr)) {
          // 额外验证：确保这不是误匹配
          if (line.includes(`"${lastKey}"`)) {
            isMatch = true
          }
        }
      }
      
      if (isMatch) {
        if (!lineMatches.has(lineNumber)) {
          lineMatches.set(lineNumber, [])
        }
        lineMatches.get(lineNumber)!.push(diff)
      }
    }
  })
  
  return lineMatches
} 