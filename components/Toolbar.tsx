'use client'

import { useState } from 'react'

interface ToolbarProps {
  currentUrl: string
  onNavigate: (url: string) => void
  onBack: () => void
  onForward: () => void
  onReload: () => void
  canGoBack: boolean
  canGoForward: boolean
}

export default function Toolbar({
  currentUrl,
  onNavigate,
  onBack,
  onForward,
  onReload,
  canGoBack,
  canGoForward,
}: ToolbarProps) {
  const [addressBar, setAddressBar] = useState(currentUrl)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onNavigate(addressBar)
    }
  }

  const handleNavigate = () => {
    onNavigate(addressBar)
  }

  return (
    <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center gap-2">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Back"
      >
        ←
      </button>

      <button
        onClick={onForward}
        disabled={!canGoForward}
        className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Forward"
      >
        →
      </button>

      <button
        onClick={onReload}
        className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
        title="Reload"
      >
        ↻
      </button>

      <input
        type="text"
        value={addressBar}
        onChange={(e) => setAddressBar(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter URL..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleNavigate}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Go
      </button>
    </div>
  )
}
