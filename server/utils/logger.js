/**
 * Módulo de logging para o servidor LytSpot
 * @version 1.0.0 - 2025-03-16
 * @description Fornece funções para logging consistente no servidor
 */

/**
 * Níveis de log suportados
 */
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Configuração do logger
 */
const config = {
  // Nível mínimo de log a ser exibido (pode ser alterado em runtime)
  minLevel: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
  
  // Habilitar timestamps nos logs
  showTimestamp: true,
  
  // Formato do timestamp
  timestampFormat: () => new Date().toISOString(),
  
  // Habilitar colorização dos logs (apenas em desenvolvimento)
  colorize: process.env.NODE_ENV !== 'production'
};

/**
 * Cores ANSI para diferentes níveis de log (apenas para terminal)
 */
const COLORS = {
  [LOG_LEVELS.ERROR]: '\x1b[31m', // Vermelho
  [LOG_LEVELS.WARN]: '\x1b[33m',  // Amarelo
  [LOG_LEVELS.INFO]: '\x1b[36m',  // Ciano
  [LOG_LEVELS.DEBUG]: '\x1b[90m', // Cinza
  RESET: '\x1b[0m'                // Reset
};

/**
 * Formata uma mensagem de log
 * @param {string} level - Nível do log
 * @param {string} message - Mensagem principal
 * @param {Object} data - Dados adicionais para o log
 * @returns {string} Mensagem formatada
 */
const formatLogMessage = (level, message, data) => {
  // Componentes da mensagem
  const components = [];
  
  // Adicionar timestamp se configurado
  if (config.showTimestamp) {
    components.push(`[${config.timestampFormat()}]`);
  }
  
  // Adicionar nível de log
  components.push(`[${level}]`);
  
  // Adicionar mensagem principal
  components.push(message);
  
  // Formatar a mensagem base
  let formattedMessage = components.join(' ');
  
  // Adicionar colorização se configurado
  if (config.colorize) {
    formattedMessage = `${COLORS[level]}${formattedMessage}${COLORS.RESET}`;
  }
  
  // Adicionar dados extras se fornecidos
  if (data) {
    try {
      // Tentar formatar os dados como JSON
      const dataString = JSON.stringify(data, null, 2);
      return `${formattedMessage}\n${dataString}`;
    } catch (error) {
      // Em caso de erro ao formatar JSON, usar toString
      return `${formattedMessage}\n${data.toString()}`;
    }
  }
  
  return formattedMessage;
};

/**
 * Verifica se um nível de log deve ser exibido com base na configuração atual
 * @param {string} level - Nível do log a verificar
 * @returns {boolean} True se o log deve ser exibido
 */
const shouldLog = (level) => {
  const levels = Object.values(LOG_LEVELS);
  const configLevelIndex = levels.indexOf(config.minLevel);
  const targetLevelIndex = levels.indexOf(level);
  
  return targetLevelIndex <= configLevelIndex;
};

/**
 * Função base de log
 * @param {string} level - Nível do log
 * @param {string} message - Mensagem principal
 * @param {Object} data - Dados adicionais para o log
 */
const log = (level, message, data) => {
  // Verificar se este nível deve ser logado
  if (!shouldLog(level)) return;
  
  // Formatar a mensagem
  const formattedMessage = formatLogMessage(level, message, data);
  
  // Usar a função de console apropriada para o nível
  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(formattedMessage);
      break;
    case LOG_LEVELS.WARN:
      console.warn(formattedMessage);
      break;
    case LOG_LEVELS.DEBUG:
      console.debug(formattedMessage);
      break;
    case LOG_LEVELS.INFO:
    default:
      console.info(formattedMessage);
      break;
  }
};

/**
 * API pública do logger
 */
const logger = {
  /**
   * Loga uma mensagem de erro
   * @param {string} message - Mensagem de erro
   * @param {Object} data - Dados adicionais (opcional)
   */
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  
  /**
   * Loga uma mensagem de aviso
   * @param {string} message - Mensagem de aviso
   * @param {Object} data - Dados adicionais (opcional)
   */
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  
  /**
   * Loga uma mensagem informativa
   * @param {string} message - Mensagem informativa
   * @param {Object} data - Dados adicionais (opcional)
   */
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  
  /**
   * Loga uma mensagem de debug
   * @param {string} message - Mensagem de debug
   * @param {Object} data - Dados adicionais (opcional)
   */
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
  
  /**
   * Configura o logger
   * @param {Object} newConfig - Novas configurações
   */
  configure: (newConfig) => {
    Object.assign(config, newConfig);
  },
  
  /**
   * Define o nível mínimo de log
   * @param {string} level - Nível mínimo de log
   */
  setLevel: (level) => {
    if (LOG_LEVELS[level]) {
      config.minLevel = LOG_LEVELS[level];
    } else {
      console.warn(`Nível de log inválido: ${level}. Usando padrão: ${config.minLevel}`);
    }
  }
};

export default logger;
