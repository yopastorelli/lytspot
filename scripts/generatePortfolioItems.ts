import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtém o equivalente a __dirname no ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = path.resolve(__dirname, '../public/images/portimages');
const categories = ['aventuras', 'arquitetura', 'empresas', 'festasepalco', 'projetos'];

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  media: MediaItem[];
  description: string;
  tags: string[];
  date: string;
}

const getAssetUrl = (filePath: string): string => {
  const baseUrl = process.env.BASE_URL || '/';
  return `${baseUrl}${filePath}`;
};

const generatePortfolioItems = (): PortfolioItem[] => {
  const portfolioItems: PortfolioItem[] = [];

  categories.forEach((category, index) => {
    const categoryPath = path.join(basePath, category);
    const media: MediaItem[] = [];

    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath);

      files.forEach((file: string) => {
        const filePath = path.join(categoryPath, file);
        const fileType = path.extname(file).toLowerCase() === '.mp4' ? 'video' : 'image';
        media.push({ url: getAssetUrl(`images/portimages/${category}/${file}`), type: fileType });
      });

      portfolioItems.push({
        id: (index + 1).toString(),
        title: category.charAt(0).toUpperCase() + category.slice(1),
        category,
        media,
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} description.`,
        tags: [category],
        date: '2023/2024',
      });
    }
  });

  return portfolioItems;
};

const portfolioItems = generatePortfolioItems();
fs.writeFileSync(
  path.resolve(__dirname, '../src/data/portfolioItems.ts'),
  `export const portfolioItems = ${JSON.stringify(portfolioItems, null, 2)};`
);

console.log('Portfolio items generated successfully.');