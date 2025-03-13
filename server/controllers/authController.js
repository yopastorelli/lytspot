import prisma from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Controlador para autenticação
 * Responsável por gerenciar login e registro de usuários
 */
export const authController = {
  /**
   * Registrar um novo usuário (apenas para uso inicial/administrativo)
   */
  register: async (req, res) => {
    try {
      const { email, password, nome } = req.body;
      
      // Verificar se o usuário já existe
      const usuarioExistente = await prisma.user.findUnique({
        where: {
          email
        }
      });
      
      if (usuarioExistente) {
        return res.status(400).json({ message: 'Usuário já existe' });
      }
      
      // Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Criar o usuário
      const novoUsuario = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          nome
        }
      });
      
      // Remover a senha do objeto de resposta
      const { password: _, ...usuarioSemSenha } = novoUsuario;
      
      return res.status(201).json(usuarioSemSenha);
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({ 
        message: 'Erro ao registrar usuário',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Fazer login
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Buscar o usuário pelo email
      const usuario = await prisma.user.findUnique({
        where: {
          email
        }
      });
      
      if (!usuario) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Verificar a senha
      const senhaCorreta = await bcrypt.compare(password, usuario.password);
      
      if (!senhaCorreta) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Gerar o token JWT
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nome: usuario.nome },
        process.env.JWT_SECRET || 'f23e126b7f99a3e4553c65b3f558cb6a', // Fallback para desenvolvimento
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );
      
      // Remover a senha do objeto de resposta
      const { password: _, ...usuarioSemSenha } = usuario;
      
      return res.status(200).json({
        user: usuarioSemSenha,
        token
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ 
        message: 'Erro ao fazer login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Verificar o token JWT
   */
  verifyToken: async (req, res) => {
    try {
      // O middleware de autenticação já verificou o token
      // e adicionou o usuário decodificado à requisição
      
      // Buscar o usuário atualizado pelo ID
      const usuario = await prisma.user.findUnique({
        where: {
          id: req.user.id
        }
      });
      
      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Remover a senha do objeto de resposta
      const { password: _, ...usuarioSemSenha } = usuario;
      
      return res.status(200).json(usuarioSemSenha);
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(500).json({ 
        message: 'Erro ao verificar token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
