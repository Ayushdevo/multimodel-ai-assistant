# React + TypeScript + Vite

A modern frontend project setup using React, TypeScript, and Vite for fast development, Hot Module Replacement (HMR), and optimized builds.

## Features

- React for building UI components
- TypeScript for static typing
- Vite for fast bundling and development
- Hot Module Replacement (HMR)
- ESLint for code quality
- Scalable project structure

---

## Available React Plugins

This project supports the official Vite React plugins:

### 1. @vitejs/plugin-react
Uses Oxc for faster compilation and transformation.

Installation:

```bash
npm install @vitejs/plugin-react
```

### 2. @vitejs/plugin-react-swc
Uses SWC for faster Rust-based compilation.

Installation:

```bash
npm install @vitejs/plugin-react-swc
```

---

## Getting Started

### Clone the Repository

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd project-name
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will run locally at:

```bash
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## React Compiler

React Compiler is disabled by default because it may impact development and build performance.

To enable it, follow the official React documentation:

https://react.dev/learn/react-compiler/installation

---

## ESLint Configuration

For production applications, enabling type-aware linting is recommended.

Update your ESLint configuration:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,

      // For stricter rules
      tseslint.configs.strictTypeChecked,

      // Optional stylistic rules
      tseslint.configs.stylisticTypeChecked,
    ],

    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.node.json',
          './tsconfig.app.json'
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

## React-specific ESLint Rules

Install:

```bash
npm install eslint-plugin-react-x eslint-plugin-react-dom
```

Update `eslint.config.js`:

```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],

    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.node.json',
          './tsconfig.app.json'
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

## Project Structure

```text
project/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── README.md
```

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Create production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## Tech Stack

- React
- TypeScript
- Vite
- ESLint

---

## License

This project is licensed under the MIT License.
