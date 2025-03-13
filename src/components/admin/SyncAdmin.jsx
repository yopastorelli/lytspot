/**
 * Componente de Administração de Sincronização
 * 
 * Este componente fornece uma interface para sincronizar dados entre o ambiente
 * de desenvolvimento e produção, permitindo manter os serviços atualizados.
 * 
 * @version 1.0.4 - 2025-03-14 - Adicionada funcionalidade para corrigir a ordem dos serviços
 */

import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { getEnvironment } from '../../utils/environment';

const SyncAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [logs, setLogs] = useState([{ type: 'info', message: 'Carregando interface de sincronização...', timestamp: new Date() }]);
  const [syncToProdResult, setSyncToProdResult] = useState(null);
  const [syncFromProdResult, setSyncFromProdResult] = useState(null);
  const [fixOrderResult, setFixOrderResult] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const logContainerRef = useRef(null);
  const [environment, setEnvironment] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  useEffect(() => {
    // Detectar ambiente
    const env = getEnvironment();
    setEnvironment(env.isDev ? 'Desenvolvimento' : 'Produção');
    setApiBaseUrl(env.baseUrl);

    addToLog(`Interface de sincronização carregada (Ambiente de ${env.isDev ? 'Desenvolvimento' : 'Produção'})`, 'info');
    addToLog(`API configurada para: ${env.baseUrl}`, 'info');
    
    // Verificar status do sistema ao carregar
    checkSystemStatus();
  }, []);

  useEffect(() => {
    // Rolar para o final do log quando novos logs são adicionados
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Função para adicionar uma entrada ao log
  const addToLog = (message, type = 'info') => {
    setLogs(prevLogs => [...prevLogs, {
      type,
      message,
      timestamp: new Date()
    }]);
  };

  // Função para verificar o status do sistema
  const checkSystemStatus = async () => {
    try {
      addToLog('Verificando status do sistema...', 'info');
      
      // Tentar com fallback para garantir que funcione mesmo com problemas de CORS
      let response;
      try {
        // Primeiro tentar com axios normal
        response = await api.get('/sync/status');
      } catch (axiosError) {
        // Se falhar, tentar com fetchWithFallback
        addToLog('Tentando método alternativo para verificar status...', 'warning');
        response = await api.fetchWithFallback('sync/status');
      }
      
      if (response.data.sucesso) {
        addToLog(`Status verificado com sucesso`, 'success');
        
        // Verificar a ordem dos serviços
        const status = response.data.status || {};
        const servicosStatus = status.servicos || {};
        
        if (servicosStatus.ordem === 'Incorreta') {
          addToLog(`ATENÇÃO: A ordem dos serviços está incorreta!`, 'warning');
        } else if (servicosStatus.servicosFaltando && servicosStatus.servicosFaltando.length > 0) {
          addToLog(`ATENÇÃO: Existem serviços faltando: ${servicosStatus.servicosFaltando.join(', ')}`, 'warning');
        } else {
          addToLog(`Ordem dos serviços verificada e está correta`, 'success');
        }
        
        setSystemStatus({
          success: true,
          data: response.data
        });
      } else {
        addToLog(`Erro ao verificar status: ${response.data.mensagem}`, 'error');
        setSystemStatus({
          success: false,
          data: response.data
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      const errorMessage = error.response?.data?.mensagem || error.message || 'Erro desconhecido';
      addToLog(`Erro ao verificar status: ${errorMessage}`, 'error');
      setSystemStatus({
        success: false,
        data: { erro: errorMessage }
      });
    }
  };

  // Função para sincronizar dados para produção
  const handleSyncToProduction = async () => {
    // Confirmar se o usuário realmente quer excluir dados existentes
    if (deleteExisting) {
      const confirm = window.confirm(
        'ATENÇÃO: Você está prestes a excluir todos os serviços existentes no banco de dados. ' +
        'Esta ação não pode ser desfeita. Deseja continuar?'
      );
      if (!confirm) return;
    }

    try {
      setLoading(true);
      addToLog(`Iniciando sincronização para produção (forceUpdate=${forceUpdate}, deleteExisting=${deleteExisting})...`);

      // Tentar com fallback para garantir que funcione mesmo com problemas de CORS
      let response;
      try {
        // Primeiro tentar com axios normal
        response = await api.post('/sync/sync-to-production', { 
          forceUpdate, 
          deleteExisting 
        });
      } catch (axiosError) {
        // Se falhar, tentar com fetchWithFallback
        addToLog('Tentando método alternativo para sincronização...', 'warning');
        response = await api.fetchWithFallback('sync/sync-to-production', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forceUpdate, deleteExisting })
        });
      }

      if (response.data.sucesso) {
        addToLog(`Sincronização para produção concluída: ${response.data.mensagem}`, 'success');
        
        // Exibir estatísticas se disponíveis
        if (response.data.estatisticas) {
          const stats = response.data.estatisticas;
          addToLog(`Estatísticas: ${stats.created} criados, ${stats.updated} atualizados, ${stats.skipped} ignorados, ${stats.errors} erros`, 'success');
        }
        
        setSyncToProdResult({
          success: true,
          data: response.data
        });
        
        // Atualizar status do sistema após sincronização
        setTimeout(() => checkSystemStatus(), 1000);
      } else {
        addToLog(`Erro na sincronização para produção: ${response.data.mensagem}`, 'error');
        setSyncToProdResult({
          success: false,
          data: response.data
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar para produção:', error);
      const errorMessage = error.response?.data?.mensagem || error.message || 'Erro desconhecido';
      addToLog(`Erro ao executar sincronização para produção: ${errorMessage}`, 'error');
      setSyncToProdResult({
        success: false,
        data: { erro: errorMessage }
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para sincronizar do banco para arquivo de demonstração
  const handleSyncFromProduction = async () => {
    try {
      setLoading(true);
      addToLog('Iniciando sincronização do banco para arquivo de demonstração...');

      // Tentar com fallback para garantir que funcione mesmo com problemas de CORS
      let response;
      try {
        // Primeiro tentar com axios normal
        response = await api.post('/sync/sync-to-demo');
      } catch (axiosError) {
        // Se falhar, tentar com fetchWithFallback
        addToLog('Tentando método alternativo para sincronização...', 'warning');
        response = await api.fetchWithFallback('sync/sync-to-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (response.data.sucesso) {
        addToLog(`Sincronização do banco para arquivo concluída: ${response.data.mensagem}`, 'success');
        setSyncFromProdResult({
          success: true,
          data: response.data
        });
        
        // Atualizar status do sistema após sincronização
        setTimeout(() => checkSystemStatus(), 1000);
      } else {
        addToLog(`Erro na sincronização do banco para arquivo: ${response.data.mensagem}`, 'error');
        setSyncFromProdResult({
          success: false,
          data: response.data
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar do banco para arquivo:', error);
      const errorMessage = error.response?.data?.mensagem || error.message || 'Erro desconhecido';
      addToLog(`Erro ao executar sincronização do banco para arquivo: ${errorMessage}`, 'error');
      setSyncFromProdResult({
        success: false,
        data: { erro: errorMessage }
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para corrigir a ordem dos serviços
  const handleFixServiceOrder = async () => {
    try {
      setLoading(true);
      addToLog('Iniciando correção da ordem dos serviços...');

      // Tentar com fallback para garantir que funcione mesmo com problemas de CORS
      let response;
      try {
        // Primeiro tentar com axios normal
        response = await api.get('/sync/fix-order');
      } catch (axiosError) {
        // Se falhar, tentar com fetchWithFallback
        addToLog('Tentando método alternativo para correção da ordem...', 'warning');
        response = await api.fetchWithFallback('sync/fix-order');
      }

      if (response.data.sucesso) {
        addToLog(`Correção da ordem dos serviços concluída: ${response.data.mensagem}`, 'success');
        
        // Exibir detalhes das atualizações se disponíveis
        if (response.data.atualizacoes && response.data.atualizacoes.length > 0) {
          addToLog(`Serviços atualizados: ${response.data.atualizacoes.length}`, 'success');
          response.data.atualizacoes.forEach(update => {
            addToLog(`- ${update.nome}: ordem ${update.ordemAnterior || 'não definida'} → ${update.ordemNova}`, 'info');
          });
        }
        
        setFixOrderResult({
          success: true,
          data: response.data
        });
        
        // Atualizar status do sistema após correção
        setTimeout(() => checkSystemStatus(), 1000);
      } else {
        addToLog(`Erro na correção da ordem dos serviços: ${response.data.mensagem}`, 'error');
        setFixOrderResult({
          success: false,
          data: response.data
        });
      }
    } catch (error) {
      console.error('Erro ao corrigir ordem dos serviços:', error);
      const errorMessage = error.response?.data?.mensagem || error.message || 'Erro desconhecido';
      addToLog(`Erro ao executar correção da ordem dos serviços: ${errorMessage}`, 'error');
      setFixOrderResult({
        success: false,
        data: { erro: errorMessage }
      });
    } finally {
      setLoading(false);
    }
  };

  // Formatação de timestamp para exibição no log
  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Renderização do componente
  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Administração de Sincronização</h2>
      
      {/* Informações do ambiente */}
      <div className="bg-gray-50 p-3 rounded-md mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Ambiente:</span> {environment}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">API:</span> {apiBaseUrl}
        </p>
      </div>
      
      {/* Status do sistema */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Status do Sistema</h3>
        <div className="flex items-center mb-2">
          {systemStatus ? (
            systemStatus.success ? (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Sistema operacional</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Problemas detectados</span>
              </div>
            )
          ) : (
            <div className="flex items-center text-gray-500">
              <svg className="animate-spin w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verificando...</span>
            </div>
          )}
          <button 
            onClick={checkSystemStatus} 
            className="ml-2 text-sm text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            Atualizar
          </button>
        </div>
        
        {systemStatus && systemStatus.success && systemStatus.data.status && (
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p className="mb-1">
              <span className="font-medium">Conexão:</span> {systemStatus.data.status.conexao}
            </p>
            <p className="mb-1">
              <span className="font-medium">Total de serviços:</span> {systemStatus.data.status.servicos.total}
            </p>
            <p className={`mb-1 ${systemStatus.data.status.servicos.ordem === 'Correta' ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-medium">Ordem dos serviços:</span> {systemStatus.data.status.servicos.ordem}
              {systemStatus.data.status.servicos.ordem !== 'Correta' && (
                <button 
                  onClick={handleFixServiceOrder}
                  className="ml-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  disabled={loading}
                >
                  Corrigir ordem
                </button>
              )}
            </p>
            {systemStatus.data.status.servicos.servicosFaltando && systemStatus.data.status.servicos.servicosFaltando.length > 0 && (
              <p className="mb-1 text-red-600">
                <span className="font-medium">Serviços faltando:</span> {systemStatus.data.status.servicos.servicosFaltando.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Opções de sincronização */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Sincronizar para Produção</h3>
          <p className="text-sm text-gray-600 mb-3">
            Sincroniza os dados de demonstração para o banco de dados.
          </p>
          <div className="flex flex-col space-y-2 mb-4">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={forceUpdate} 
                onChange={e => setForceUpdate(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Forçar atualização</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={deleteExisting} 
                onChange={e => setDeleteExisting(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Excluir existentes</span>
            </label>
          </div>
          <button
            onClick={handleSyncToProduction}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Sincronizando...' : 'Sincronizar para Produção'}
          </button>
        </div>
        
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Sincronizar para Demo</h3>
          <p className="text-sm text-gray-600 mb-3">
            Sincroniza os dados do banco de dados para os arquivos de demonstração.
          </p>
          <div className="mb-4">
            <p className="text-sm text-yellow-600">
              <svg className="inline-block w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Esta ação sobrescreverá os arquivos de demonstração.
            </p>
          </div>
          <button
            onClick={handleSyncFromProduction}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Sincronizando...' : 'Sincronizar para Demo'}
          </button>
        </div>
      </div>
      
      {/* Correção da ordem dos serviços */}
      <div className="border border-gray-200 rounded-md p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Corrigir Ordem dos Serviços</h3>
        <p className="text-sm text-gray-600 mb-3">
          Corrige a ordem dos serviços no banco de dados para seguir a ordem específica definida.
        </p>
        <button
          onClick={handleFixServiceOrder}
          disabled={loading}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
        >
          {loading ? 'Corrigindo...' : 'Corrigir Ordem dos Serviços'}
        </button>
      </div>
      
      {/* Log de atividades */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Log de Atividades</h3>
        <div 
          ref={logContainerRef}
          className="bg-gray-900 text-gray-100 p-3 rounded-md h-64 overflow-y-auto font-mono text-sm"
        >
          {logs.map((log, index) => (
            <div key={index} className={`mb-1 ${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'success' ? 'text-green-400' : 
              log.type === 'warning' ? 'text-yellow-400' : 
              'text-gray-300'
            }`}>
              <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span> {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SyncAdmin;
