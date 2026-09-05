class Browser {
  constructor() {
    this.tabs = [{
      id: '1',
      url: '',
      title: 'New Tab',
      history: [],
      historyIndex: -1
    }];
    this.activeTabId = '1';
    this.corsProxy = 'https://corsproxy.io/?';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    document.getElementById('backBtn').addEventListener('click', () => this.goBack());
    document.getElementById('forwardBtn').addEventListener('click', () => this.goForward());
    document.getElementById('reloadBtn').addEventListener('click', () => this.reload());
    document.getElementById('goBtn').addEventListener('click', () => this.navigate());
    document.getElementById('addressBar').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.navigate();
    });
  }

  getActiveTab() {
    return this.tabs.find(t => t.id === this.activeTabId);
  }

  navigate(url) {
    const tab = this.getActiveTab();
    if (!tab) return;

    if (!url) {
      url = document.getElementById('addressBar').value.trim();
    }

    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newHistory = tab.history.slice(0, tab.historyIndex + 1);
    newHistory.push(url);

    tab.url = url;
    tab.title = url;
    tab.history = newHistory;
    tab.historyIndex = newHistory.length - 1;

    document.getElementById('addressBar').value = url;
    this.render();
  }

  goBack() {
    const tab = this.getActiveTab();
    if (!tab || tab.historyIndex <= 0) return;

    tab.historyIndex--;
    tab.url = tab.history[tab.historyIndex];
    document.getElementById('addressBar').value = tab.url;
    this.render();
  }

  goForward() {
    const tab = this.getActiveTab();
    if (!tab || tab.historyIndex >= tab.history.length - 1) return;

    tab.historyIndex++;
    tab.url = tab.history[tab.historyIndex];
    document.getElementById('addressBar').value = tab.url;
    this.render();
  }

  reload() {
    const tab = this.getActiveTab();
    if (!tab || !tab.url) return;
    // Force re-render by changing URL slightly
    const currentUrl = tab.url;
    tab.url = '';
    this.render();
    setTimeout(() => {
      tab.url = currentUrl;
      this.render();
    }, 100);
  }

  addTab() {
    const newId = String(Math.max(...this.tabs.map(t => parseInt(t.id)), 0) + 1);
    this.tabs.push({
      id: newId,
      url: '',
      title: 'New Tab',
      history: [],
      historyIndex: -1
    });
    this.activeTabId = newId;
    document.getElementById('addressBar').value = '';
    this.render();
  }

  closeTab(id) {
    if (this.tabs.length === 1) return;
    this.tabs = this.tabs.filter(t => t.id !== id);
    if (this.activeTabId === id) {
      this.activeTabId = this.tabs[0].id;
    }
    this.render();
  }

  render() {
    this.renderTabs();
    this.renderContent();
    this.updateButtons();
  }

  renderTabs() {
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = '';

    this.tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab ${tab.id === this.activeTabId ? 'active' : ''}`;
      
      const titleEl = document.createElement('span');
      titleEl.className = 'tab-title';
      titleEl.textContent = tab.title === 'New Tab' ? 'New Tab' : this.getHostname(tab.url) || 'New Tab';
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'tab-close';
      closeBtn.textContent = '×';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.closeTab(tab.id);
      };
      
      tabEl.appendChild(titleEl);
      tabEl.appendChild(closeBtn);
      tabEl.onclick = () => {
        this.activeTabId = tab.id;
        document.getElementById('addressBar').value = tab.url;
        this.render();
      };
      
      tabsContainer.appendChild(tabEl);
    });

    const addTabBtn = document.createElement('button');
    addTabBtn.className = 'new-tab-btn';
    addTabBtn.textContent = '+';
    addTabBtn.onclick = () => this.addTab();
    tabsContainer.appendChild(addTabBtn);
  }

  renderContent() {
    const tab = this.getActiveTab();
    const contentEl = document.getElementById('content');

    if (!tab || !tab.url) {
      contentEl.innerHTML = `
        <div class="empty-state">
          <h1>Browser</h1>
          <p>Enter a URL above to start browsing</p>
          <p class="hint">Examples: google.com, github.com, wikipedia.org</p>
        </div>
      `;
      return;
    }

    const proxyUrl = this.corsProxy + encodeURIComponent(tab.url);
    
    contentEl.innerHTML = `
      <iframe 
        src="${proxyUrl}" 
        title="${tab.title}"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation-by-user-activation"
        onerror="this.parentElement.innerHTML = '<div class=\"error-message\"><h2>Error Loading Page</h2><p>The website could not be loaded. It may have CORS restrictions or be temporarily unavailable.</p></div>'"
      ></iframe>
    `;
  }

  updateButtons() {
    const tab = this.getActiveTab();
    document.getElementById('backBtn').disabled = !tab || tab.historyIndex <= 0;
    document.getElementById('forwardBtn').disabled = !tab || tab.historyIndex >= tab.history.length - 1;
    document.getElementById('reloadBtn').disabled = !tab || !tab.url;
  }

  getHostname(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }
}

// Initialize browser when page loads
document.addEventListener('DOMContentLoaded', () => {
  new Browser();
});
