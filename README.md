# Browser

A lightweight, cross-platform browser built with Tauri and Rust.

## Features

- Lightweight desktop application
- Cross-platform (Windows, macOS, Linux)
- Modern web rendering with WebView
- Tabbed browsing
- URL navigation
- History tracking

## Tech Stack

- **Backend:** Rust
- **Frontend:** Vue.js / React
- **Runtime:** Tauri
- **Build Tool:** Vite

## Getting Started

### Prerequisites

- Rust 1.70+
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
npm run tauri dev
```

### Building

```bash
# Build for production
npm run tauri build
```

The executable will be in `src-tauri/target/release/`.

## Project Structure

```
browser/
├── src/                    # Frontend source (Vue/React)
│   ├── components/         # UI components
│   ├── pages/              # Page layouts
│   └── App.vue/App.tsx     # Root component
├── src-tauri/              # Rust backend
│   ├── src/
│   │   └── main.rs         # Application entry point
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── package.json            # Node.js dependencies
└── vite.config.ts          # Vite configuration
```

## License

MIT
