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
    this.render();
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

    contentEl.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span>Loading ${this.getHostname(tab.url)}...</span>
      </div>
    `;

    this.fetchAndRenderPage(tab.url, contentEl);
  }

  async fetchAndRenderPage(url, contentEl) {
    try {
      const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.contents) {
        // Rewrite URLs in the HTML to use proxy
        let html = data.contents;
        html = this.rewriteUrls(html, url);
        
        contentEl.innerHTML = `
          <div class="browser-content">
            ${html}
          </div>
        `;
      } else {
        throw new Error('No content returned');
      }
    } catch (error) {
      contentEl.innerHTML = `
        <div class="error-message">
          <h2>⚠️ Error Loading Page</h2>
          <p>Could not load: ${this.getHostname(url)}</p>
          <p style="font-size: 12px; margin-top: 10px; color: #666;">${error.message}</p>
        </div>
      `;
    }
  }

  rewriteUrls(html, baseUrl) {
    // Create a base URL object for relative URL resolution
    const base = new URL(baseUrl);
    
    // Simple regex replacements for common URL patterns
    // This is a basic implementation - a full solution would use DOM parsing
    html = html.replace(/href=["'](?!(?:https?:|mailto:|#))/g, `href="${base.protocol}//${base.host}/`);
    html = html.replace(/src=["'](?!(?:https?:|data:))/g, `src="${base.protocol}//${base.host}/`);
    
    return html;
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
      return url;
    }
  }
}

// Initialize browser when page loads
document.addEventListener('DOMContentLoaded', () => {
  new Browser();
});
