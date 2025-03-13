import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware para autenticação JWT
 * Verifica se o token JWT é válido e adiciona o usuário decodificado à requisição
 */
export const authenticateJWT = (req, res, next) => {
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

  // Verificar o token
  jwt.verify(token, process.env.JWT_SECRET || 'f23e126b7f99a3e4553c65b3f558cb6a', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    
    // Adicionar o usuário decodificado à requisição
    req.user = decoded;
    next();
  });
};
