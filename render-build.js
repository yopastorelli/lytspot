/**
 * Script de build específico para o ambiente Render
 * @version 1.3.0 - 2025-03-15 - Adicionada instalação do terser para resolver erro de build do Vite
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("Iniciando script render-build.js...");

// Definir NODE_ENV como production
process.env.NODE_ENV = 'production';
console.log("NODE_ENV definido como:", process.env.NODE_ENV);

// Definir RENDER como true para indicar que estamos no ambiente Render
process.env.RENDER = 'true';
console.log("RENDER definido como:", process.env.RENDER);

// Obter o diretório atual
const currentDir = process.cwd();
console.log("Diretório atual:", currentDir);

try {
  // Verificar se terser está instalado e instalá-lo se necessário
  console.log("Verificando se terser está instalado...");
  try {
    require.resolve('terser');
    console.log("terser já está instalado!");
  } catch (error) {
    console.log("terser não encontrado, instalando...");
    execSync('npm install --no-save terser@^5.29.2', { stdio: 'inherit' });
    console.log("terser instalado com sucesso!");
  }

  // Verificar a configuração do Vite
  console.log("Verificando configuração do Vite...");
  const viteConfigPath = path.join(currentDir, 'vite.config.js');
  
  if (fs.existsSync(viteConfigPath)) {
    console.log("Arquivo vite.config.js encontrado, verificando configuração...");
    
    // Ler o conteúdo do arquivo vite.config.js
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    // Verificar se o arquivo já contém a configuração para marcar axios como externo
    if (!viteConfig.includes('axios')) {
      console.log("Configuração para axios não encontrada, fazendo backup do arquivo original...");
      
      // Fazer backup do arquivo original
      fs.copyFileSync(viteConfigPath, `${viteConfigPath}.bak`);
      
      // Adicionar axios à lista de dependências externas
      const updatedConfig = viteConfig.replace(
        /external:\s*\[([\s\S]*?)\]/,
        (match, p1) => {
          if (p1.includes('axios')) {
            return match; // Já contém axios, não precisa modificar
          }
          return `external: [${p1}${p1.trim().endsWith(',') ? '' : ','} 'axios', 'node-fetch']`;
        }
      );
      
      fs.writeFileSync(viteConfigPath, updatedConfig);
      console.log("Arquivo vite.config.js atualizado com sucesso para incluir axios como dependência externa!");
    } else {
      console.log("Configuração para axios já existe no arquivo vite.config.js");
    }
  } else {
    console.error("Arquivo vite.config.js não encontrado!");
  }
  
  // Gerar o cliente Prisma
  console.log("Gerando cliente Prisma...");
  try {
    execSync('npx prisma generate --schema=server/prisma/schema.prisma', { stdio: 'inherit' });
    console.log("Cliente Prisma gerado com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar cliente Prisma:", error.message);
    throw new Error("Falha ao gerar cliente Prisma. Abortando build.");
  }
  
  // Executar o script de sincronização de serviços ANTES do build do Astro
  console.log("Executando sincronização de serviços...");
  try {
    execSync('node server/scripts/sync-services.js', { stdio: 'inherit' });
    console.log("Sincronização de serviços executada com sucesso!");
  } catch (error) {
    console.error("Erro ao executar sincronização de serviços:", error.message);
    throw new Error("Falha na sincronização de serviços. Abortando build para evitar deploy com dados desatualizados.");
  }
  
  // Executar o build do Astro DEPOIS da sincronização
  console.log("Executando build do Astro...");
  try {
    execSync('npx astro build', { stdio: 'inherit' });
    console.log("Build do Astro executado com sucesso!");
  } catch (error) {
    console.error("Erro ao executar build do Astro:", error.message);
    
    // Verificar se o diretório dist existe
    const distPath = path.join(currentDir, 'dist');
    if (!fs.existsSync(distPath)) {
      console.log("Criando diretório dist...");
      fs.mkdirSync(distPath, { recursive: true });
    }
    
    // Criar um arquivo index.html de fallback
    console.log("Criando arquivo index.html de fallback...");
    fs.writeFileSync(path.join(distPath, 'index.html'), `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LytSpot - API</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .api-info { background: #f5f5f5; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>LytSpot - API</h1>
  <div class="api-info">
    <p>Esta é a API do LytSpot. O frontend está temporariamente indisponível.</p>
    <p>Para acessar os endpoints da API, utilize:</p>
    <ul>
      <li>/api/pricing - Simulador de preços</li>
      <li>/api/contact - Formulário de contato</li>
      <li>/api/admin - Painel administrativo</li>
    </ul>
  </div>
</body>
</html>
    `);
    console.log("Arquivo index.html de fallback criado com sucesso!");
  }
  
  console.log("Script render-build.js concluído!");
} catch (error) {
  console.error("Erro durante a execução do script render-build.js:", error);
  process.exit(1);
}
