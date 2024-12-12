import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  output: 'static', // Configura saída como estática (necessário para GitHub Pages)
  base: '/', // URL base (para domínios personalizados ou raiz de repositório)
  build: {
    outDir: 'dist', // Define o diretório de saída
    async afterBuild() {
      try {
        // Certifique-se de que o diretório 'dist' existe antes de criar o arquivo CNAME
        const distDir = 'dist';
        if (!existsSync(distDir)) {
          mkdirSync(distDir);
        }

        // Gera o arquivo CNAME no diretório de saída
        const cnamePath = `${distDir}/CNAME`;
        writeFileSync(cnamePath, 'www.lytspot.com.br', 'utf8');
        console.log(`CNAME file created successfully at ${cnamePath}`);
      } catch (error) {
        console.error('Error creating CNAME file:', error);
      }
    },
  },
  server: {
    host: true, // Permite que o servidor local seja acessível na rede
    port: 4321, // Define a porta (ajuste se necessário)
  },
  integrations: [
    tailwind({ config: './tailwind.config.js' }), // Certifique-se de que o Tailwind está configurado corretamente
    react(), // Integração com React
  ],
});
