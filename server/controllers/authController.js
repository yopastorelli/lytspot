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
      let usuario;
      try {
        usuario = await prisma.user.findUnique({
          where: {
            email
          }
        });
      } catch (dbError) {
        // Verificar se o erro é relacionado à coluna 'role'
        if (dbError.code === 'P2022' && (dbError.meta?.column === 'role' || dbError.meta?.column === 'main.User.role')) {
          console.log('Detectado problema com a coluna "role". Tentando consulta alternativa...');
          
          // Consulta alternativa usando select explícito para evitar o campo 'role'
          const result = await prisma.$queryRaw`SELECT id, email, password, nome FROM User WHERE email = ${email}`;
          
          if (result && result.length > 0) {
            usuario = result[0];
          }
        } else {
          throw dbError;
        }
      }
      
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
      let usuario;
      try {
        usuario = await prisma.user.findUnique({
          where: {
            id: req.user.id
          }
        });
      } catch (dbError) {
        // Verificar se o erro é relacionado à coluna 'role'
        if (dbError.code === 'P2022' && (dbError.meta?.column === 'role' || dbError.meta?.column === 'main.User.role')) {
          console.log('Detectado problema com a coluna "role" na verificação de token. Tentando consulta alternativa...');
          
          // Consulta alternativa usando select explícito para evitar o campo 'role'
          const result = await prisma.$queryRaw`SELECT id, email, password, nome FROM User WHERE id = ${req.user.id}`;
          
          if (result && result.length > 0) {
            usuario = result[0];
          }
        } else {
          throw dbError;
        }
      }
      
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
    let usuario;
    try {
      usuario = await prisma.user.findUnique({
        where: {
          id: decoded.id
        }
      });
    } catch (dbError) {
      // Verificar se o erro é relacionado à coluna 'role'
      if (dbError.code === 'P2022' && (dbError.meta?.column === 'role' || dbError.meta?.column === 'main.User.role')) {
        console.log('Detectado problema com a coluna "role" na verificação de token. Tentando consulta alternativa...');
        
        // Consulta alternativa usando select explícito para evitar o campo 'role'
        const result = await prisma.$queryRaw`SELECT id, email, password, nome FROM User WHERE id = ${decoded.id}`;
        
        if (result && result.length > 0) {
          usuario = result[0];
        }
      } else {
        throw dbError;
      }
    }
    
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    
    // Remover a senha do objeto de resposta
    const { password: _, ...usuarioSemSenha } = usuario;
    
    return usuarioSemSenha;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    throw error;
  }
}
