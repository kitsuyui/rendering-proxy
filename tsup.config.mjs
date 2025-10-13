import { defineConfig } from 'tsup'

export default defineConfig({
  target: 'es2020',
  format: ['cjs', 'esm'],
  entry: ['./src/**/*.ts', '!./src/**/*.spec.ts'],
  splitting: true,
  treeshake: true,
  sourcemap: true,
  minify: true,
  dts: true,
})
