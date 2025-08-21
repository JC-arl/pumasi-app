# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite dev server with hot reload
- **Build**: `npm run build` - TypeScript compilation followed by Vite production build
- **Lint**: `npm run lint` - Run ESLint on all TypeScript/TSX files
- **Preview**: `npm run preview` - Preview production build locally

## Architecture

This is a React TypeScript application using Vite as the build tool and bundler. The project follows a modern frontend stack:

**Core Technologies:**
- React 19 with TypeScript
- Vite for development and building
- Tailwind CSS v4 for styling
- ESLint with TypeScript integration

**Project Structure:**
- `src/App.tsx` - Main application component with counter and card examples
- `src/main.tsx` - Application entry point
- `src/` - Contains all source code including components and assets
- `public/` - Static assets served by Vite

**Configuration Files:**
- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - Root TypeScript config using project references
- `tsconfig.app.json` - App-specific TypeScript configuration
- `tsconfig.node.json` - Node.js/Vite tooling TypeScript configuration
- `eslint.config.js` - ESLint configuration using flat config format
- `tailwind.config.js` - Tailwind CSS configuration

**Key Features:**
- Strict TypeScript configuration with unused variable/parameter detection
- ESLint with React Hooks and React Refresh plugins
- Tailwind CSS with dark mode support
- Modern ES2022+ target compilation

The application includes a simple counter component and card grid layout demonstrating Tailwind CSS styling patterns and React state management.