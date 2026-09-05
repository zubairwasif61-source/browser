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
    
    this.searchEngines = {
      google: {
        name: 'Google',
        url: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`
      },
      duckduckgo: {
        name: 'DuckDuckGo',
        url: (query) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
      },
      bing: {
        name: 'Bing',
        url: (query) => `https://www.bing.com/search?q=${encodeURIComponent(query)}`
      },
      wikipedia: {
        name: 'Wikipedia',
        url: (query) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`
      },
      youtube: {
        name: 'YouTube',
        url: (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      },
      github: {
        name: 'GitHub',
        url: (query) => `https://github.com/search?q=${encodeURIComponent(query)}`
      },
      reddit: {
        name: 'Reddit',
        url: (query) => `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`
      }
    };
    
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
    document.getElementById('goBtn').addEventListener('click', () => this.handleSearch());
    document.getElementById('addressBar').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });
  }

  handleSearch() {
    const input = document.getElementById('addressBar').value.trim();
    
    if (!input) return;
    
    // Check if it's a URL or a search query
    if (this.isUrl(input)) {
      // It's a URL
      this.navigate(input);
    } else {
      // It's a search query
      const selectedEngine = document.getElementById('searchEngine').value;
      const engine = this.searchEngines[selectedEngine];
      const searchUrl = engine.url(input);
      this.navigate(searchUrl);
    }
  }

  isUrl(str) {
    try {
      new URL(str);
      return true;
    } catch (e) {
      // Check if it looks like a domain
      return str.includes('.') && !str.includes(' ');
    }
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
          <p>Search or enter a URL to get started</p>
          <p class="hint">Examples: "javascript", "github", "https://google.com"</p>
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

    this.loadPage(tab.url, contentEl);
  }

  async loadPage(url, contentEl) {
    try {
      // Encode the URL for the proxy
      const encodedUrl = encodeURIComponent(url);
      
      // Use Cloudflare's excellent free proxy service that works with almost all sites
      const proxyUrl = `https://api.allorigins.win/get?url=${encodedUrl}&nocache=${Date.now()}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('No content received');
      }

      let html = data.contents;
      
      // Process the HTML
      html = this.enhanceHtml(html, url);
      
      contentEl.innerHTML = `
        <div class="browser-content">
          ${html}
        </div>
      `;
    } catch (error) {
      contentEl.innerHTML = `
        <div class="error-message">
          <h2>⚠️ Error Loading Page</h2>
          <p>${this.getHostname(url)}</p>
          <p style="font-size: 12px; margin-top: 10px; color: #666;">${error.message}</p>
          <p style="font-size: 11px; margin-top: 5px; color: #999;">Try a different website or check your connection</p>
        </div>
      `;
    }
  }

  enhanceHtml(html, baseUrl) {
    try {
      const base = new URL(baseUrl);
      
      // Create a temporary container to parse HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;
      
      // Fix all links
      temp.querySelectorAll('a').forEach(el => {
        const href = el.getAttribute('href');
        if (href && !href.startsWith('javascript:') && !href.startsWith('data:')) {
          try {
            const absoluteUrl = new URL(href, baseUrl).href;
            el.onclick = (e) => {
              e.preventDefault();
              this.navigateToUrl(absoluteUrl);
            };
            el.style.cursor = 'pointer';
          } catch (e) {
            // Ignore invalid URLs
          }
        }
      });
      
      // Fix all images
      temp.querySelectorAll('img').forEach(el => {
        const src = el.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          try {
            const absoluteUrl = new URL(src, baseUrl).href;
            el.src = `https://api.allorigins.win/get?url=${encodeURIComponent(absoluteUrl)}&nocache=${Date.now()}`;
          } catch (e) {
            // Keep original
          }
        }
      });
      
      // Fix background images
      temp.querySelectorAll('[style*="background"]').forEach(el => {
        const style = el.getAttribute('style');
        if (style) {
          const updated = style.replace(/url\(['"]?(?!(?:data:|https?:))([^)'"]+)['"]?\)/g, 
            (match, url) => {
              try {
                const absoluteUrl = new URL(url, baseUrl).href;
                return `url('https://api.allorigins.win/get?url=${encodeURIComponent(absoluteUrl)}')`;
              } catch (e) {
                return match;
              }
            });
          el.setAttribute('style', updated);
        }
      });
      
      // Remove problematic scripts and styles
      temp.querySelectorAll('script, style, noscript, iframe, embed, object').forEach(el => {
        el.remove();
      });
      
      // Remove event handlers
      temp.querySelectorAll('*').forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
        });
      });
      
      return temp.innerHTML;
    } catch (error) {
      console.log('HTML enhancement error:', error);
      return html;
    }
  }

  navigateToUrl(url) {
    const tab = this.getActiveTab();
    if (tab) {
      this.navigate(url);
    }
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
