import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { verifyToken } from '../controllers/authController.js';
import { log, logError } from '../utils/dbUtils.js';
import environment from '../config/environment.js';

dotenv.config();

/**
 * Middleware para autenticação JWT
 * Verifica se o token JWT é válido e adiciona o usuário decodificado à requisição
 * 
 * @version 1.1.0 - 2025-03-13 - Refatorado para utilizar módulo centralizado de utilitários
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      log('Tentativa de acesso sem token de autenticação', 'warn', 'auth-middleware');
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      log('Formato de token inválido: não segue o padrão "Bearer TOKEN"', 'warn', 'auth-middleware');
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      log(`Formato de token inválido: esquema "${scheme}" não reconhecido`, 'warn', 'auth-middleware');
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    try {
      log('Verificando token JWT', 'debug', 'auth-middleware');
      // Usar o método verifyToken do authController que já lida com o erro da coluna 'role'
      const decodedUser = await verifyToken(token);
      
      // Adicionar o usuário decodificado à requisição
      req.user = decodedUser;
      log(`Autenticação bem-sucedida para usuário ID: ${decodedUser.id}`, 'info', 'auth-middleware');
      next();
    } catch (error) {
      logError('Erro ao verificar token JWT', error, 'auth-middleware');
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  } catch (error) {
    logError('Erro no middleware de autenticação', error, 'auth-middleware');
    return res.status(500).json({ 
      message: 'Erro interno no servidor',
      error: environment.IS_DEVELOPMENT ? error.message : undefined
    });
  }
};
