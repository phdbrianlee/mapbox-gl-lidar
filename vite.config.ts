import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import replace from '@rollup/plugin-replace';

const PATH_SHIM = `({
  dirname: (p) => { const i = p.lastIndexOf('/'); return i <= 0 ? (i === 0 ? '/' : '.') : p.substring(0, i); },
  normalize: (p) => p,
  join: (...a) => a.filter(Boolean).join('/').replace(/\\/+/g, '/')
})`;

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      outDir: 'dist/types',
      rollupTypes: false,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'laz-perf': resolve(__dirname, 'node_modules/laz-perf/lib/web/index.js'),
    },
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        react: resolve(__dirname, 'src/react.ts'),
      },
      name: 'MapboxLidar',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'mjs' : 'cjs';
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      plugins: [
        replace({
          preventAssignment: true,
          delimiters: ['', ''],
          values: {
            'require("fs")': '{}',
            "require('fs')": '{}',
            'require("path")': PATH_SHIM,
            "require('path')": PATH_SHIM,
          },
        }),
      ],
      external: [
        'react',
        'react-dom',
        'mapbox-gl',
        '@deck.gl/core',
        '@deck.gl/layers',
        '@deck.gl/mapbox',
        '@deck.gl/extensions',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'mapbox-gl': 'mapboxgl',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'mapbox-gl-lidar.css';
          return assetInfo.name || '';
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: false,
  },
});
