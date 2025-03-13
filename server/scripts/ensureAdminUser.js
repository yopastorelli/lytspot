// @ts-check
/**
 * Script para garantir que um usuário administrador exista no sistema
 * Este script é executado automaticamente durante a inicialização do servidor
 * @version 1.0.0 - 2025-03-12
 */

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
dotenv.config({ path: path.resolve(rootDir, '.env') });

const prisma = new PrismaClient();

/**
 * Cria um usuário administrador se não existir
 */
export async function ensureAdminUser() {
  try {
    console.log('Verificando usuário administrador...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    // Verificar se já existe um usuário com o email admin@lytspot.com.br
    const adminEmail = 'admin@lytspot.com.br';
    const adminPassword = 'Black&Red2025';
    
    // Verificar a conexão com o banco de dados
    try {
      await prisma.$connect();
      console.log('Conexão com o banco de dados estabelecida com sucesso.');
    } catch (dbError) {
      console.error('Erro ao conectar ao banco de dados:', dbError);
      throw new Error('Falha na conexão com o banco de dados');
    }
    
    // Verificar se o usuário já existe
    let usuarioExistente;
    try {
      usuarioExistente = await prisma.user.findUnique({
        where: {
          email: adminEmail
        }
      });
      
      if (usuarioExistente) {
        console.log('Usuário administrador já existe:', usuarioExistente.email);
      }
    } catch (findError) {
      console.error('Erro ao buscar usuário:', findError);
      throw new Error('Falha ao verificar usuário existente');
    }
    
    // Se o usuário não existir, criar um novo
    if (!usuarioExistente) {
      console.log('Criando usuário administrador...');
      
      try {
        // Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        // Criar o usuário administrador
        const novoUsuario = await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
            nome: 'Administrador',
            role: 'ADMIN'
          }
        });
        
        console.log('Usuário administrador criado com sucesso!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Senha: ${adminPassword}`);
        console.log('Detalhes do usuário:', {
          id: novoUsuario.id,
          email: novoUsuario.email,
          nome: novoUsuario.nome,
          role: novoUsuario.role
        });
      } catch (createError) {
        console.error('Erro ao criar usuário:', createError);
        throw new Error('Falha ao criar usuário administrador');
      }
    }
    
    // Listar todos os usuários
    try {
      const usuarios = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          nome: true,
          role: true
        }
      });
      
      console.log(`Total de usuários no sistema: ${usuarios.length}`);
      console.log('Usuários:', usuarios);
    } catch (listError) {
      console.error('Erro ao listar usuários:', listError);
    }
  } catch (error) {
    console.error('Erro ao verificar/criar usuário administrador:', error);
    throw error;
  } finally {
    // Desconectar do banco de dados
    await prisma.$disconnect();
    console.log('Desconectado do banco de dados.');
  }
}

// Executar a função se este arquivo for executado diretamente
if (import.meta.url === process.argv[1]) {
  console.log('Executando script diretamente...');
  ensureAdminUser()
    .then(() => {
      console.log('Script concluído com sucesso.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro ao executar script:', error);
      process.exit(1);
    });
} else {
  console.log('Script importado como módulo.');
}
