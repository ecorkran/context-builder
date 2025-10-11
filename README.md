# Context Forge

A desktop application for automating the creation of structured context prompts for Claude Code sessions. Built with Electron, React, and TypeScript.

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

The Electron app will launch with hot reload enabled for rapid development.

## 📖 What is Context Forge?

Context Forge eliminates the manual, time-consuming process of building structured context prompts for AI-assisted development sessions. Instead of spending 3-4 minutes manually assembling context for each Claude Code session, developers can generate consistent, well-formatted prompts in seconds.

### Key Features
- **Multi-Project Support**: Manage multiple projects with easy dropdown switching
- **Template-Driven Generation**: Use curated prompts and instruction templates
- **Project Context Management**: Track current work state, slices, tasks, and phases
- **Custom Instructions**: Add project-specific guidance and recent events
- **Copy-Optimized Output**: One-click copy of formatted context prompts
- **Persistent Storage**: Project configurations saved locally for quick access

### Perfect For
- Developers using Claude Code for AI-assisted development
- Teams using structured methodologies (templates, slices, phases)
- Projects following the ai-project-guide workflow
- Anyone working on multiple projects requiring consistent context

## ✨ What's Included
- **Electron 37** with secure architecture (main/preload/renderer)
- **React 19** with TypeScript for the renderer process
- **Vite** for fast development and building via electron-vite
- **Tailwind CSS 4** for styling with custom themes
- **Radix UI** components for accessible interface elements
- **Component Library** - Pre-built UI components from ui-core
- **Router** - React Router with HashRouter for Electron compatibility
- **Build System** - Production packaging with electron-builder

## 🔧 Development

### Scripts
```bash
pnpm dev          # Start development server with Electron app
pnpm build        # Build for production
pnpm package      # Create distributable packages
pnpm typecheck    # TypeScript type checking
pnpm lint         # ESLint code linting
```

### Architecture
```
src/
├── main/              # Electron main process
│   ├── main.ts        # Application entry point
│   ├── ipc/           # IPC handlers for context services
│   └── services/      # Context generation, storage, prompts
├── preload/           # Secure IPC bridge
├── components/        # React UI components
│   ├── forms/         # Project configuration forms
│   ├── layout/        # Layout components (split pane)
│   └── project/       # Project selector and management
├── services/          # Frontend services
│   ├── context/       # Context generation engine
│   └── storage/       # Project data persistence
├── pages/             # React pages/routes
└── lib/               # UI core library and utilities
```

## 🎯 Usage
1. **Create or Select a Project**: Use the project selector dropdown to create new projects or switch between existing ones
2. **Configure Project Details**:
   - Set project name, template, and slice
   - Add task file and custom instructions
   - Configure monorepo settings if applicable
3. **Add Context Information**:
   - Recent events relevant to current work
   - Additional notes and guidance
   - Available tools and MCP servers
4. **Generate Context**: Click "Copy Context" to generate and copy the formatted prompt
5. **Paste into Claude Code**: Use the generated context to start your AI-assisted development session

## 📦 Building & Distribution

### Development Build
```bash
pnpm build
```
Creates optimized bundles in `out/` directory for local development and testing.

### Package for Distribution (In Progress)
```bash
pnpm package
```
**Note:** Full application packaging is not yet complete. The basic electron-builder configuration is in place, but requires:
- Application icons (icon.icns for macOS, icon.png for other platforms)
- Code signing certificates for distribution
- Platform-specific installer configurations

Once complete, this will create:
- **macOS**: DMG file
- **Windows**: NSIS installer
- **Linux**: AppImage (configurable)

## 🔒 Security

- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer
- **Preload Scripts**: Secure IPC communication bridge
- **CSP Headers**: Content Security Policy in production

## 🎨 UI System

### Components
Built on the ui-core component library with custom components for:
- Project configuration forms with validation
- Split-pane layout for input/preview
- Project selector with dropdown
- Theme toggle (light/dark modes)

### Themes
The theme system uses CSS custom properties:
- **Light/Dark**: System preference aware with manual toggle
- **Radix UI**: Accessible, themeable components
- **Tailwind CSS 4**: Modern utility-first styling

## 📚 Project Structure

### Context Generation
The context engine (`ContextTemplateEngine.ts`) generates structured prompts by:
1. Loading system prompts and statement templates
2. Building context sections (project info, work context, instructions)
3. Applying conditional sections (monorepo, naming conventions)
4. Formatting output for Claude Code consumption

### Storage
Project data is persisted locally using Electron's storage APIs:
- JSON-based project storage
- Auto-save functionality
- Backup and recovery support

### IPC Architecture
Secure communication between main and renderer processes:
- Context generation services
- Storage operations
- System prompt management

## 🚀 Roadmap
- [x] Core context generation
- [x] Multi-project support
- [x] Template-based prompts
- [x] Monorepo configuration
- [x] Auto-save functionality
- [ ] Naming convention controls (in progress)
- [ ] Application packaging and distribution
- [ ] Plugin system for extensibility
- [ ] Context templates library
- [ ] Export/import project configurations

## 📄 License
MIT - Build amazing context prompts! 🚀

## 🤝 Contributing
Issues and contributions welcome! This project follows the ai-project-guide methodology with slice-based development.
