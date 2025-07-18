# Struktur - Visual Directory Structure Generator

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

![Struktur](https://raw.githubusercontent.com/LMLK-seal/Struktur/refs/heads/main/logo.jpg)

A modern web application that provides an intuitive visual interface for creating, managing, and exporting directory structures directly in your browser. Build complex project hierarchies with ease and export them as downloadable ZIP archives.

## Overview

Struktur empowers developers and project managers to visualize and construct directory structures through an interactive tree interface. Whether you're planning a new project architecture or documenting existing structures, Struktur provides the tools to create, modify, and export your directory layouts efficiently. [Live DEMO](https://genuine-conkies-7e045a.netlify.app/). (The live version includes a feature to generate a directory structure from a text).

## Key Features

### Core Functionality
- **Interactive Tree View**: Navigate through your project structure with an intuitive, collapsible tree interface
- **Real-time Editing**: Add, rename, and delete files and folders with immediate visual feedback
- **Batch Operations**: Expand or collapse entire directory trees with single-click controls
- **Context-aware Actions**: Right-click context menus provide quick access to relevant operations

### Project Management
- **Project Persistence**: Save your directory structures as JSON files for future editing
- **Project Loading**: Import previously saved structures to continue development
- **ZIP Export**: Generate downloadable ZIP archives containing your complete directory structure
- **Structure Validation**: Maintain consistency and prevent invalid directory configurations

### User Experience
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark Theme**: Professional dark mode interface reduces eye strain
- **Keyboard Shortcuts**: Efficient navigation and editing with keyboard support
- **Accessibility**: WCAG-compliant interface for users with disabilities

## Technical Specifications

### Architecture
- **Frontend Framework**: React 18+ with TypeScript for type safety
- **Build System**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first responsive design
- **State Management**: React Hooks (useState, useEffect, useCallback, useRef)

### Dependencies
- **File Processing**: JSZip for archive generation
- **Tree Operations**: Custom recursive algorithms for directory manipulation
- **Performance**: Optimized rendering with React.memo and useMemo hooks

## Installation

### Prerequisites
- Node.js 16.x or higher
- npm 7.x or higher (or yarn/pnpm equivalent)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/LMLK-Seal/struktur.git
   cd struktur
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Getting Started
1. **Initialize Project**: Click "Create Root Folder" to start a new structure or "Load Project" to import an existing one
2. **Navigate Structure**: Use the tree view to explore your directory hierarchy

### Managing Directories and Files
- **Add Items**: Right-click on folders to add new files or subdirectories
- **Rename Items**: Use the context menu or press F2 to rename selected items
- **Delete Items**: Right-click and select delete (confirmation required for safety)
- **Organize Structure**: Drag and drop items to reorganize your hierarchy

### Project Operations
- **Save Project**: Export your current structure as a JSON file for future editing
- **Load Project**: Import previously saved project files to continue development
- **Export ZIP**: Generate a downloadable ZIP archive containing your complete structure

### Advanced Features
- **Bulk Operations**: Use "Expand All" and "Collapse All" for large structures
- **Keyboard Navigation**: Arrow keys, Enter, and F2 provide efficient navigation
- **Search Functionality**: Quickly locate specific files or folders in large structures

## Development

### Project Structure
```
struktur/
├── src/
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── styles/           # Global styles
├── public/               # Static assets
└── dist/                 # Production build
```

### Build Commands
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run preview      # Preview production build
npm run lint         # Run code linting
npm run type-check   # Validate TypeScript types
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Contributing

We welcome contributions to Struktur! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow coding standards** - ESLint and Prettier configurations are provided
3. **Write tests** for new functionality
4. **Update documentation** for any API changes
5. **Submit a pull request** with a clear description of changes

### Development Guidelines
- Follow TypeScript best practices
- Maintain component modularity
- Ensure responsive design compatibility
- Write comprehensive tests for new features

## Browser Support

Struktur supports all modern browsers:
- Chrome 88+
- Firefox 84+
- Safari 14+
- Edge 88+

## Security

- All file operations are performed client-side
- No data is transmitted to external servers
- ZIP generation uses secure, validated inputs
- XSS protection through React's built-in sanitization

## Performance

- Optimized for large directory structures (10,000+ files)
- Lazy loading for improved initial load times
- Efficient re-rendering with React optimization techniques
- Memory-efficient tree operations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, bug reports, or feature requests:
- **Issues**: [GitHub Issues](https://github.com/your-username/struktur/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/struktur/discussions)
- **Documentation**: [Project Wiki](https://github.com/your-username/struktur/wiki)

---

**Struktur** - Visualize. Structure. Export.

*Built with ❤️ by the development community*
