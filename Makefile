.PHONY: install dev build start clean help

help:
	@echo "Browser Web Development Commands"
	@echo "==================================="
	@echo "  make install - Install dependencies"
	@echo "  make dev     - Start development server (http://localhost:3000)"
	@echo "  make build   - Build for production"
	@echo "  make start   - Run production server"
	@echo "  make clean   - Remove node_modules and build files"

install:
	@echo "📦 Installing dependencies..."
	npm install

dev: install
	@echo "🚀 Starting development server..."
	npm run dev

build: install
	@echo "🔨 Building for production..."
	npm run build

start: build
	@echo "▶️  Starting production server..."
	npm run start

clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules .next
	@echo "✅ Clean complete"
