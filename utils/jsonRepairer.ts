/**
 * JSON 修复工具 - 集成最佳开源JSON修复库
 * 结合jsonrepair和自研算法，提供最强大的JSON修复能力
 */

import { jsonrepair } from 'jsonrepair'

/**
 * JSON修复结果接口
 */
export interface RepairResult {
  success: boolean
  repairedJson?: string
  originalJson?: string
  error?: string
  fixes?: string[]
  warnings?: string[]
  engine?: 'jsonrepair' | 'custom' // 使用的修复引擎
}

/**
 * 验证JSON是否有效
 */
const isValidJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

/**
 * 自定义JSON修复算法（作为备选）
 */
const customRepairJson = (jsonString: string): RepairResult => {
  const fixes: string[] = []
  const warnings: string[] = []
  let repairedJson = jsonString.trim()
  
  // 检查是否为空
  if (!repairedJson) {
    return {
      success: false,
      error: 'JSON内容不能为空',
      engine: 'custom'
    }
  }

  try {
    // 先尝试直接解析，看是否已经是有效的JSON
    JSON.parse(repairedJson)
    return {
      success: true,
      repairedJson: JSON.stringify(JSON.parse(repairedJson), null, 2),
      originalJson: jsonString,
      fixes: ['JSON格式已正确，仅进行了格式化'],
      warnings: [],
      engine: 'custom'
    }
  } catch (error) {
    // JSON无效，开始修复过程
  }

  // 1. 移除注释 (// 和 /* */)
  const originalLength = repairedJson.length
  repairedJson = repairedJson
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除 /* */ 注释
    .replace(/\/\/.*$/gm, '') // 移除 // 注释
  
  if (repairedJson.length !== originalLength) {
    fixes.push('移除了注释')
  }

  // 2. 修复键名缺少引号的问题
  const beforeKeyFix = repairedJson
  repairedJson = repairedJson.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
  
  if (repairedJson !== beforeKeyFix) {
    fixes.push('为对象键名添加了双引号')
  }

  // 3. 将单引号转换为双引号（但要避免字符串内的单引号）
  const beforeQuoteFix = repairedJson
  repairedJson = repairedJson.replace(/'/g, '"')
  
  if (repairedJson !== beforeQuoteFix) {
    fixes.push('将单引号转换为双引号')
  }

  // 4. 修复多余的逗号（尾随逗号）
  const beforeTrailingCommaFix = repairedJson
  repairedJson = repairedJson
    .replace(/,(\s*[}\]])/g, '$1') // 移除对象和数组末尾的多余逗号
  
  if (repairedJson !== beforeTrailingCommaFix) {
    fixes.push('移除了多余的尾随逗号')
  }

  // 5. 修复缺少逗号的问题（简单启发式方法）
  const beforeMissingCommaFix = repairedJson
  repairedJson = repairedJson
    .replace(/"\s*\n\s*"/g, '",\n"') // 字符串后缺少逗号
    .replace(/}\s*\n\s*"/g, '},\n"') // 对象后缺少逗号
    .replace(/]\s*\n\s*"/g, '],\n"') // 数组后缺少逗号
    .replace(/(\d)\s*\n\s*"/g, '$1,\n"') // 数字后缺少逗号
  
  if (repairedJson !== beforeMissingCommaFix) {
    fixes.push('添加了缺少的逗号')
  }

  // 6. 修复多个连续逗号
  const beforeMultipleCommaFix = repairedJson
  repairedJson = repairedJson.replace(/,+/g, ',')
  
  if (repairedJson !== beforeMultipleCommaFix) {
    fixes.push('修复了多个连续逗号')
  }

  // 7. 修复undefined值为null
  const beforeUndefinedFix = repairedJson
  repairedJson = repairedJson.replace(/:\s*undefined/g, ': null')
  
  if (repairedJson !== beforeUndefinedFix) {
    fixes.push('将undefined值转换为null')
  }

  // 8. 修复未引号包围的字符串值（启发式方法）
  const beforeStringFix = repairedJson
  repairedJson = repairedJson.replace(/:\s*([a-zA-Z][a-zA-Z0-9_]*)\s*([,}\]])/g, ': "$1"$2')
  
  if (repairedJson !== beforeStringFix) {
    fixes.push('为字符串值添加了引号')
    warnings.push('自动为某些值添加了引号，请验证结果是否正确')
  }

  // 9. 尝试修复不平衡的括号（基本检查）
  const openBraces = (repairedJson.match(/{/g) || []).length
  const closeBraces = (repairedJson.match(/}/g) || []).length
  const openBrackets = (repairedJson.match(/\[/g) || []).length
  const closeBrackets = (repairedJson.match(/]/g) || []).length

  if (openBraces > closeBraces) {
    repairedJson += '}'.repeat(openBraces - closeBraces)
    fixes.push(`添加了${openBraces - closeBraces}个缺少的花括号`)
  }

  if (openBrackets > closeBrackets) {
    repairedJson += ']'.repeat(openBrackets - closeBrackets)
    fixes.push(`添加了${openBrackets - closeBrackets}个缺少的方括号`)
  }

  // 10. 清理多余的空白字符
  repairedJson = repairedJson.replace(/\s+/g, ' ').trim()

  // 尝试解析修复后的JSON
  try {
    const parsed = JSON.parse(repairedJson)
    const formattedJson = JSON.stringify(parsed, null, 2)
    
    return {
      success: true,
      repairedJson: formattedJson,
      originalJson: jsonString,
      fixes: fixes.length > 0 ? fixes : ['JSON已成功修复并格式化'],
      warnings,
      engine: 'custom'
    }
  } catch (finalError) {
    // 如果修复后仍然无法解析，返回错误
    return {
      success: false,
      originalJson: jsonString,
      error: `无法修复JSON: ${finalError instanceof Error ? finalError.message : '未知错误'}`,
      fixes,
      warnings: [...warnings, '自动修复失败，可能需要手动调整'],
      engine: 'custom'
    }
  }
}

/**
 * 修复JSON字符串中的常见语法错误 - 智能选择最佳引擎
 * @param jsonString - 需要修复的JSON字符串
 * @returns RepairResult - 修复结果
 */
export const repairJson = (jsonString: string): RepairResult => {
  // 检查输入
  if (!jsonString || !jsonString.trim()) {
    return {
      success: false,
      error: 'JSON内容不能为空'
    }
  }

  const trimmedJson = jsonString.trim()

  // 如果已经是有效的JSON，直接返回格式化后的结果
  if (isValidJson(trimmedJson)) {
    try {
      const parsed = JSON.parse(trimmedJson)
      return {
        success: true,
        repairedJson: JSON.stringify(parsed, null, 2),
        originalJson: jsonString,
        fixes: ['JSON格式已正确，仅进行了格式化'],
        warnings: [],
        engine: 'jsonrepair'
      }
    } catch (error) {
      // 理论上不应该到这里，但为了安全起见
    }
  }

  // 优先尝试jsonrepair库
  try {
    const repairedByJsonrepair = jsonrepair(trimmedJson)
    
    // 验证修复结果
    if (isValidJson(repairedByJsonrepair)) {
      const parsed = JSON.parse(repairedByJsonrepair)
      const formattedJson = JSON.stringify(parsed, null, 2)
      
      // 分析修复了什么
      const fixes = analyzeRepairChanges(trimmedJson, repairedByJsonrepair)
      
      return {
        success: true,
        repairedJson: formattedJson,
        originalJson: jsonString,
        fixes: fixes.length > 0 ? fixes : ['JSON已成功修复并格式化'],
        warnings: [],
        engine: 'jsonrepair'
      }
    }
  } catch (jsonrepairError) {
    console.warn('jsonrepair failed, falling back to custom repair:', jsonrepairError)
  }

  // 回退到自定义修复算法
  return customRepairJson(jsonString)
}

/**
 * 分析jsonrepair修复了哪些问题
 */
const analyzeRepairChanges = (original: string, repaired: string): string[] => {
  const fixes: string[] = []
  
  // 检查是否修复了引号问题
  if (original.includes("'") && !repaired.includes("'")) {
    fixes.push('将单引号转换为双引号')
  }
  
  // 检查是否添加了缺失的引号
  if (original.match(/[{,]\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/) && 
      !repaired.match(/[{,]\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/)) {
    fixes.push('为对象键名添加了引号')
  }
  
  // 检查是否移除了注释
  if ((original.includes('//') || original.includes('/*')) && 
      (!repaired.includes('//') && !repaired.includes('/*'))) {
    fixes.push('移除了注释')
  }
  
  // 检查是否修复了尾随逗号
  if (original.match(/,\s*[}\]]/) && !repaired.match(/,\s*[}\]]/)) {
    fixes.push('移除了多余的尾随逗号')
  }
  
  // 检查括号匹配
  const originalBraceCount = (original.match(/{/g) || []).length - (original.match(/}/g) || []).length
  const repairedBraceCount = (repaired.match(/{/g) || []).length - (repaired.match(/}/g) || []).length
  
  if (originalBraceCount !== 0 && repairedBraceCount === 0) {
    fixes.push('修复了不匹配的花括号')
  }
  
  const originalBracketCount = (original.match(/\[/g) || []).length - (original.match(/]/g) || []).length
  const repairedBracketCount = (repaired.match(/\[/g) || []).length - (repaired.match(/]/g) || []).length
  
  if (originalBracketCount !== 0 && repairedBracketCount === 0) {
    fixes.push('修复了不匹配的方括号')
  }
  
  // 检查是否修复了undefined
  if (original.includes('undefined') && !repaired.includes('undefined')) {
    fixes.push('将undefined值转换为null')
  }
  
  if (fixes.length === 0) {
    fixes.push('JSON已成功修复')
  }
  
  return fixes
}

/**
 * 验证并分析JSON字符串的错误
 * @param jsonString - JSON字符串
 * @returns 错误分析结果
 */
export const analyzeJsonErrors = (jsonString: string): string[] => {
  const errors: string[] = []
  
  if (!jsonString.trim()) {
    errors.push('JSON内容为空')
    return errors
  }

  try {
    JSON.parse(jsonString)
    return errors // 没有错误
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    
    // 分析常见错误类型
    if (errorMessage.includes('Unexpected token')) {
      errors.push('存在意外的字符或符号')
    }
    
    if (errorMessage.includes('Unexpected end')) {
      errors.push('JSON不完整，可能缺少结束符')
    }
    
    if (errorMessage.includes('Expected')) {
      errors.push('缺少必要的符号（如逗号、引号等）')
    }

    // 检查常见问题
    if (jsonString.includes("'")) {
      errors.push('使用了单引号，应使用双引号')
    }
    
    if (jsonString.match(/[{,]\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/)) {
      errors.push('对象键名缺少引号')
    }
    
    if (jsonString.includes('//') || jsonString.includes('/*')) {
      errors.push('包含注释，JSON不支持注释')
    }
    
    if (jsonString.match(/,\s*[}\]]/)) {
      errors.push('存在多余的尾随逗号')
    }

    if (jsonString.includes('undefined')) {
      errors.push('包含undefined值，应使用null')
    }

    // 检查括号匹配
    const openBraces = (jsonString.match(/{/g) || []).length
    const closeBraces = (jsonString.match(/}/g) || []).length
    const openBrackets = (jsonString.match(/\[/g) || []).length
    const closeBrackets = (jsonString.match(/]/g) || []).length

    if (openBraces !== closeBraces) {
      errors.push('花括号不匹配')
    }

    if (openBrackets !== closeBrackets) {
      errors.push('方括号不匹配')
    }

    return errors
  }
}

/**
 * 下载JSON文件
 * @param jsonContent - JSON内容
 * @param filename - 文件名（不含扩展名）
 */
export const downloadJson = (jsonContent: string, filename: string = 'repaired-json'): void => {
  try {
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = `${filename}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
    throw new Error('下载文件失败')
  }
}

/**
 * 复制到剪贴板
 * @param text - 要复制的文本
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代 Clipboard API
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 回退到旧方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 批量修复多个JSON字符串
 * @param jsonStrings - JSON字符串数组
 * @returns 修复结果数组
 */
export const batchRepairJson = (jsonStrings: string[]): RepairResult[] => {
  return jsonStrings.map(jsonString => repairJson(jsonString))
}

/**
 * 检测JSON格式类型
 * @param jsonString - JSON字符串
 * @returns 格式类型描述
 */
export const detectJsonFormat = (jsonString: string): string => {
  if (!jsonString || !jsonString.trim()) {
    return '空内容'
  }

  const trimmed = jsonString.trim()
  
  if (trimmed.startsWith('{')) {
    return 'JSON对象'
  } else if (trimmed.startsWith('[')) {
    return 'JSON数组'
  } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return 'JSON字符串'
  } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return 'JSON数字'
  } else if (trimmed === 'true' || trimmed === 'false') {
    return 'JSON布尔值'
  } else if (trimmed === 'null') {
    return 'JSON null值'
  } else {
    return '未知格式'
  }
}