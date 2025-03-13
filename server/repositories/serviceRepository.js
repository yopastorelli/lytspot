/**
 * Repositório para acesso a dados de serviços
 * 
 * Responsável por encapsular o acesso ao banco de dados para operações relacionadas a serviços,
 * incluindo listagem, criação, atualização, exclusão e consultas.
 * 
 * @version 1.6.0 - 2025-03-13 - Implementadas melhorias na persistência de dados e tratamento de erros
 * @module repositories/serviceRepository
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Cliente Prisma para acesso ao banco de dados
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Obter diretório atual para logs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const logDir = path.resolve(rootDir, 'logs');

// Garantir que o diretório de logs exista
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Contador de tentativas de reconexão
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000; // 2 segundos

// Função para registrar logs de erro
function logError(operation, error, data = {}) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [ERROR] [${operation}] ${error.message}\n`;
  const detailedLog = {
    timestamp,
    operation,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    data
  };
  
  // Log no console
  console.error(`❌ Erro em ${operation}:`, error);
  
  // Log em arquivo
  try {
    const logPath = path.join(logDir, 'database-errors.log');
    fs.appendFileSync(logPath, logMessage);
    
    const detailedLogPath = path.join(logDir, 'detailed-errors.json');
    let existingLogs = [];
    if (fs.existsSync(detailedLogPath)) {
      try {
        const content = fs.readFileSync(detailedLogPath, 'utf8');
        existingLogs = JSON.parse(content);
      } catch (e) {
        // Ignorar erro de parse, começar com array vazio
      }
    }
    
    existingLogs.push(detailedLog);
    // Manter apenas os últimos 100 logs
    if (existingLogs.length > 100) {
      existingLogs = existingLogs.slice(-100);
    }
    
    fs.writeFileSync(detailedLogPath, JSON.stringify(existingLogs, null, 2));
  } catch (logError) {
    console.error('Erro ao registrar log:', logError);
  }
}

/**
 * Repositório para gerenciar operações de banco de dados relacionadas a serviços
 */
class ServiceRepository {
  /**
   * Busca todos os serviços com opções de filtragem
   * @param {Object} options Opções de consulta
   * @param {Object} options.orderBy Ordenação dos resultados
   * @param {Object} options.where Filtros para a consulta
   * @param {number} options.take Número máximo de registros
   * @param {number} options.skip Número de registros para pular
   * @returns {Promise<Array>} Lista de serviços
   */
  async findAll(options = {}) {
    try {
      const { orderBy = { nome: 'asc' }, where = {}, take, skip } = options;
      
      // Verificar conexão com o banco de dados antes de tentar buscar
      await this.testDatabaseConnection();
      
      return prisma.servico.findMany({
        orderBy,
        where,
        take,
        skip
      });
    } catch (error) {
      logError('findAll', error, options);
      
      // Tentar reconectar e repetir a operação
      if (this.shouldRetry(error)) {
        console.log('Tentando reconectar e repetir a operação findAll...');
        await this.reconnect();
        return this.findAll(options);
      }
      
      throw new Error(`Erro ao buscar serviços: ${error.message}`);
    }
  }

  /**
   * Busca um serviço pelo ID
   * @param {number} id ID do serviço
   * @returns {Promise<Object|null>} Serviço encontrado ou null
   */
  async findById(id) {
    try {
      // Verificar conexão com o banco de dados antes de tentar buscar
      await this.testDatabaseConnection();
      
      return prisma.servico.findUnique({
        where: { id: Number(id) }
      });
    } catch (error) {
      logError('findById', error, { id });
      
      // Tentar reconectar e repetir a operação
      if (this.shouldRetry(error)) {
        console.log(`Tentando reconectar e repetir a operação findById para ID ${id}...`);
        await this.reconnect();
        return this.findById(id);
      }
      
      throw new Error(`Erro ao buscar serviço ${id}: ${error.message}`);
    }
  }

  /**
   * Busca um serviço pelo nome
   * @param {string} nome Nome do serviço
   * @returns {Promise<Object|null>} Serviço encontrado ou null
   */
  async findByName(nome) {
    try {
      // Verificar conexão com o banco de dados antes de tentar buscar
      await this.testDatabaseConnection();
      
      return prisma.servico.findFirst({
        where: { nome }
      });
    } catch (error) {
      logError('findByName', error, { nome });
      
      // Tentar reconectar e repetir a operação
      if (this.shouldRetry(error)) {
        console.log(`Tentando reconectar e repetir a operação findByName para nome ${nome}...`);
        await this.reconnect();
        return this.findByName(nome);
      }
      
      throw new Error(`Erro ao buscar serviço ${nome}: ${error.message}`);
    }
  }

  /**
   * Cria um novo serviço no banco de dados
   * 
   * @param {Object} data Dados do serviço a ser criado
   * @returns {Promise<Object>} Serviço criado
   */
  async create(data) {
    try {
      console.log('Tentando criar serviço com dados:', JSON.stringify(data, null, 2));
      
      // Sanitizar dados antes de criar
      const sanitizedData = this.sanitizeServiceData(data);
      console.log('Dados sanitizados:', JSON.stringify(sanitizedData, null, 2));
      
      // Verificar conexão com o banco de dados antes de tentar criar
      await this.testDatabaseConnection();
      
      // Criar serviço no banco de dados
      const service = await prisma.servico.create({
        data: sanitizedData
      });
      
      console.log('Serviço criado com sucesso:', service);
      
      // Verificar se o serviço foi realmente criado
      const createdService = await this.findById(service.id);
      if (!createdService) {
        throw new Error('Serviço não foi persistido no banco de dados após criação');
      }
      
      return service;
    } catch (error) {
      logError('create', error, data);
      
      // Tentar reconectar e repetir a operação
      if (this.shouldRetry(error)) {
        console.log('Tentando reconectar e repetir a operação create...');
        await this.reconnect();
        return this.create(data);
      }
      
      throw new Error(`Erro ao criar serviço: ${error.message}`);
    }
  }

  /**
   * Testa a conexão com o banco de dados
   * 
   * @returns {Promise<boolean>} Verdadeiro se a conexão estiver funcionando
   * @throws {Error} Se a conexão falhar
   */
  async testDatabaseConnection() {
    try {
      // Executar uma consulta simples para testar a conexão
      await prisma.$queryRaw`SELECT 1`;
      
      // Resetar contador de tentativas se a conexão for bem-sucedida
      reconnectAttempts = 0;
      
      return true;
    } catch (error) {
      logError('testDatabaseConnection', error);
      
      // Verificar arquivo do banco de dados
      this.checkDatabaseFile();
      
      throw new Error(`Erro ao testar conexão com o banco de dados: ${error.message}`);
    }
  }
  
  /**
   * Verifica se o arquivo do banco de dados existe e tem permissões corretas
   */
  checkDatabaseFile() {
    try {
      // Obter caminho do banco de dados da variável de ambiente
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        console.error('DATABASE_URL não definida');
        return;
      }
      
      // Extrair caminho do arquivo
      let dbPath;
      if (dbUrl.startsWith('file:')) {
        dbPath = dbUrl.replace('file:', '');
        
        // Se o caminho for relativo, torná-lo absoluto
        if (!path.isAbsolute(dbPath)) {
          dbPath = path.resolve(rootDir, dbPath);
        }
      } else {
        console.error('DATABASE_URL não é um caminho de arquivo SQLite');
        return;
      }
      
      console.log(`Verificando arquivo de banco de dados: ${dbPath}`);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(dbPath)) {
        console.error(`Arquivo de banco de dados não existe: ${dbPath}`);
        
        // Tentar criar o diretório
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
          console.log(`Criando diretório: ${dbDir}`);
          fs.mkdirSync(dbDir, { recursive: true });
        }
        
        // Criar arquivo vazio
        console.log(`Criando arquivo de banco de dados: ${dbPath}`);
        fs.writeFileSync(dbPath, '');
      }
      
      // Verificar permissões
      try {
        fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
        console.log('Permissões de leitura e escrita OK');
      } catch (error) {
        console.error(`Erro de permissão: ${error.message}`);
        
        // Tentar corrigir permissões
        try {
          console.log('Tentando corrigir permissões...');
          fs.chmodSync(dbPath, 0o666);
          console.log('Permissões atualizadas');
        } catch (chmodError) {
          console.error(`Erro ao atualizar permissões: ${chmodError.message}`);
        }
      }
    } catch (error) {
      console.error(`Erro ao verificar arquivo de banco de dados: ${error.message}`);
    }
  }
  
  /**
   * Reconecta ao banco de dados após um erro
   */
  async reconnect() {
    reconnectAttempts++;
    
    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts = 0;
      throw new Error(`Falha ao reconectar após ${MAX_RECONNECT_ATTEMPTS} tentativas`);
    }
    
    console.log(`Tentativa de reconexão ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
    
    // Verificar arquivo do banco de dados
    this.checkDatabaseFile();
    
    // Aguardar antes de tentar novamente
    await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));
    
    try {
      // Desconectar e reconectar
      await prisma.$disconnect();
      await prisma.$connect();
      console.log('Reconectado com sucesso ao banco de dados');
      return true;
    } catch (error) {
      logError('reconnect', error);
      throw new Error(`Erro ao reconectar ao banco de dados: ${error.message}`);
    }
  }
  
  /**
   * Verifica se deve tentar novamente a operação após um erro
   * @param {Error} error Erro ocorrido
   * @returns {boolean} Verdadeiro se deve tentar novamente
   */
  shouldRetry(error) {
    // Lista de códigos de erro que indicam problemas de conexão ou temporários
    const retryableCodes = [
      'SQLITE_BUSY',
      'SQLITE_LOCKED',
      'SQLITE_PROTOCOL',
      'SQLITE_IOERR',
      'P1001', // Prisma: Can't reach database server
      'P1002', // Prisma: Database connection timed out
      'P1003', // Prisma: Database does not exist
      'P1008', // Prisma: Operations timed out
      'P1017', // Prisma: Server closed the connection
    ];
    
    // Verificar se o erro é retentável
    const errorCode = error.code || '';
    const errorMessage = error.message || '';
    
    // Verificar código de erro
    if (retryableCodes.some(code => errorCode.includes(code))) {
      return reconnectAttempts < MAX_RECONNECT_ATTEMPTS;
    }
    
    // Verificar mensagem de erro
    const retryableMessages = [
      'connection',
      'timeout',
      'timed out',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      'EPIPE',
      'database file',
      'database is locked',
      'unable to open database file',
    ];
    
    if (retryableMessages.some(msg => errorMessage.toLowerCase().includes(msg))) {
      return reconnectAttempts < MAX_RECONNECT_ATTEMPTS;
    }
    
    return false;
  }

  /**
   * Atualiza um serviço existente no banco de dados
   * 
   * @param {number} id ID do serviço a ser atualizado
   * @param {Object} data Novos dados do serviço
   * @returns {Promise<Object>} Serviço atualizado
   */
  async update(id, data) {
    try {
      console.log(`Tentando atualizar serviço ${id} com dados:`, JSON.stringify(data, null, 2));
      
      // Sanitizar dados antes de atualizar
      const sanitizedData = this.sanitizeServiceData(data);
      console.log('Dados sanitizados:', JSON.stringify(sanitizedData, null, 2));
      
      // Verificar conexão com o banco de dados antes de tentar atualizar
      await this.testDatabaseConnection();
      
      // Verificar se o serviço existe
      const existingService = await this.findById(id);
      if (!existingService) {
        throw new Error(`Serviço com ID ${id} não encontrado`);
      }
      
      // Atualizar serviço no banco de dados
      const service = await prisma.servico.update({
        where: { id: Number(id) },
        data: sanitizedData
      });
      
      console.log('Serviço atualizado com sucesso:', service);
      
      // Verificar se o serviço foi realmente atualizado
      const updatedService = await this.findById(id);
      if (!updatedService) {
        throw new Error('Serviço não foi persistido no banco de dados após atualização');
      }
      
      return service;
    } catch (error) {
      logError('update', error, { id, data });
      
      // Tentar reconectar e repetir a operação
      if (this.shouldRetry(error)) {
        console.log(`Tentando reconectar e repetir a operação update para ID ${id}...`);
        await this.reconnect();
        return this.update(id, data);
      }
      
      throw new Error(`Erro ao atualizar serviço ${id}: ${error.message}`);
    }
  }

  /**
   * Remove um serviço do banco de dados
   * 
   * @param {number} id ID do serviço a ser removido
   * @returns {Promise<Object>} Serviço removido
   */
  async delete(id) {
    try {
      console.log(`Tentando remover serviço ${id}`);
      
      // Verificar conexão com o banco de dados antes de tentar remover
      await this.testDatabaseConnection();
      
      // Verificar se o serviço existe
      const existingService = await this.findById(id);
      if (!existingService) {
        throw new Error(`Serviço com ID ${id} não encontrado`);
      }
      
      // Remover serviço do banco de dados
      const service = await prisma.servico.delete({
        where: { id: Number(id) }
      });
      
      console.log('Serviço removido com sucesso:', service);
      return service;
    } catch (error) {
      logError('delete', error, { id });
      
      // Tentar reconectar e repetir a operação
      if (this.shouldRetry(error)) {
        console.log(`Tentando reconectar e repetir a operação delete para ID ${id}...`);
        await this.reconnect();
        return this.delete(id);
      }
      
      throw new Error(`Erro ao remover serviço ${id}: ${error.message}`);
    }
  }

  /**
   * Conta o número de serviços com base em filtros opcionais
   * @param {Object} where Filtros para a contagem
   * @returns {Promise<number>} Número de serviços
   */
  async count(where = {}) {
    try {
      // Verificar conexão com o banco de dados antes de tentar contar
      await this.testDatabaseConnection();
      
      return prisma.servico.count({ where });
    } catch (error) {
      logError('count', error, { where });
      
      // Tentar reconectar e repetir a operação
      if (this.shouldRetry(error)) {
        console.log('Tentando reconectar e repetir a operação count...');
        await this.reconnect();
        return this.count(where);
      }
      
      throw new Error(`Erro ao contar serviços: ${error.message}`);
    }
  }

  /**
   * Verifica se um serviço existe pelo ID
   * @param {number} id ID do serviço
   * @returns {Promise<boolean>} Verdadeiro se o serviço existir
   */
  async exists(id) {
    try {
      // Verificar conexão com o banco de dados antes de tentar verificar
      await this.testDatabaseConnection();
      
      const count = await prisma.servico.count({
        where: { id: Number(id) }
      });
      
      return count > 0;
    } catch (error) {
      logError('exists', error, { id });
      
      // Tentar reconectar e repetir a operação
      if (this.shouldRetry(error)) {
        console.log(`Tentando reconectar e repetir a operação exists para ID ${id}...`);
        await this.reconnect();
        return this.exists(id);
      }
      
      throw new Error(`Erro ao verificar existência do serviço ${id}: ${error.message}`);
    }
  }

  /**
   * Sanitiza os dados de um serviço para garantir compatibilidade com o banco de dados
   * 
   * @version 1.0.2 - 2025-03-13 - Melhorado tratamento de campos numéricos e strings vazias
   * @param {Object} data Dados do serviço
   * @returns {Object} Dados sanitizados
   */
  sanitizeServiceData(data) {
    // Criar cópia para não modificar o objeto original
    const sanitizedData = { ...data };
    
    // Remover campos que não existem no modelo Prisma
    if (sanitizedData.id !== undefined) {
      delete sanitizedData.id;
    }
    
    // Garantir que campos de texto não sejam undefined
    const textFields = ['nome', 'descricao', 'duracao_media_captura', 'duracao_media_tratamento', 'entregaveis', 'possiveis_adicionais', 'valor_deslocamento'];
    textFields.forEach(field => {
      if (sanitizedData[field] === undefined || sanitizedData[field] === null) {
        sanitizedData[field] = '';
      } else if (typeof sanitizedData[field] !== 'string') {
        sanitizedData[field] = String(sanitizedData[field]);
      }
    });
    
    // Converter preço para número
    if (sanitizedData.preco_base !== undefined) {
      if (typeof sanitizedData.preco_base === 'string') {
        const cleanedValue = sanitizedData.preco_base.replace(',', '.').trim();
        sanitizedData.preco_base = parseFloat(cleanedValue) || 0;
      } else if (typeof sanitizedData.preco_base !== 'number') {
        sanitizedData.preco_base = 0;
      }
    } else {
      sanitizedData.preco_base = 0;
    }
    
    // Converter durações para número se necessário (caso o schema do banco espere números)
    if (sanitizedData.duracao_media_captura !== undefined && typeof sanitizedData.duracao_media_captura === 'string') {
      // Apenas extrair números se o campo for usado como número no banco
      // const numericValue = sanitizedData.duracao_media_captura.replace(/\D/g, '');
      // sanitizedData.duracao_media_captura = numericValue ? parseInt(numericValue, 10) : 0;
    }
    
    if (sanitizedData.duracao_media_tratamento !== undefined && typeof sanitizedData.duracao_media_tratamento === 'string') {
      // Apenas extrair números se o campo for usado como número no banco
      // const numericValue = sanitizedData.duracao_media_tratamento.replace(/\D/g, '');
      // sanitizedData.duracao_media_tratamento = numericValue ? parseInt(numericValue, 10) : 0;
    }
    
    console.log('Dados sanitizados:', sanitizedData);
    return sanitizedData;
  }
}

// Exportar uma instância única do repositório
export default new ServiceRepository();
