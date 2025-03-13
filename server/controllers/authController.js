import userRepository from '../repositories/userRepository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Controlador para autenticação
 * Responsável por gerenciar login e registro de usuários
 * 
 * @version 1.2.0 - 2025-03-14 - Corrigido parâmetro de senha na autenticação
 */
export const authController = {
  /**
   * Registrar um novo usuário (apenas para uso inicial/administrativo)
   */
  register: async (req, res) => {
    try {
      const { email, password, nome } = req.body;
      
      // Verificar se o usuário já existe
      const usuarioExistente = await userRepository.findByEmail(email);
      
      if (usuarioExistente) {
        return res.status(400).json({ message: 'Usuário já existe' });
      }
      
      // Criar o usuário (o userRepository já faz a criptografia da senha)
      const novoUsuario = await userRepository.create({
        email,
        senha: password,
        nome
      });
      
      // Remover a senha do objeto de resposta
      const { senha: _, ...usuarioSemSenha } = novoUsuario;
      
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
      
      // Autenticar o usuário usando o repositório
      // Corrigido: passando 'password' como 'senha' para o método authenticate
      const usuario = await userRepository.authenticate(email, password);
      
      if (!usuario) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Gerar o token JWT
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nome: usuario.nome },
        process.env.JWT_SECRET || 'f23e126b7f99a3e4553c65b3f558cb6a', // Fallback para desenvolvimento
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );
      
      return res.status(200).json({
        user: usuario,
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
   * Verificar token JWT
   */
  verifyToken: async (req, res) => {
    try {
      // O token já foi verificado pelo middleware de autenticação
      // Retornar os dados do usuário
      return res.status(200).json({
        user: req.user
      });
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(500).json({ 
        message: 'Erro ao verificar token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

/**
 * Função para verificar um token JWT e retornar os dados do usuário
 * @param {string} token - Token JWT a ser verificado
 * @returns {Promise<Object>} - Dados do usuário decodificado
 */
export async function verifyToken(token) {
  try {
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'f23e126b7f99a3e4553c65b3f558cb6a');
    
    // Buscar o usuário atualizado pelo ID
    const usuario = await userRepository.findById(decoded.id);
    
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    
    // Remover a senha do objeto de resposta
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    return usuarioSemSenha;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    throw new Error(`Erro ao verificar token: ${error.message}`);
  }
}
