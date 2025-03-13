/**
 * Script simples para criar um usuário administrador
 * @version 1.0.0 - 2025-03-13
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Iniciando criação de usuário administrador...');
    
    // Dados do usuário administrador
    const adminData = {
      email: 'admin@lytspot.com.br',
      password: 'Black&Red2025',
      nome: 'Administrador'
    };
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    });
    
    if (existingUser) {
      console.log('Usuário administrador já existe. Atualizando senha...');
      
      // Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);
      
      // Atualizar a senha do usuário existente
      await prisma.user.update({
        where: { email: adminData.email },
        data: { password: hashedPassword }
      });
      
      console.log('Senha atualizada com sucesso!');
    } else {
      console.log('Criando novo usuário administrador...');
      
      // Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);
      
      // Criar o usuário
      await prisma.user.create({
        data: {
          email: adminData.email,
          password: hashedPassword,
          nome: adminData.nome
        }
      });
      
      console.log('Usuário administrador criado com sucesso!');
    }
    
    // Listar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nome: true
      }
    });
    
    console.log('Usuários no sistema:', users);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
createAdmin();
