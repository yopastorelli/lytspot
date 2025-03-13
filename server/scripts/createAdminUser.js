import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar o ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(rootDir, '..', '.env.development') });

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Iniciando criação de usuário administrador...');
    
    // Verificar se já existe um usuário com o email admin@lytspot.com.br
    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: 'admin@lytspot.com.br'
      }
    });
    
    if (usuarioExistente) {
      console.log('Usuário administrador já existe. Atualizando senha...');
      
      // Criptografar a nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Atualizar o usuário existente
      await prisma.user.update({
        where: {
          email: 'admin@lytspot.com.br'
        },
        data: {
          password: hashedPassword
        }
      });
      
      console.log('Senha do usuário administrador atualizada com sucesso!');
    } else {
      console.log('Criando novo usuário administrador...');
      
      // Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Criar o usuário administrador
      await prisma.user.create({
        data: {
          email: 'admin@lytspot.com.br',
          password: hashedPassword,
          nome: 'Administrador',
          role: 'ADMIN'
        }
      });
      
      console.log('Usuário administrador criado com sucesso!');
    }
    
    // Listar todos os usuários para verificação
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        role: true
      }
    });
    
    console.log('Usuários no banco de dados:');
    console.table(usuarios);
    
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função
createAdminUser();
