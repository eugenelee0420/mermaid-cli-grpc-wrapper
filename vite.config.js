import {defineConfig} from 'vite';

import packageJson from "./package.json";

const dependencies = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
});

/** @type {import('vite').UserConfig} */
export default defineConfig({

})