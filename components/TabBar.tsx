'use client'

interface Tab {
  id: string
  url: string
  title: string
  history: string[]
  historyIndex: number
}

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onTabClick: (id: string) => void
  onTabClose: (id: string) => void
  onAddTab: () => void
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onAddTab,
}: TabBarProps) {
  return (
    <div className="bg-gray-100 border-b border-gray-300 flex items-center gap-1 px-2 py-2 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-t border-b-2 cursor-pointer whitespace-nowrap ${
            activeTabId === tab.id
              ? 'bg-white border-blue-500'
              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
          }`}
        >
          <span className="text-sm font-medium max-w-xs truncate">
            {tab.title || 'New Tab'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTabClose(tab.id)
            }}
            className="text-gray-500 hover:text-gray-700 font-bold"
            title="Close tab"
          >
            ×
          </button>
        </div>
      ))}

      <button
        onClick={onAddTab}
        className="ml-auto px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold"
        title="New tab"
      >
        +
      </button>
    </div>
  )
}
