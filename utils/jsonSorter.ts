/**
 * JSON排序结果接口
 */
export interface SortResult {
  success: boolean
  sortedJson?: string
  error?: string
}

/**
 * 排序选项类型
 */
export type SortOption = 'none' | 'alphabetical' | 'type'

/**
 * 获取值的数据类型权重（用于类型排序）
 */
const getTypeWeight = (value: any): number => {
  if (value === null) return 0
  if (typeof value === 'boolean') return 1
  if (typeof value === 'number') return 2
  if (typeof value === 'string') return 3
  if (Array.isArray(value)) return 4
  if (typeof value === 'object') return 5
  return 6
}

/**
 * 递归排序JSON对象
 * @param obj - 要排序的对象
 * @param sortType - 排序类型
 * @returns 排序后的对象
 */
const sortObjectRecursively = (obj: any, sortType: SortOption): any => {
  if (sortType === 'none') {
    // 原始顺序 - 只递归处理嵌套对象，不改变键顺序
    if (Array.isArray(obj)) {
      return obj.map(item => sortObjectRecursively(item, sortType))
    } else if (obj !== null && typeof obj === 'object') {
      const result: any = {}
      Object.keys(obj).forEach(key => {
        result[key] = sortObjectRecursively(obj[key], sortType)
      })
      return result
    }
    return obj
  }

  if (Array.isArray(obj)) {
    // 数组：递归排序每个元素
    return obj.map(item => sortObjectRecursively(item, sortType))
  } else if (obj !== null && typeof obj === 'object') {
    // 对象：排序键并递归处理值
    const keys = Object.keys(obj)
    
    let sortedKeys: string[]
    
    if (sortType === 'alphabetical') {
      // 字母排序
      sortedKeys = keys.sort((a, b) => a.localeCompare(b, 'zh-CN', { 
        numeric: true, 
        sensitivity: 'base' 
      }))
    } else if (sortType === 'type') {
      // 类型排序：先按类型分组，再按字母排序
      sortedKeys = keys.sort((a, b) => {
        const typeWeightA = getTypeWeight(obj[a])
        const typeWeightB = getTypeWeight(obj[b])
        
        if (typeWeightA !== typeWeightB) {
          return typeWeightA - typeWeightB
        }
        
        // 同类型按字母排序
        return a.localeCompare(b, 'zh-CN', { 
          numeric: true, 
          sensitivity: 'base' 
        })
      })
    } else {
      sortedKeys = keys
    }
    
    const result: any = {}
    sortedKeys.forEach(key => {
      result[key] = sortObjectRecursively(obj[key], sortType)
    })
    
    return result
  }
  
  return obj
}

/**
 * 对JSON字符串进行排序
 * @param jsonString - JSON字符串
 * @param sortType - 排序类型
 * @param t - 国际化翻译函数
 * @returns 排序结果
 */
export const sortJson = (jsonString: string, sortType: SortOption, t?: any): SortResult => {
  const trimmedJson = jsonString.trim()
  
  // 检查是否为空
  if (!trimmedJson) {
    return {
      success: false,
      error: t ? t('errors.emptyContent') : 'JSON内容不能为空'
    }
  }

  try {
    // 解析JSON
    const parsed = JSON.parse(trimmedJson)
    
    // 排序对象
    const sorted = sortObjectRecursively(parsed, sortType)
    
    // 重新序列化为格式化的JSON
    const sortedJson = JSON.stringify(sorted, null, 2)
    
    return {
      success: true,
      sortedJson
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    const baseError = t ? t('errors.jsonParseError') : 'JSON格式错误'
    return {
      success: false,
      error: `${baseError}: ${errorMessage}`
    }
  }
}

/**
 * 获取排序选项的显示名称
 * @param sortType - 排序类型
 * @param t - 国际化翻译函数
 * @returns 显示名称
 */
export const getSortDisplayName = (sortType: SortOption, t?: any): string => {
  if (!t) {
    // 回退到硬编码的中文（向后兼容）
    switch (sortType) {
      case 'none':
        return '原始顺序'
      case 'alphabetical':
        return '字母排序'
      case 'type':
        return '类型排序'
      default:
        return '未知排序'
    }
  }

  switch (sortType) {
    case 'none':
      return t('sorting.original')
    case 'alphabetical':
      return t('sorting.alphabetical')
    case 'type':
      return t('sorting.byType')
    default:
      return t('sorting.original')
  }
}

/**
 * 获取排序选项的描述
 * @param sortType - 排序类型
 * @param t - 国际化翻译函数
 * @returns 描述信息
 */
export const getSortDescription = (sortType: SortOption, t?: any): string => {
  if (!t) {
    // 回退到硬编码的中文（向后兼容）
    switch (sortType) {
      case 'none':
        return '保持JSON原有的字段顺序'
      case 'alphabetical':
        return '按字段名称的字母顺序排列'
      case 'type':
        return '按数据类型分组排列（null < boolean < number < string < array < object）'
      default:
        return ''
    }
  }

  switch (sortType) {
    case 'none':
      return t('sorting.descriptions.none')
    case 'alphabetical':
      return t('sorting.descriptions.alphabetical')
    case 'type':
      return t('sorting.descriptions.type')
    default:
      return ''
  }
} 