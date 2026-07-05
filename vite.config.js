import {defineConfig} from 'vite';

import packageJson from "./package.json";

const dependencies = new Set(Object.keys({
  ...packageJson.dependencies,
  // ...packageJson.devDependencies,
}));

dependencies.delete('@mermaid-js/mermaid-cli');

console.log('Bundling dependencies', Array.from(dependencies.keys()));

/** @type {import('vite').UserConfig} */
export default defineConfig({
  build: {
    ssr: './src/main.ts',
    outDir: './dist'
  },
  ssr: {
    target: 'node',
    noExternal: Array.from(dependencies.keys())
  }
})