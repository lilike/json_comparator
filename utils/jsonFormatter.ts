/**
 * JSON格式化结果接口
 */
export interface FormatResult {
  success: boolean
  formattedJson?: string
  error?: string
  errorLine?: number
}

/**
 * JSON格式化函数
 * @param jsonString - 需要格式化的JSON字符串
 * @param indent - 缩进空格数，默认为2
 * @returns FormatResult - 格式化结果
 */
export const formatJson = (jsonString: string, indent: number = 2): FormatResult => {
  // 去除首尾空格
  const trimmedJson = jsonString.trim()
  
  // 检查是否为空
  if (!trimmedJson) {
    return {
      success: false,
      error: 'JSON内容不能为空'
    }
  }

  try {
    // 尝试解析JSON
    const parsed = JSON.parse(trimmedJson)
    
    // 格式化JSON
    const formattedJson = JSON.stringify(parsed, null, indent)
    
    return {
      success: true,
      formattedJson
    }
  } catch (error) {
    // 解析错误时尝试提取错误位置
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    const lineMatch = errorMessage.match(/line (\d+)/i)
    const positionMatch = errorMessage.match(/position (\d+)/i)
    
    let friendlyError = '无效的JSON格式'
    let errorLine: number | undefined

    // 根据错误类型提供更友好的错误信息
    if (errorMessage.includes('Unexpected token')) {
      friendlyError = 'JSON语法错误：存在意外的字符'
    } else if (errorMessage.includes('Unexpected end')) {
      friendlyError = 'JSON不完整：缺少结束符号'
    } else if (errorMessage.includes('Expected')) {
      friendlyError = 'JSON格式错误：缺少必要的符号'
    }

    // 如果有位置信息，计算大概的行号
    if (positionMatch) {
      const position = parseInt(positionMatch[1])
      const textBeforeError = trimmedJson.slice(0, position)
      errorLine = textBeforeError.split('\n').length
    }

    return {
      success: false,
      error: friendlyError,
      errorLine
    }
  }
}

/**
 * 验证JSON字符串是否有效
 * @param jsonString - JSON字符串
 * @returns 是否有效
 */
export const isValidJson = (jsonString: string): boolean => {
  const trimmedJson = jsonString.trim()
  if (!trimmedJson) return false
  
  try {
    JSON.parse(trimmedJson)
    return true
  } catch {
    return false
  }
}

/**
 * 压缩JSON字符串（移除空格和换行）
 * @param jsonString - JSON字符串
 * @returns 压缩后的JSON字符串
 */
export const minifyJson = (jsonString: string): FormatResult => {
  const trimmedJson = jsonString.trim()
  
  if (!trimmedJson) {
    return {
      success: false,
      error: 'JSON内容不能为空'
    }
  }

  try {
    const parsed = JSON.parse(trimmedJson)
    const minifiedJson = JSON.stringify(parsed)
    
    return {
      success: true,
      formattedJson: minifiedJson
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return {
      success: false,
      error: `JSON格式错误: ${errorMessage}`
    }
  }
} 