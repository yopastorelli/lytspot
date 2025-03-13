import { log, logError } from '../utils/dbUtils.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import environment from '../config/environment.js';
import userRepository from '../repositories/userRepository.js';

dotenv.config();

/**
 * Controlador para autenticação
 * Responsável por gerenciar login e registro de usuários
 * 
 * @version 1.3.0 - 2025-03-13 - Refatorado para utilizar o repositório de usuários
 */
export const authController = {
  /**
   * Registrar um novo usuário (apenas para uso inicial/administrativo)
   */
  register: async (req, res) => {
    try {
      const { email, password, nome } = req.body;
      
      log(`Tentativa de registro para usuário: ${email}`, 'info', 'auth');
      
      // Verificar se o usuário já existe
      const usuarioExistente = await userRepository.findByEmail(email);
      
      if (usuarioExistente) {
        log(`Registro falhou: usuário ${email} já existe`, 'warn', 'auth');
        return res.status(400).json({ message: 'Usuário já existe' });
      }
      
      // Criar o usuário através do repositório
      const novoUsuario = await userRepository.create({ email, password, nome });
      
      // Remover a senha do objeto de resposta
      const { password: _, ...usuarioSemSenha } = novoUsuario;
      
      log(`Usuário registrado com sucesso: ${email}`, 'info', 'auth');
      return res.status(201).json(usuarioSemSenha);
    } catch (error) {
      logError('Erro ao registrar usuário', error, 'auth', { email: req.body.email });
      return res.status(500).json({ 
        message: 'Erro ao registrar usuário',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
      });
    }
  },

  /**
   * Fazer login
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      log(`Tentativa de login para usuário: ${email}`, 'info', 'auth');
      
      // Buscar o usuário pelo email através do repositório
      const usuario = await userRepository.findByEmail(email);
      
      if (!usuario) {
        log(`Login falhou: usuário ${email} não encontrado`, 'warn', 'auth');
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Verificar a senha através do repositório
      const senhaCorreta = await userRepository.verifyPassword(password, usuario.password);
      
      if (!senhaCorreta) {
        log(`Login falhou: senha incorreta para usuário ${email}`, 'warn', 'auth');
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
      
      log(`Login bem-sucedido para usuário: ${email}`, 'info', 'auth');
      return res.status(200).json({
        user: usuarioSemSenha,
        token
      });
    } catch (error) {
      logError('Erro ao fazer login', error, 'auth', { email: req.body.email });
      return res.status(500).json({ 
        message: 'Erro ao fazer login',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
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
      
      log(`Verificando token para usuário ID: ${req.user.id}`, 'info', 'auth');
      
      // Buscar o usuário atualizado pelo ID através do repositório
      const usuario = await userRepository.findById(req.user.id);
      
      if (!usuario) {
        log(`Verificação de token falhou: usuário ID ${req.user.id} não encontrado`, 'warn', 'auth');
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Remover a senha do objeto de resposta
      const { password: _, ...usuarioSemSenha } = usuario;
      
      log(`Token verificado com sucesso para usuário ID: ${req.user.id}`, 'info', 'auth');
      return res.status(200).json(usuarioSemSenha);
    } catch (error) {
      logError('Erro ao verificar token', error, 'auth', { userId: req.user?.id });
      return res.status(500).json({ 
        message: 'Erro ao verificar token',
        error: environment.IS_DEVELOPMENT ? error.message : undefined
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
    log('Verificando token JWT', 'debug', 'auth');
    
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'f23e126b7f99a3e4553c65b3f558cb6a');
    
    // Buscar o usuário atualizado pelo ID através do repositório
    const usuario = await userRepository.findById(decoded.id);
    
    if (!usuario) {
      log(`Verificação de token falhou: usuário ID ${decoded.id} não encontrado`, 'warn', 'auth');
      throw new Error('Usuário não encontrado');
    }
    
    // Remover a senha do objeto de resposta
    const { password: _, ...usuarioSemSenha } = usuario;
    
    log(`Token verificado com sucesso para usuário ID: ${decoded.id}`, 'debug', 'auth');
    return usuarioSemSenha;
  } catch (error) {
    logError('Erro ao verificar token JWT', error, 'auth');
    throw error;
  }
}
