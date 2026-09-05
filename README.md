# Browser

A web-based browser built with Next.js and React.

## Features

- Tabbed browsing
- URL navigation via iframe
- Browser history (back/forward)
- Address bar with URL input
- Responsive design
- No desktop dependencies required

## Tech Stack

- **Frontend:** React + TypeScript
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Runtime:** Node.js

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/zubairwasif61-source/browser.git
cd browser

# Install dependencies
npm install

# Run development server
npm run dev
```

Then open http://localhost:3000 in your browser.

### Building

```bash
# Build for production
npm run build

# Run production server
npm run start
```

## Project Structure

```
browser/
├── app/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main browser page
│   └── api/
│       └── proxy/[...path].ts  # URL proxy endpoint
├── components/
│   ├── Browser.tsx        # Browser UI component
│   ├── Toolbar.tsx        # Navigation toolbar
│   └── TabBar.tsx         # Tab management
├── lib/
│   └── utils.ts           # Utility functions
├── package.json           # Dependencies
└── tailwind.config.ts     # Tailwind configuration
```

## How It Works

1. User enters a URL in the address bar
2. Browser makes a request through a proxy endpoint (`/api/proxy`)
3. Proxy fetches the webpage and returns it
4. Content is displayed in an iframe with full browser history support
5. Multiple tabs can be opened independently

## Limitations

- Websites with strict CORS policies may not load
- Some interactive features may be limited due to iframe sandbox
- JavaScript execution depends on iframe permissions

## License

MIT
