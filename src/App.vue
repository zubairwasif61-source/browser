<template>
  <div id="app" class="browser">
    <div class="toolbar">
      <button @click="goBack" :disabled="!canGoBack">← Back</button>
      <button @click="goForward" :disabled="!canGoForward">Forward →</button>
      <button @click="reload">⟳ Reload</button>
      <input
        v-model="addressBar"
        @keyup.enter="navigate"
        class="address-bar"
        placeholder="Enter URL..."
      />
      <button @click="navigate">Go</button>
    </div>
    <div class="tabs">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab', { active: currentTabIndex === index }]"
        @click="currentTabIndex = index"
      >
        {{ tab.title || 'New Tab' }}
        <button @click.stop="closeTab(index)" class="close-btn">×</button>
      </div>
      <button @click="addTab" class="new-tab-btn">+</button>
    </div>
    <webview
      v-if="tabs.length > 0"
      :src="tabs[currentTabIndex]?.url || 'about:blank'"
      class="webview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  url: string
  title: string
  history: string[]
  historyIndex: number
}

const tabs = ref<Tab[]>([
  {
    url: 'https://www.google.com',
    title: 'Google',
    history: ['https://www.google.com'],
    historyIndex: 0,
  },
])

const currentTabIndex = ref(0)
const addressBar = ref('https://www.google.com')

const currentTab = () => tabs.value[currentTabIndex.value]
const canGoBack = () => currentTab().historyIndex > 0
const canGoForward = () => currentTab().historyIndex < currentTab().history.length - 1

const navigate = () => {
  let url = addressBar.value
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  const tab = currentTab()
  tab.url = url
  tab.title = url
  tab.history = tab.history.slice(0, tab.historyIndex + 1)
  tab.history.push(url)
  tab.historyIndex = tab.history.length - 1
}

const goBack = () => {
  const tab = currentTab()
  if (canGoBack()) {
    tab.historyIndex--
    tab.url = tab.history[tab.historyIndex]
    addressBar.value = tab.url
  }
}

const goForward = () => {
  const tab = currentTab()
  if (canGoForward()) {
    tab.historyIndex++
    tab.url = tab.history[tab.historyIndex]
    addressBar.value = tab.url
  }
}

const reload = () => {
  const tab = currentTab()
  tab.url = tab.url // Trigger re-render
}

const addTab = () => {
  tabs.value.push({
    url: 'about:blank',
    title: 'New Tab',
    history: ['about:blank'],
    historyIndex: 0,
  })
  currentTabIndex.value = tabs.value.length - 1
}

const closeTab = (index: number) => {
  tabs.value.splice(index, 1)
  if (currentTabIndex.value >= tabs.value.length) {
    currentTabIndex.value = Math.max(0, tabs.value.length - 1)
  }
}
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  align-items: center;
}

button {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover:not(:disabled) {
  background: #e8e8e8;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.address-bar {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  overflow-x: auto;
}

.tab {
  padding: 8px 12px;
  background: #ddd;
  border: 1px solid #ccc;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab.active {
  background: #fff;
  border-bottom-color: #fff;
}

.close-btn {
  padding: 0 4px;
  min-width: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.new-tab-btn {
  padding: 4px 12px;
}

.webview {
  flex: 1;
  border: none;
}
</style>
