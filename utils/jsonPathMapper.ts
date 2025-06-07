/**
 * JSON路径映射工具
 * 用于精确定位JSON中的字段在源码中的位置
 */

export interface PathLocation {
  line: number          // 行号（1-based）
  column: number        // 列号（1-based）
  path: string[]        // JSON路径
  type: 'key' | 'value' // 是键还是值
}

/**
 * 解析JSON字符串，构建路径到位置的映射
 * @param jsonString JSON字符串
 * @returns 路径位置映射表
 */
export function buildPathLocationMap(jsonString: string): Map<string, PathLocation[]> {
  const map = new Map<string, PathLocation[]>()
  
  try {
    // 首先验证JSON是否有效
    JSON.parse(jsonString)
    
    const lines = jsonString.split('\n')
    const pathStack: Array<{ key: string; type: 'object' | 'array' }> = []
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      const lineNumber = lineIndex + 1
      
      // 处理每一行，查找键值对
      processLine(line, lineNumber, pathStack, map)
    }
    
  } catch (error) {
    // JSON无效时返回空映射
    console.warn('Invalid JSON for path mapping:', error)
  }
  
  return map
}

/**
 * 处理单行内容，识别键值对和结构
 */
function processLine(
  line: string, 
  lineNumber: number, 
  pathStack: Array<{ key: string; type: 'object' | 'array' }>,
  map: Map<string, PathLocation[]>
) {
  const trimmedLine = line.trim()
  
  // 匹配对象键值对 "key": value
  const keyValueMatch = trimmedLine.match(/^"([^"]+)"\s*:\s*(.*)/)
  if (keyValueMatch) {
    const [, key, valueStr] = keyValueMatch
    const currentPath = [...pathStack.map(p => p.key), key]
    const pathString = currentPath.join('.')
    
    // 记录键的位置
    const keyColumn = line.indexOf(`"${key}"`) + 1
    addToMap(map, pathString, {
      line: lineNumber,
      column: keyColumn,
      path: currentPath,
      type: 'key'
    })
    
    // 如果值在同一行，记录值的位置
    const valueMatch = valueStr.match(/^([^,\{\[\s].*?)(?:,?\s*)?$/)
    if (valueMatch) {
      const valueColumn = line.indexOf(valueStr.trim()) + 1
      addToMap(map, pathString, {
        line: lineNumber,
        column: valueColumn,
        path: currentPath,
        type: 'value'
      })
    }
    
    // 更新路径栈
    if (valueStr.trim().endsWith('{')) {
      pathStack.push({ key, type: 'object' })
    } else if (valueStr.trim().endsWith('[')) {
      pathStack.push({ key, type: 'array' })
    }
  }
  
  // 处理数组元素
  const arrayElementMatch = trimmedLine.match(/^(\d+):\s*(.*)/)
  if (arrayElementMatch && pathStack.length > 0 && pathStack[pathStack.length - 1].type === 'array') {
    const [, index, valueStr] = arrayElementMatch
    const currentPath = [...pathStack.map(p => p.key), index]
    const pathString = currentPath.join('.')
    
    const valueColumn = line.indexOf(valueStr.trim()) + 1
    addToMap(map, pathString, {
      line: lineNumber,
      column: valueColumn,
      path: currentPath,
      type: 'value'
    })
  }
  
  // 处理结构结束
  if (trimmedLine.includes('}') || trimmedLine.includes(']')) {
    const closeCount = (trimmedLine.match(/[\}\]]/g) || []).length
    for (let i = 0; i < closeCount && pathStack.length > 0; i++) {
      pathStack.pop()
    }
  }
}

/**
 * 添加路径位置到映射表
 */
function addToMap(map: Map<string, PathLocation[]>, pathString: string, location: PathLocation) {
  if (!map.has(pathString)) {
    map.set(pathString, [])
  }
  map.get(pathString)!.push(location)
}

/**
 * 查找指定路径在JSON中的位置
 * @param pathLocationMap 路径位置映射表
 * @param targetPath 目标路径
 * @returns 位置信息
 */
export function findPathLocation(
  pathLocationMap: Map<string, PathLocation[]>, 
  targetPath: string[]
): PathLocation[] {
  const pathString = targetPath.join('.')
  return pathLocationMap.get(pathString) || []
}

/**
 * 更精确的路径匹配算法
 * 基于JSON AST进行精确匹配
 */
export function buildPrecisePathMap(jsonString: string): Map<string, number[]> {
  const lineMap = new Map<string, number[]>()
  
  try {
    const parsed = JSON.parse(jsonString)
    const lines = jsonString.split('\n')
    
    // 递归遍历JSON对象，记录每个路径
    const traverse = (obj: any, path: string[] = [], startLine = 1): void => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            const currentPath = [...path, String(index)]
            const pathString = currentPath.join('.')
            
            // 查找数组元素在源码中的行号
            const lineNumber = findArrayElementLine(lines, currentPath, startLine)
            if (lineNumber > 0) {
              addLineToPath(lineMap, pathString, lineNumber)
            }
            
            traverse(item, currentPath, lineNumber || startLine)
          })
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            const currentPath = [...path, key]
            const pathString = currentPath.join('.')
            
            // 查找对象键在源码中的行号
            const lineNumber = findObjectKeyLine(lines, key, startLine)
            if (lineNumber > 0) {
              addLineToPath(lineMap, pathString, lineNumber)
            }
            
            traverse(value, currentPath, lineNumber || startLine)
          })
        }
      }
    }
    
    traverse(parsed)
    
  } catch (error) {
    console.warn('Failed to build precise path map:', error)
  }
  
  return lineMap
}

/**
 * 查找对象键在源码中的行号
 */
function findObjectKeyLine(lines: string[], key: string, startLine: number): number {
  const quotedKey = `"${key}"`
  
  for (let i = startLine - 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes(quotedKey + ':')) {
      return i + 1
    }
  }
  
  return -1
}

/**
 * 查找数组元素在源码中的行号
 */
function findArrayElementLine(lines: string[], path: string[], startLine: number): number {
  // 简化实现：基于缩进层级和位置估算
  // 这里可以根据需要实现更复杂的逻辑
  
  return startLine
}

/**
 * 添加行号到路径映射
 */
function addLineToPath(lineMap: Map<string, number[]>, pathString: string, lineNumber: number) {
  if (!lineMap.has(pathString)) {
    lineMap.set(pathString, [])
  }
  lineMap.get(pathString)!.push(lineNumber)
} 