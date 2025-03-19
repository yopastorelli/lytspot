import { useEffect } from 'react';
import { MessageQueue } from '../utils/messageQueue';

export default function ServerWakeup() {
  useEffect(() => {
    const wakeupServer = async () => {
      try {
        // Faz uma chamada simples para acordar o servidor
        await fetch('/api/ping');
        // Processa mensagens pendentes
        await MessageQueue.processQueue();
      } catch (error) {
        console.log('Servidor indisponível, tentará novamente mais tarde');
      }
    };

    // Executa imediatamente ao montar
    wakeupServer();

    // Configura intervalo para verificar a cada 5 minutos
    const interval = setInterval(wakeupServer, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // Componente não renderiza nada
} 