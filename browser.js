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
    
    // Multiple proxies to try in order
    this.proxies = [
      {
        name: 'allorigins',
        url: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        extract: (data) => data.contents
      },
      {
        name: 'corsanywhere',
        url: (url) => `https://cors-anywhere.herokuapp.com/${url}`,
        extract: (data) => data
      },
      {
        name: 'thingproxy',
        url: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
        extract: (data) => data
      }
    ];
    
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
          <p class="hint">Examples: google.com, github.com, wikipedia.org, reddit.com</p>
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
    // Try each proxy in sequence
    for (let i = 0; i < this.proxies.length; i++) {
      try {
        const proxy = this.proxies[i];
        const proxyUrl = proxy.url(url);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        let html;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          html = proxy.extract(data);
        } else {
          html = await response.text();
        }

        if (!html || html.trim().length === 0) {
          throw new Error('Empty response');
        }

        // Clean and rewrite URLs
        html = this.sanitizeHtml(html);
        html = this.rewriteUrls(html, url);
        
        contentEl.innerHTML = `
          <div class="browser-content">
            ${html}
          </div>
        `;
        
        return; // Success - exit the loop
      } catch (error) {
        // Try next proxy
        if (i === this.proxies.length - 1) {
          // All proxies failed
          contentEl.innerHTML = `
            <div class="error-message">
              <h2>⚠️ Could Not Load Page</h2>
              <p>Unable to load: <strong>${this.getHostname(url)}</strong></p>
              <p style="font-size: 13px; margin-top: 10px; color: #666;">
                Tried 3 proxy services. The website may have strict CORS restrictions 
                or be temporarily unavailable.
              </p>
              <p style="font-size: 12px; margin-top: 5px; color: #999;">
                Error: ${error.message}
              </p>
            </div>
          `;
        }
      }
    }
  }

  sanitizeHtml(html) {
    // Remove dangerous scripts and iframes that could cause issues
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Keep content but remove problematic attributes
    html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    html = html.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
    
    return html;
  }

  rewriteUrls(html, baseUrl) {
    try {
      const base = new URL(baseUrl);
      const baseHost = base.protocol + '//' + base.host;
      
      // Rewrite href attributes
      html = html.replace(/href=["'](?!(?:https?:|mailto:|tel:|#|javascript:|data:))/g, 
        `href="https://api.allorigins.win/get?url=${encodeURIComponent(baseHost)}/`);
      
      // Rewrite src attributes for resources
      html = html.replace(/src=["'](?!(?:https?:|data:))/g, 
        `src="https://api.allorigins.win/get?url=${encodeURIComponent(baseHost)}/`);
      
      // Rewrite protocol-relative URLs
      html = html.replace(/src=["']\/\//g, `src="https://`);
      html = html.replace(/href=["']\/\//g, `href="https://`);
      
    } catch (error) {
      console.log('URL rewrite error:', error);
    }
    
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
