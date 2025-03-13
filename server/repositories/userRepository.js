/**
 * Repositório para acesso a dados de usuários
 * 
 * Responsável por encapsular o acesso ao banco de dados para operações relacionadas a usuários,
 * incluindo autenticação, criação, atualização e consultas.
 * 
 * @version 1.2.0 - 2025-03-14 - Corrigido import do bcrypt para bcryptjs
 * @module repositories/userRepository
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

/**
 * Repositório para gerenciar operações de banco de dados relacionadas a usuários
 */
class UserRepository {
  /**
   * Busca um usuário pelo email
   * @param {string} email Email do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  async findByEmail(email) {
    try {
      return await prisma.usuario.findUnique({
        where: { email }
      });
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  /**
   * Busca um usuário pelo ID
   * @param {number} id ID do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  async findById(id) {
    try {
      return await prisma.usuario.findUnique({
        where: { id: Number(id) }
      });
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  /**
   * Busca todos os usuários
   * @returns {Promise<Array>} Lista de usuários sem as senhas
   */
  async findAll() {
    try {
      const usuarios = await prisma.usuario.findMany();
      
      // Remover senhas dos usuários
      return usuarios.map(usuario => {
        const { senha, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
      });
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }
  }

  /**
   * Cria um novo usuário no banco de dados
   * @param {Object} data Dados do usuário a ser criado
   * @returns {Promise<Object>} Usuário criado
   */
  async create(data) {
    try {
      // Sanitizar dados do usuário
      const sanitizedData = this.sanitizeUserData(data);
      
      // Criptografar senha
      if (sanitizedData.senha) {
        const salt = await bcrypt.genSalt(10);
        sanitizedData.senha = await bcrypt.hash(sanitizedData.senha, salt);
      }
      
      return await prisma.usuario.create({
        data: sanitizedData
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  /**
   * Atualiza um usuário existente
   * @param {number} id ID do usuário a ser atualizado
   * @param {Object} data Dados atualizados do usuário
   * @returns {Promise<Object>} Usuário atualizado
   */
  async update(id, data) {
    try {
      // Sanitizar dados do usuário
      const sanitizedData = this.sanitizeUserData(data);
      
      // Criptografar senha se fornecida
      if (sanitizedData.senha) {
        const salt = await bcrypt.genSalt(10);
        sanitizedData.senha = await bcrypt.hash(sanitizedData.senha, salt);
      }
      
      return await prisma.usuario.update({
        where: { id: Number(id) },
        data: sanitizedData
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  /**
   * Remove um usuário do banco de dados
   * @param {number} id ID do usuário a ser removido
   * @returns {Promise<Object>} Usuário removido
   */
  async delete(id) {
    try {
      return await prisma.usuario.delete({
        where: { id: Number(id) }
      });
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      throw new Error(`Erro ao remover usuário: ${error.message}`);
    }
  }

  /**
   * Verifica se as credenciais do usuário são válidas
   * @param {string} email Email do usuário
   * @param {string} senha Senha do usuário
   * @returns {Promise<Object|null>} Usuário autenticado ou null
   */
  async authenticate(email, senha) {
    try {
      // Buscar usuário pelo email
      const usuario = await this.findByEmail(email);
      
      if (!usuario) {
        return null;
      }
      
      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      
      if (!senhaValida) {
        return null;
      }
      
      // Retornar usuário sem a senha
      const { senha: _, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      throw new Error(`Erro na autenticação: ${error.message}`);
    }
  }

  /**
   * Sanitiza os dados de um usuário para garantir compatibilidade com o banco de dados
   * @param {Object} data Dados do usuário
   * @returns {Object} Dados sanitizados
   */
  sanitizeUserData(data) {
    // Criar cópia para não modificar o objeto original
    const sanitizedData = { ...data };
    
    // Garantir que campos de texto não sejam undefined ou null
    const textFields = ['nome', 'email', 'telefone'];
    textFields.forEach(field => {
      if (sanitizedData[field] === undefined || sanitizedData[field] === null) {
        sanitizedData[field] = '';
      } else if (typeof sanitizedData[field] !== 'string') {
        sanitizedData[field] = String(sanitizedData[field]);
      }
      
      // Remover espaços em branco extras
      if (typeof sanitizedData[field] === 'string') {
        sanitizedData[field] = sanitizedData[field].trim();
      }
    });
    
    return sanitizedData;
  }
}

// Exportar uma instância única do repositório
export default new UserRepository();
