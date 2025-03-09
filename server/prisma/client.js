// Importar o script de configuração do Render
import './render-setup.js';
import { PrismaClient } from '@prisma/client';

// Criando uma instância global do Prisma Client para evitar múltiplas conexões
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Definindo o objeto global para o Prisma Client
const globalForPrisma = globalThis;

// Criando ou reutilizando a instância do Prisma Client
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Em ambiente de desenvolvimento, salvamos a instância no objeto global
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
