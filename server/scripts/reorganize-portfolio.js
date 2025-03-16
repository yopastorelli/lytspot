/**
 * Script para reorganizar e gerar itens do portfólio
 * @version 1.0.0 - 2025-03-15 - Implementação inicial
 * @description Reorganiza os arquivos de mídia do portfólio em pastas específicas e gera o arquivo portfolioItems.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos importantes
const rootDir = path.resolve(__dirname, '../..');
const portfolioDir = path.join(rootDir, 'public', 'images', 'portimages');
const outputFile = path.join(rootDir, 'src', 'data', 'portfolioItems.ts');

// Extensões de arquivo por tipo
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.PNG', '.JPG', '.JPEG'];
const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.MP4'];

// Log com timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] [reorganize-portfolio] ${message}`);
}

/**
 * Verifica se um arquivo é uma imagem com base na extensão
 * @param {string} filename - Nome do arquivo
 * @returns {boolean} - Verdadeiro se for uma imagem
 */
function isImage(filename) {
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext.toLowerCase());
}

/**
 * Verifica se um arquivo é um vídeo com base na extensão
 * @param {string} filename - Nome do arquivo
 * @returns {boolean} - Verdadeiro se for um vídeo
 */
function isVideo(filename) {
  const ext = path.extname(filename).toLowerCase();
  return videoExtensions.includes(ext.toLowerCase());
}

/**
 * Cria um diretório se ele não existir
 * @param {string} dirPath - Caminho do diretório
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Diretório criado: ${dirPath}`);
  }
}

/**
 * Move um arquivo para um novo local
 * @param {string} source - Caminho de origem
 * @param {string} destination - Caminho de destino
 * @returns {boolean} - Verdadeiro se o arquivo foi movido com sucesso
 */
function moveFile(source, destination) {
  try {
    // Se o arquivo já existe no destino, não faz nada
    if (fs.existsSync(destination)) {
      log(`Arquivo já existe no destino: ${destination}`);
      return true;
    }
    
    // Copia o arquivo para o destino
    fs.copyFileSync(source, destination);
    log(`Arquivo copiado: ${source} -> ${destination}`);
    return true;
  } catch (error) {
    console.error(`Erro ao mover arquivo ${source}: ${error.message}`);
    return false;
  }
}

/**
 * Reorganiza os arquivos de uma categoria
 * @param {string} categoryPath - Caminho da pasta da categoria
 * @returns {Object} - Informações sobre a reorganização
 */
function reorganizeCategory(categoryPath) {
  const categoryName = path.basename(categoryPath);
  log(`\nReorganizando categoria: ${categoryName}`);
  
  // Criar subpastas para imagens e vídeos
  const imagesDir = path.join(categoryPath, 'images');
  const videosDir = path.join(categoryPath, 'videos');
  
  ensureDirectoryExists(imagesDir);
  ensureDirectoryExists(videosDir);
  
  // Listar arquivos na pasta da categoria
  const files = fs.readdirSync(categoryPath);
  
  let coverImage = null;
  const images = [];
  const videos = [];
  
  // Verificar se já existe uma imagem de capa
  if (files.includes('cover.jpeg')) {
    coverImage = 'cover.jpeg';
    log(`Imagem de capa já existe: ${categoryName}/cover.jpeg`);
  }
  
  // Processar cada arquivo
  for (const file of files) {
    // Ignorar diretórios 'images' e 'videos'
    if (file === 'images' || file === 'videos' || file === 'cover.jpeg') continue;
    
    const filePath = path.join(categoryPath, file);
    
    // Ignorar pastas
    if (fs.statSync(filePath).isDirectory()) continue;
    
    // Mover arquivo para a pasta apropriada
    if (isImage(file)) {
      // Se ainda não temos uma imagem de capa, usar esta
      if (!coverImage) {
        const coverPath = path.join(categoryPath, 'cover.jpeg');
        moveFile(filePath, coverPath);
        coverImage = 'cover.jpeg';
        log(`Definida imagem de capa para ${categoryName}: ${file} -> cover.jpeg`);
      } else {
        const destPath = path.join(imagesDir, file);
        if (moveFile(filePath, destPath)) {
          images.push(file);
        }
      }
    } else if (isVideo(file)) {
      const destPath = path.join(videosDir, file);
      if (moveFile(filePath, destPath)) {
        videos.push(file);
      }
    }
  }
  
  // Verificar arquivos nas subpastas (caso já existam)
  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir);
    for (const file of imageFiles) {
      if (!images.includes(file) && isImage(file)) {
        images.push(file);
      }
    }
  }
  
  if (fs.existsSync(videosDir)) {
    const videoFiles = fs.readdirSync(videosDir);
    for (const file of videoFiles) {
      if (!videos.includes(file) && isVideo(file)) {
        videos.push(file);
      }
    }
  }
  
  log(`Categoria ${categoryName}: ${images.length} imagens, ${videos.length} vídeos, capa: ${coverImage || 'não definida'}`);
  
  return {
    categoryName,
    coverImage,
    images,
    videos
  };
}

/**
 * Gera o arquivo portfolioItems.ts com base na estrutura de pastas
 */
function generatePortfolioItems() {
  log('Iniciando geração do portfólio...');
  
  // Verificar se o diretório do portfólio existe
  if (!fs.existsSync(portfolioDir)) {
    console.error(`Diretório do portfólio não encontrado: ${portfolioDir}`);
    return;
  }
  
  // Listar categorias (pastas no diretório do portfólio)
  const categories = fs.readdirSync(portfolioDir)
    .filter(item => fs.statSync(path.join(portfolioDir, item)).isDirectory());
  
  log(`Categorias encontradas: ${categories.join(', ')}`);
  
  const portfolioItems = [];
  
  // Processar cada categoria
  categories.forEach((category, index) => {
    const categoryPath = path.join(portfolioDir, category);
    
    // Reorganizar arquivos da categoria
    const { categoryName, coverImage, images, videos } = reorganizeCategory(categoryPath);
    
    // Preparar array de mídia
    const media = [];
    
    // Adicionar imagem de capa
    if (coverImage) {
      media.push({
        url: `/images/portimages/${category}/${coverImage}`,
        type: 'image'
      });
    }
    
    // Adicionar imagens
    images.forEach(image => {
      media.push({
        url: `/images/portimages/${category}/images/${image}`,
        type: 'image'
      });
    });
    
    // Adicionar vídeos
    videos.forEach(video => {
      media.push({
        url: `/images/portimages/${category}/videos/${video}`,
        type: 'video'
      });
    });
    
    // Criar item do portfólio
    portfolioItems.push({
      id: (index + 1).toString(),
      title: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
      category: categoryName,
      media,
      description: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} description.`,
      tags: [categoryName],
      date: '2023/2024',
    });
  });
  
  // Fazer backup do arquivo existente, se houver
  if (fs.existsSync(outputFile)) {
    const backupFile = `${outputFile}.bak`;
    fs.copyFileSync(outputFile, backupFile);
    log(`Backup do arquivo original criado: ${backupFile}`);
  }
  
  // Escrever arquivo portfolioItems.ts
  const fileContent = `/**
 * Arquivo gerado automaticamente pelo script reorganize-portfolio.js
 * @version 1.0.0 - ${new Date().toISOString()}
 * NÃO EDITE ESTE ARQUIVO MANUALMENTE!
 */

export const portfolioItems = ${JSON.stringify(portfolioItems, null, 2)};
`;

  fs.writeFileSync(outputFile, fileContent);
  
  log(`\nPortfólio gerado com sucesso: ${outputFile}`);
  log(`Total de categorias: ${portfolioItems.length}`);
  portfolioItems.forEach(item => {
    log(`- ${item.title}: ${item.media.length} arquivos de mídia`);
  });
}

// Executar a função principal
generatePortfolioItems();
