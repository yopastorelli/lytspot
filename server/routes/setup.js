import express from 'express';
import prisma from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * Endpoint temporário para criar um usuário administrador
 * IMPORTANTE: Este endpoint deve ser removido após o uso inicial
 * @version 1.0.0 - 2025-03-12
 */
router.post('/create-admin', async (req, res) => {
  try {
    // Verificar chave de segurança para evitar acesso não autorizado
    const { securityKey } = req.body;
    
    if (securityKey !== 'setup-lytspot-2025') {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }
    
    // Verificar se já existe um usuário com o email admin@lytspot.com.br
    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: 'admin@lytspot.com.br'
      }
    });
    
    if (usuarioExistente) {
      // Atualizar a senha do usuário existente
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Black&Red2025', salt);
      
      await prisma.user.update({
        where: {
          email: 'admin@lytspot.com.br'
        },
        data: {
          password: hashedPassword
        }
      });
      
      return res.status(200).json({ 
        message: 'Senha do usuário administrador atualizada com sucesso',
        email: 'admin@lytspot.com.br',
        password: 'Black&Red2025' // Apenas para uso inicial
      });
    }
    
    // Criar um novo usuário administrador
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Black&Red2025', salt);
    
    const novoUsuario = await prisma.user.create({
      data: {
        email: 'admin@lytspot.com.br',
        password: hashedPassword,
        nome: 'Administrador',
        role: 'ADMIN'
      }
    });
    
    // Remover a senha do objeto de resposta
    const { password: _, ...usuarioSemSenha } = novoUsuario;
    
    return res.status(201).json({ 
      message: 'Usuário administrador criado com sucesso',
      user: usuarioSemSenha,
      email: 'admin@lytspot.com.br',
      password: 'Black&Red2025' // Apenas para uso inicial
    });
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
    return res.status(500).json({ 
      message: 'Erro ao criar usuário administrador',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
    });
  }
});

/**
 * Endpoint para verificar usuários existentes
 * IMPORTANTE: Este endpoint deve ser removido após o uso inicial
 */
router.post('/check-users', async (req, res) => {
  try {
    // Verificar chave de segurança para evitar acesso não autorizado
    const { securityKey } = req.body;
    
    if (securityKey !== 'setup-lytspot-2025') {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }
    
    // Buscar todos os usuários (sem retornar as senhas)
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return res.status(200).json({ 
      message: `${usuarios.length} usuários encontrados`,
      users: usuarios
    });
  } catch (error) {
    console.error('Erro ao verificar usuários:', error);
    return res.status(500).json({ 
      message: 'Erro ao verificar usuários',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
    });
  }
});

export default router;
