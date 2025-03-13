import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { verifyToken } from '../controllers/authController.js';

dotenv.config();

/**
 * Middleware para autenticação JWT
 * Verifica se o token JWT é válido e adiciona o usuário decodificado à requisição
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    try {
      // Usar o método verifyToken do authController que já lida com o erro da coluna 'role'
      const decodedUser = await verifyToken(token);
      
      // Adicionar o usuário decodificado à requisição
      req.user = decodedUser;
      next();
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};
