/**
 * 测试运行器 - 全面测试JSON比较和修复功能
 */

import { compareJson, DiffType } from './utils/jsonDiffAdapter'
import { repairJson, analyzeJsonErrors } from './utils/jsonRepairer'
import testCases from './test-cases.json'

interface TestResult {
  name: string
  success: boolean
  message: string
  actualDiffs?: number
  expectedDiffs?: number
  executionTime?: number
  details?: any
}

interface TestSuite {
  suiteName: string
  results: TestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    averageTime: number
  }
}

/**
 * 生成大型JSON对象用于性能测试
 */
const generateLargeJson = (objectSize: number, nestingLevel: number): any => {
  const generateObject = (size: number, level: number): any => {
    const obj: any = {}
    
    for (let i = 0; i < size; i++) {
      const key = `property_${i}`
      
      if (level > 0 && i % 10 === 0) {
        // 每10个属性创建一个嵌套对象
        obj[key] = generateObject(Math.min(5, size), level - 1)
      } else {
        // 创建不同类型的值
        const valueType = i % 6
        switch (valueType) {
          case 0:
            obj[key] = `string_value_${i}`
            break
          case 1:
            obj[key] = Math.floor(Math.random() * 1000)
            break
          case 2:
            obj[key] = Math.random() > 0.5
            break
          case 3:
            obj[key] = null
            break
          case 4:
            obj[key] = [1, 2, 3, i]
            break
          case 5:
            obj[key] = { nested: `value_${i}` }
            break
        }
      }
    }
    
    return obj
  }
  
  return generateObject(objectSize, nestingLevel)
}

/**
 * 生成深层嵌套JSON结构
 */
const generateDeepJson = (maxDepth: number, propertiesPerLevel: number): any => {
  const generateLevel = (depth: number): any => {
    if (depth <= 0) {
      return `leaf_value_${Math.random()}`
    }
    
    const obj: any = {}
    for (let i = 0; i < propertiesPerLevel; i++) {
      obj[`level_${maxDepth - depth}_prop_${i}`] = generateLevel(depth - 1)
    }
    
    return obj
  }
  
  return generateLevel(maxDepth)
}

/**
 * 生成大数组
 */
const generateLargeArray = (arraySize: number, elementType: 'mixed' | 'objects' | 'primitives'): any[] => {
  const array: any[] = []
  
  for (let i = 0; i < arraySize; i++) {
    switch (elementType) {
      case 'mixed':
        const type = i % 5
        switch (type) {
          case 0:
            array.push(`string_${i}`)
            break
          case 1:
            array.push(i)
            break
          case 2:
            array.push(i % 2 === 0)
            break
          case 3:
            array.push({ id: i, value: `item_${i}` })
            break
          case 4:
            array.push([i, i + 1, i + 2])
            break
        }
        break
      case 'objects':
        array.push({
          id: i,
          name: `Object ${i}`,
          value: Math.random(),
          active: i % 2 === 0,
          metadata: { created: new Date().toISOString(), index: i }
        })
        break
      case 'primitives':
        array.push(i % 3 === 0 ? `string_${i}` : i % 3 === 1 ? i : i % 2 === 0)
        break
    }
  }
  
  return array
}

/**
 * 运行JSON比较测试
 */
const runComparisonTests = (): TestSuite[] => {
  const suites: TestSuite[] = []
  const comparisonTests = testCases.jsonComparisonTests
  
  Object.entries(comparisonTests).forEach(([categoryName, tests]) => {
    const results: TestResult[] = []
    let totalTime = 0
    
    tests.forEach(test => {
      const startTime = performance.now()
      
      try {
        const result = compareJson(test.left, test.right)
        const endTime = performance.now()
        const executionTime = endTime - startTime
        totalTime += executionTime
        
        if (!result.success) {
          results.push({
            name: test.name,
            success: false,
            message: result.error || '比较失败',
            executionTime
          })
          return
        }
        
        const actualDiffs = result.diffs.length
        const expectedDiffs = test.expectedDiffs
        
        if (actualDiffs === expectedDiffs) {
          results.push({
            name: test.name,
            success: true,
            message: `✅ 检测到 ${actualDiffs} 个差异，符合预期`,
            actualDiffs,
            expectedDiffs,
            executionTime,
            details: result.diffs.map(d => ({ path: d.path, type: d.type }))
          })
        } else {
          results.push({
            name: test.name,
            success: false,
            message: `❌ 期望 ${expectedDiffs} 个差异，实际检测到 ${actualDiffs} 个`,
            actualDiffs,
            expectedDiffs,
            executionTime,
            details: result.diffs.map(d => ({ path: d.path, type: d.type }))
          })
        }
      } catch (error) {
        const endTime = performance.now()
        const executionTime = endTime - startTime
        totalTime += executionTime
        
        results.push({
          name: test.name,
          success: false,
          message: `异常: ${error instanceof Error ? error.message : '未知错误'}`,
          executionTime
        })
      }
    })
    
    const passed = results.filter(r => r.success).length
    const failed = results.length - passed
    
    suites.push({
      suiteName: `JSON比较 - ${categoryName}`,
      results,
      summary: {
        total: results.length,
        passed,
        failed,
        averageTime: totalTime / results.length
      }
    })
  })
  
  return suites
}

/**
 * 运行JSON修复测试
 */
const runRepairTests = (): TestSuite[] => {
  const suites: TestSuite[] = []
  const repairTests = testCases.jsonRepairTests
  
  Object.entries(repairTests).forEach(([categoryName, tests]) => {
    const results: TestResult[] = []
    let totalTime = 0
    
    tests.forEach(test => {
      const startTime = performance.now()
      
      try {
        const result = repairJson(test.input.replace(/\\n/g, '\n').replace(/\\t/g, '\t'))
        const endTime = performance.now()
        const executionTime = endTime - startTime
        totalTime += executionTime
        
        if (test.shouldSucceed) {
          if (result.success) {
            // 验证修复后的JSON是否有效
            try {
              JSON.parse(result.repairedJson!)
              results.push({
                name: test.name,
                success: true,
                message: `✅ 修复成功: ${result.fixes?.join(', ')}`,
                executionTime,
                details: { engine: result.engine, fixes: result.fixes }
              })
            } catch (parseError) {
              results.push({
                name: test.name,
                success: false,
                message: `❌ 修复后的JSON仍然无效: ${parseError}`,
                executionTime
              })
            }
          } else {
            results.push({
              name: test.name,
              success: false,
              message: `❌ 修复失败: ${result.error}`,
              executionTime
            })
          }
        } else {
          // 测试用例期望失败
          if (!result.success) {
            results.push({
              name: test.name,
              success: true,
              message: `✅ 正确识别为无法修复的JSON`,
              executionTime
            })
          } else {
            results.push({
              name: test.name,
              success: false,
              message: `❌ 应该失败但却成功修复了`,
              executionTime
            })
          }
        }
      } catch (error) {
        const endTime = performance.now()
        const executionTime = endTime - startTime
        totalTime += executionTime
        
        if (test.shouldSucceed) {
          results.push({
            name: test.name,
            success: false,
            message: `异常: ${error instanceof Error ? error.message : '未知错误'}`,
            executionTime
          })
        } else {
          results.push({
            name: test.name,
            success: true,
            message: `✅ 正确抛出异常`,
            executionTime
          })
        }
      }
    })
    
    const passed = results.filter(r => r.success).length
    const failed = results.length - passed
    
    suites.push({
      suiteName: `JSON修复 - ${categoryName}`,
      results,
      summary: {
        total: results.length,
        passed,
        failed,
        averageTime: totalTime / results.length
      }
    })
  })
  
  return suites
}

/**
 * 运行性能测试
 */
const runPerformanceTests = (): TestSuite => {
  const results: TestResult[] = []
  let totalTime = 0
  
  // 大型JSON对象比较性能测试
  const largeObj1 = generateLargeJson(1000, 5)
  const largeObj2 = { ...largeObj1, modified_property: 'changed' }
  
  const startTime1 = performance.now()
  try {
    const result = compareJson(JSON.stringify(largeObj1), JSON.stringify(largeObj2))
    const endTime1 = performance.now()
    const executionTime1 = endTime1 - startTime1
    totalTime += executionTime1
    
    results.push({
      name: '大型JSON对象比较 (1000+ 属性)',
      success: result.success,
      message: result.success ? 
        `✅ 在 ${executionTime1.toFixed(2)}ms 内完成，检测到 ${result.diffs.length} 个差异` :
        `❌ 比较失败: ${result.error}`,
      executionTime: executionTime1,
      details: { engine: result.engine, diffsCount: result.diffs?.length }
    })
  } catch (error) {
    const endTime1 = performance.now()
    const executionTime1 = endTime1 - startTime1
    totalTime += executionTime1
    
    results.push({
      name: '大型JSON对象比较 (1000+ 属性)',
      success: false,
      message: `异常: ${error instanceof Error ? error.message : '未知错误'}`,
      executionTime: executionTime1
    })
  }
  
  // 深层嵌套结构测试
  const deepObj1 = generateDeepJson(15, 3)
  const deepObj2 = JSON.parse(JSON.stringify(deepObj1))
  deepObj2.level_14_prop_1 = 'modified'
  
  const startTime2 = performance.now()
  try {
    const result = compareJson(JSON.stringify(deepObj1), JSON.stringify(deepObj2))
    const endTime2 = performance.now()
    const executionTime2 = endTime2 - startTime2
    totalTime += executionTime2
    
    results.push({
      name: '深层嵌套结构 (15层嵌套)',
      success: result.success,
      message: result.success ? 
        `✅ 在 ${executionTime2.toFixed(2)}ms 内完成，检测到 ${result.diffs.length} 个差异` :
        `❌ 比较失败: ${result.error}`,
      executionTime: executionTime2,
      details: { engine: result.engine, diffsCount: result.diffs?.length }
    })
  } catch (error) {
    const endTime2 = performance.now()
    const executionTime2 = endTime2 - startTime2
    totalTime += executionTime2
    
    results.push({
      name: '深层嵌套结构 (15层嵌套)',
      success: false,
      message: `异常: ${error instanceof Error ? error.message : '未知错误'}`,
      executionTime: executionTime2
    })
  }
  
  // 大数组处理测试
  const largeArray1 = generateLargeArray(5000, 'mixed')
  const largeArray2 = [...largeArray1]
  largeArray2[2500] = 'modified_element'
  
  const startTime3 = performance.now()
  try {
    const result = compareJson(JSON.stringify(largeArray1), JSON.stringify(largeArray2))
    const endTime3 = performance.now()
    const executionTime3 = endTime3 - startTime3
    totalTime += executionTime3
    
    results.push({
      name: '大数组处理 (5000个元素)',
      success: result.success,
      message: result.success ? 
        `✅ 在 ${executionTime3.toFixed(2)}ms 内完成，检测到 ${result.diffs.length} 个差异` :
        `❌ 比较失败: ${result.error}`,
      executionTime: executionTime3,
      details: { engine: result.engine, diffsCount: result.diffs?.length }
    })
  } catch (error) {
    const endTime3 = performance.now()
    const executionTime3 = endTime3 - startTime3
    totalTime += executionTime3
    
    results.push({
      name: '大数组处理 (5000个元素)',
      success: false,
      message: `异常: ${error instanceof Error ? error.message : '未知错误'}`,
      executionTime: executionTime3
    })
  }
  
  const passed = results.filter(r => r.success).length
  const failed = results.length - passed
  
  return {
    suiteName: '性能测试',
    results,
    summary: {
      total: results.length,
      passed,
      failed,
      averageTime: totalTime / results.length
    }
  }
}

/**
 * 生成测试报告
 */
const generateReport = (suites: TestSuite[]): string => {
  let report = `
# JSON比较和修复功能测试报告
测试时间: ${new Date().toLocaleString()}

## 总体概况
`
  
  const totalTests = suites.reduce((sum, suite) => sum + suite.summary.total, 0)
  const totalPassed = suites.reduce((sum, suite) => sum + suite.summary.passed, 0)
  const totalFailed = suites.reduce((sum, suite) => sum + suite.summary.failed, 0)
  const successRate = (totalPassed / totalTests * 100).toFixed(2)
  
  report += `
- 总测试数: ${totalTests}
- 通过数: ${totalPassed}
- 失败数: ${totalFailed}
- 成功率: ${successRate}%

## 详细结果

`
  
  suites.forEach(suite => {
    const suiteSuccessRate = (suite.summary.passed / suite.summary.total * 100).toFixed(2)
    
    report += `
### ${suite.suiteName}
- 通过: ${suite.summary.passed}/${suite.summary.total} (${suiteSuccessRate}%)
- 平均执行时间: ${suite.summary.averageTime.toFixed(2)}ms

`
    
    suite.results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      const time = result.executionTime ? ` (${result.executionTime.toFixed(2)}ms)` : ''
      
      report += `${status} ${result.name}: ${result.message}${time}\n`
      
      if (result.details && !result.success) {
        report += `   详情: ${JSON.stringify(result.details, null, 2)}\n`
      }
    })
    
    report += '\n'
  })
  
  return report
}

/**
 * 运行所有测试
 */
export const runAllTests = (): string => {
  console.log('🚀 开始运行JSON比较和修复功能测试...')
  
  const allSuites: TestSuite[] = []
  
  // 运行比较测试
  console.log('📊 运行JSON比较测试...')
  const comparisonSuites = runComparisonTests()
  allSuites.push(...comparisonSuites)
  
  // 运行修复测试
  console.log('🔧 运行JSON修复测试...')
  const repairSuites = runRepairTests()
  allSuites.push(...repairSuites)
  
  // 运行性能测试
  console.log('⚡ 运行性能测试...')
  const performanceSuite = runPerformanceTests()
  allSuites.push(performanceSuite)
  
  // 生成报告
  const report = generateReport(allSuites)
  console.log('📋 测试完成，生成报告...')
  
  return report
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  const report = runAllTests()
  console.log(report)
}