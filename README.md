# Browser

A static web-based browser that runs entirely on GitHub Pages. No server needed—browse websites directly from GitHub!

## Features

- 🌐 Browse any website through a web proxy
- 📑 Tabbed browsing with independent history
- ⬅️ Back/Forward navigation
- 🔄 Reload functionality
- 📝 Address bar with URL input
- 🎨 Clean, minimal UI
- ⚡ Fast and lightweight
- 📦 Runs on GitHub Pages (no server!)

## Quick Start

### Visit Online
Open in your browser: **https://zubairwasif61-source.github.io/browser**

Then enter any URL and start browsing!

### Run Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:3000

## How It Works

1. Enter a URL in the address bar (e.g., `google.com`)
2. Service Worker intercepts the request
3. CORS proxy fetches the webpage
4. All links are rewritten to stay within the proxy
5. Browse normally with tabs and history

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Service Worker:** For request interception
- **CORS Proxy:** Using public CORS proxy services
- **Hosting:** GitHub Pages (static)

## Limitations

- Some websites with strict CORS policies may not load completely
- JavaScript execution depends on sandbox rules
- Cookies are sandboxed by browser security
- Some interactive features may be limited

## License

MIT
