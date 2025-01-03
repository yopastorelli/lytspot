import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  output: 'static', // Configures static output (necessary for GitHub Pages)
  base: '/', // Base URL for custom domains or repo root
  build: {
    outDir: 'dist', // Defines the output directory
    async afterBuild() {
      try {
        // Ensure 'dist' directory exists before creating the CNAME file
        const distDir = 'dist';
        if (!existsSync(distDir)) {
          mkdirSync(distDir);
        }

        // Generate CNAME file in the output directory
        const cnamePath = `${distDir}/CNAME`;
        writeFileSync(cnamePath, 'www.lytspot.com.br', 'utf8');
        console.log(`CNAME file created successfully at ${cnamePath}`);
      } catch (error) {
        console.error('Error creating CNAME file:', error);
      }
    },
  },
  server: {
    host: true, // Allows local server to be accessible on the network
    port: 4321, // Sets the port (adjust if necessary)
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname, // Matches @/* to ./src/*
      },
    },
  },
  integrations: [
    tailwind({ config: './tailwind.config.js' }), // Ensure Tailwind is configured correctly
    react(), // React integration
  ],
});
