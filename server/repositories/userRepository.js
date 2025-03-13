import { prisma, log, logError, executeWithRetry, sanitizeData } from '../utils/dbUtils.js';
import bcrypt from 'bcryptjs';

/**
 * Repositório para operações relacionadas a usuários
 * Centraliza todas as operações de banco de dados relacionadas a usuários
 * 
 * @version 1.0.0 - 2025-03-13 - Implementação inicial
 */
export const userRepository = {
  /**
   * Busca um usuário pelo email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  findByEmail: async (email) => {
    try {
      log(`Buscando usuário por email: ${email}`, 'debug', 'user-repository');
      
      return await executeWithRetry(
        () => prisma.user.findUnique({
          where: { email }
        }),
        'findUserByEmail',
        { email }
      );
    } catch (error) {
      // Verificar se o erro é relacionado à coluna 'role'
      if (error.code === 'P2022' && (error.meta?.column === 'role' || error.meta?.column === 'main.User.role')) {
        log('Detectado problema com a coluna "role". Tentando consulta alternativa...', 'warn', 'user-repository');
        
        // Consulta alternativa usando select explícito para evitar o campo 'role'
        const result = await prisma.$queryRaw`SELECT id, email, password, nome FROM User WHERE email = ${email}`;
        
        if (result && result.length > 0) {
          return result[0];
        }
        return null;
      }
      
      logError('Erro ao buscar usuário por email', error, 'user-repository', { email });
      throw error;
    }
  },
  
  /**
   * Busca um usuário pelo ID
   * @param {string} id - ID do usuário
   * @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  findById: async (id) => {
    try {
      log(`Buscando usuário por ID: ${id}`, 'debug', 'user-repository');
      
      return await executeWithRetry(
        () => prisma.user.findUnique({
          where: { id }
        }),
        'findUserById',
        { id }
      );
    } catch (error) {
      // Verificar se o erro é relacionado à coluna 'role'
      if (error.code === 'P2022' && (error.meta?.column === 'role' || error.meta?.column === 'main.User.role')) {
        log('Detectado problema com a coluna "role". Tentando consulta alternativa...', 'warn', 'user-repository');
        
        // Consulta alternativa usando select explícito para evitar o campo 'role'
        const result = await prisma.$queryRaw`SELECT id, email, password, nome FROM User WHERE id = ${id}`;
        
        if (result && result.length > 0) {
          return result[0];
        }
        return null;
      }
      
      logError('Erro ao buscar usuário por ID', error, 'user-repository', { id });
      throw error;
    }
  },
  
  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} - Usuário criado
   */
  create: async (userData) => {
    try {
      log(`Criando novo usuário: ${userData.email}`, 'info', 'user-repository');
      
      // Sanitizar dados
      const sanitizedData = sanitizeData(userData, ['email', 'password', 'nome']);
      
      // Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(sanitizedData.password, salt);
      
      // Substituir a senha original pela senha criptografada
      sanitizedData.password = hashedPassword;
      
      return await executeWithRetry(
        () => prisma.user.create({
          data: sanitizedData
        }),
        'createUser',
        { email: sanitizedData.email, nome: sanitizedData.nome }
      );
    } catch (error) {
      logError('Erro ao criar usuário', error, 'user-repository', { email: userData.email });
      throw error;
    }
  },
  
  /**
   * Atualiza um usuário existente
   * @param {string} id - ID do usuário
   * @param {Object} userData - Dados atualizados do usuário
   * @returns {Promise<Object>} - Usuário atualizado
   */
  update: async (id, userData) => {
    try {
      log(`Atualizando usuário ID: ${id}`, 'info', 'user-repository');
      
      // Sanitizar dados
      const sanitizedData = sanitizeData(userData, ['email', 'nome']);
      
      // Se a senha estiver sendo atualizada, criptografá-la
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        sanitizedData.password = hashedPassword;
      }
      
      return await executeWithRetry(
        () => prisma.user.update({
          where: { id },
          data: sanitizedData
        }),
        'updateUser',
        { id, ...sanitizedData }
      );
    } catch (error) {
      logError('Erro ao atualizar usuário', error, 'user-repository', { id });
      throw error;
    }
  },
  
  /**
   * Verifica se a senha fornecida corresponde à senha armazenada
   * @param {string} providedPassword - Senha fornecida
   * @param {string} storedPassword - Senha armazenada (hash)
   * @returns {Promise<boolean>} - true se a senha estiver correta, false caso contrário
   */
  verifyPassword: async (providedPassword, storedPassword) => {
    try {
      return await bcrypt.compare(providedPassword, storedPassword);
    } catch (error) {
      logError('Erro ao verificar senha', error, 'user-repository');
      throw error;
    }
  }
};

export default userRepository;
