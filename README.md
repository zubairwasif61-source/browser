# Browser Proxy

A web-based proxy service that lets you browse any website through an iframe. Run it locally and access it in your browser to browse the web through the proxy.

## Features

- 🌐 Browse any website through a web proxy
- 📑 Tabbed browsing with independent history
- ⬅️ Back/Forward navigation
- 🔄 Reload functionality
- 📍 Address bar with URL input
- 🎨 Clean, minimal UI
- ⚡ Fast and lightweight

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Node.js
- **Proxy:** Custom URL proxy with CORS handling

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open **http://localhost:3000** in Chrome and start browsing!

### Production Build

```bash
npm run build
npm run start
```

## How It Works

1. You enter a URL in the address bar (e.g., `google.com`)
2. The proxy fetches the webpage from that URL
3. The page is displayed in an iframe with URL rewriting
4. Links and forms are proxied through the same endpoint
5. You can navigate, reload, and manage tabs normally

## Architecture

```
Chrome Browser
    ↓
    └→ http://localhost:3000 (Next.js App)
         ↓
         ├→ Frontend: Tab UI, Address Bar, Navigation
         │
         └→ Backend: /api/proxy endpoint
              ↓
              └→ Fetches & rewrites URLs from any website
                   ↓
                   └→ Returns to iframe
```

## Limitations

- Websites with strict CORS policies may have issues
- Some JavaScript may not work due to iframe sandbox restrictions
- Cookies and local storage are sandboxed
- SSL certificates may cause warnings

## License

MIT
