export default function ColorLegend() {
  const legendItems = [
    {
      color: 'bg-green-500',
      label: '新增字段',
      description: '仅在右侧JSON中存在的字段'
    },
    {
      color: 'bg-red-500',
      label: '删除字段',
      description: '仅在左侧JSON中存在的字段'
    },
    {
      color: 'bg-yellow-500',
      label: '不同字段',
      description: '字段存在但值或类型不同'
    }
  ]

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">差异标记说明</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 group">
            <div className={`w-4 h-4 rounded-full ${item.color} shadow-lg`}></div>
            <div>
              <div className="text-white font-medium">{item.label}</div>
              <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-400 text-center">
        💡 提示：将鼠标悬停在标记上可查看详细差异信息
      </div>
    </div>
  )
} 