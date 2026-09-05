'use client'

import { useState, useEffect } from 'react'

interface Tab {
  id: string
  url: string
  title: string
  history: string[]
  historyIndex: number
}

interface BrowserProps {}

export default function Browser({}: BrowserProps) {
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
  const [addressBar, setAddressBar] = useState('')

  const activeTab = tabs.find((t) => t.id === activeTabId)!

  useEffect(() => {
    setAddressBar(activeTab?.url || '')
  }, [activeTabId, activeTab])

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs((tabs) =>
      tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
    )
  }

  const navigate = (urlInput: string) => {
    let url = urlInput.trim()
    if (!url) return

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1)
    newHistory.push(url)

    updateTab(activeTabId, {
      url,
      title: url,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })

    setAddressBar(url)
  }

  const goBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return

    const newIndex = activeTab.historyIndex - 1
    const url = activeTab.history[newIndex]

    updateTab(activeTabId, {
      url,
      historyIndex: newIndex,
    })

    setAddressBar(url)
  }

  const goForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1)
      return

    const newIndex = activeTab.historyIndex + 1
    const url = activeTab.history[newIndex]

    updateTab(activeTabId, {
      url,
      historyIndex: newIndex,
    })

    setAddressBar(url)
  }

  const reload = () => {
    if (!activeTab?.url) return
    // Force iframe reload by changing key
    updateTab(activeTabId, { url: activeTab.url + (Math.random() * 1000) })
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

  const handleAddressBarKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(addressBar)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center gap-2">
        <button
          onClick={goBack}
          disabled={!activeTab || activeTab.historyIndex <= 0}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          title="Back"
        >
          ←
        </button>

        <button
          onClick={goForward}
          disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          title="Forward"
        >
          →
        </button>

        <button
          onClick={reload}
          disabled={!activeTab?.url}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          title="Reload"
        >
          ⟳
        </button>

        <input
          type="text"
          value={addressBar}
          onChange={(e) => setAddressBar(e.target.value)}
          onKeyPress={handleAddressBarKey}
          placeholder="Enter URL or search..."
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />

        <button
          onClick={() => navigate(addressBar)}
          className="px-6 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Go
        </button>
      </div>

      {/* Tab Bar */}
      <div className="bg-gray-100 border-b border-gray-300 flex items-center gap-1 px-2 py-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t border cursor-pointer whitespace-nowrap max-w-xs transition-colors ${
              activeTabId === tab.id
                ? 'bg-white border-gray-300 border-b-white'
                : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
            }`}
          >
            <span className="text-sm font-medium truncate">
              {tab.title === 'New Tab' ? 'New Tab' : new URL(tab.url || 'about:blank').hostname || tab.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              className="text-gray-600 hover:text-gray-900 font-bold text-sm ml-1"
              title="Close tab"
            >
              ×
            </button>
          </div>
        ))}

        <button
          onClick={addTab}
          className="ml-auto px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold transition-colors"
          title="New tab"
        >
          +
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-gray-50 border-t border-gray-200">
        {activeTab?.url ? (
          <iframe
            key={`${activeTab.id}-${activeTab.url}`}
            src={`/api/proxy?url=${encodeURIComponent(activeTab.url)}`}
            className="w-full h-full border-none"
            title={activeTab.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Browser Proxy</h1>
              <p className="text-gray-600 text-lg">Enter a URL above to start browsing</p>
              <p className="text-gray-500 text-sm mt-4">Examples: google.com, github.com, wikipedia.org</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
