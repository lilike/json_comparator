export default function ColorLegend() {
  const legendItems = [
    {
      color: 'bg-green-500',
      label: '右侧字段',
      description: '仅在右侧JSON中存在的字段'
    },
    {
      color: 'bg-red-500',
      label: '左侧字段',
      description: '仅在左侧JSON中存在的字段'
    },
    {
      color: 'bg-yellow-500',
      label: '不同字段',
      description: '字段存在但值或类型不同'
    }
  ]

  return (
    <div className="flex items-center gap-6">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1 group relative">
          <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm`}></div>
          <div className="text-white text-xs">{item.label}</div>
          {/* 悬浮提示 */}
          <div className="absolute top-full mt-1 left-0 -translate-x-[400px] bg-black/90 text-white text-xs rounded px-2 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {item.description}
          </div>
        </div>
      ))}
    </div>
  )
} 