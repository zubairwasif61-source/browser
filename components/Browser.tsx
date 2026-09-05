'use client'

import { useState } from 'react'
import Toolbar from './Toolbar'
import TabBar from './TabBar'

interface Tab {
  id: string
  url: string
  title: string
  history: string[]
  historyIndex: number
}

export default function Browser() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      url: '',
      title: 'New Tab',
      history: [],
      historyIndex: -1,
    },
  ])
  const [activeTabId, setActiveTabId] = useState('1')

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs((tabs) =>
      tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
    )
  }

  const navigate = (url: string) => {
    if (!activeTab) return

    let finalUrl = url
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1)
    newHistory.push(finalUrl)

    updateTab(activeTabId, {
      url: finalUrl,
      title: finalUrl,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  }

  const goBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return

    const newIndex = activeTab.historyIndex - 1
    updateTab(activeTabId, {
      url: activeTab.history[newIndex],
      historyIndex: newIndex,
    })
  }

  const goForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1)
      return

    const newIndex = activeTab.historyIndex + 1
    updateTab(activeTabId, {
      url: activeTab.history[newIndex],
      historyIndex: newIndex,
    })
  }

  const reload = () => {
    if (!activeTab) return
    // Trigger re-render by updating URL
    updateTab(activeTabId, { url: activeTab.url })
  }

  const addTab = () => {
    const newId = String(Math.max(...tabs.map((t) => parseInt(t.id)), 0) + 1)
    setTabs((tabs) => [
      ...tabs,
      {
        id: newId,
        url: '',
        title: 'New Tab',
        history: [],
        historyIndex: -1,
      },
    ])
    setActiveTabId(newId)
  }

  const closeTab = (id: string) => {
    if (tabs.length === 1) return

    const newTabs = tabs.filter((t) => t.id !== id)
    setTabs(newTabs)

    if (activeTabId === id) {
      setActiveTabId(newTabs[0].id)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Toolbar
        currentUrl={activeTab?.url || ''}
        onNavigate={navigate}
        onBack={goBack}
        onForward={goForward}
        onReload={reload}
        canGoBack={activeTab ? activeTab.historyIndex > 0 : false}
        canGoForward={activeTab ? activeTab.historyIndex < activeTab.history.length - 1 : false}
      />

      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={setActiveTabId}
        onTabClose={closeTab}
        onAddTab={addTab}
      />

      {activeTab && activeTab.url && (
        <div className="flex-1 overflow-hidden border-t border-gray-200">
          <iframe
            key={activeTab.url}
            src={`/api/proxy?url=${encodeURIComponent(activeTab.url)}`}
            className="w-full h-full border-none"
            title={activeTab.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock"
          />
        </div>
      )}

      {(!activeTab || !activeTab.url) && (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Browser</h1>
            <p className="text-gray-600">Enter a URL above to start browsing</p>
          </div>
        </div>
      )}
    </div>
  )
}
