import { useTranslations } from 'next-intl'

export default function ColorLegend() {
  const t = useTranslations('legend')
  
  const legendItems = [
    {
      color: 'bg-green-500',
      label: t('added'),
      description: t('added_desc')
    },
    {
      color: 'bg-red-500',
      label: t('removed'),
      description: t('removed_desc')
    },
    {
      color: 'bg-yellow-500',
      label: t('modified'),
      description: t('modified_desc')
    }
  ]

  return (
    <div className="flex items-center gap-6">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1 group relative">
          <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm`}></div>
          <div className="text-white text-xs">{item.label}</div>
          {/* 悬浮提示 */}
          <div className="absolute top-full mt-1 left-0 -translate-x-[100px] bg-black/90 text-white text-xs rounded px-2 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {item.description}
          </div>
        </div>
      ))}
    </div>
  )
} 