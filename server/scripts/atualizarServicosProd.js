/**
 * Script para atualização em massa de serviços em ambiente de produção
 * @version 1.0.1 - 2025-03-13
 * @description Permite atualizar serviços em ambiente de produção de forma controlada
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração do ambiente
dotenv.config();
const prisma = new PrismaClient();

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuração da atualização
 * Modifique estas variáveis conforme necessário para sua atualização específica
 */
const CONFIG = {
  // Definir como true para executar a atualização, false para apenas simular
  EXECUTAR_ATUALIZACAO: true,
  
  // Filtro para selecionar quais serviços atualizar (null para todos)
  // Exemplos: { id: 1 } para um serviço específico, { ativo: true } para todos ativos
  FILTRO_SERVICOS: null,
  
  // Tipo de atualização de preço: 'fixo' ou 'percentual'
  TIPO_ATUALIZACAO_PRECO: 'percentual',
  
  // Valor para atualização de preço
  // Se TIPO_ATUALIZACAO_PRECO for 'fixo', este é o novo valor fixo
  // Se TIPO_ATUALIZACAO_PRECO for 'percentual', este é o percentual de ajuste (ex: 10 para +10%)
  VALOR_ATUALIZACAO_PRECO: 0,
  
  // Campos a atualizar (true para atualizar, false para manter)
  ATUALIZAR_CAMPOS: {
    preco_base: true,
    descricao: true,
    duracao_media_captura: true,
    duracao_media_tratamento: true,
    entregaveis: true,
    nome: true
  },
  
  // Valores para os campos (ignorados se o respectivo campo em ATUALIZAR_CAMPOS for false)
  VALORES_CAMPOS: {
    // Valores padrão (usados apenas se não houver valores específicos para o serviço)
    descricao: "Descrição padrão",
    duracao_media_captura: "2 a 3 horas",
    duracao_media_tratamento: "até 10 dias úteis",
    entregaveis: "30 fotos editadas em alta resolução",
    
    // Valores específicos para cada serviço
    servicos: {
      // VLOG - Aventuras em Família (ID 7)
      7: {
        nome: "VLOG - Aventuras em Família",
        descricao: "Documentação em vídeo e foto da sua viagem em família. Um dia na praia, no campo, na montanha ou em pontos turísticos nos arredores da Grande Curitiba.",
        preco_base: 1500,
        duracao_media_captura: "6 a 8 horas",
        duracao_media_tratamento: "até 30 dias",
        entregaveis: "Vídeo editado de até 15 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 70 fotos em alta resolução. Entrega digital via link seguro e exclusivo."
      },
      
      // VLOG - Amigos e Comunidade (ID 8)
      8: {
        nome: "VLOG - Amigos e Comunidade",
        descricao: "Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades, perfeita para registrar viagens, encontros ou eventos colaborativos.",
        preco_base: 900,
        duracao_media_captura: "3 a 4 horas",
        duracao_media_tratamento: "até 15 dias",
        entregaveis: "Vídeo editado de até 10 minutos + Vídeo Highlights (melhores momentos) de 1 minuto + 50 fotos em alta resolução. Entrega digital via link seguro e exclusivo."
      },
      
      // Cobertura Fotográfica de Evento Social (ID 3)
      3: {
        nome: "Cobertura Fotográfica de Evento Social",
        descricao: "Registro fotográfico completo de eventos sociais como aniversários, formaturas e confraternizações. Fotos espontâneas (estilo fotojornalismo documental) e fotos posadas de grupos e individuais.",
        preco_base: 700,
        duracao_media_captura: "3 a 4 horas",
        duracao_media_tratamento: "até 10 dias",
        entregaveis: "250 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo."
      },
      
      // Filmagem de Evento Social (ID 4)
      4: {
        nome: "Filmagem de Evento Social",
        descricao: "Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.",
        preco_base: 800,
        duracao_media_captura: "3 a 4 horas",
        duracao_media_tratamento: "até 20 dias",
        entregaveis: "Vídeo editado de até 5 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo."
      },
      
      // Ensaio Fotográfico de Família (ID 2)
      2: {
        nome: "Ensaio Fotográfico de Família",
        descricao: "Sessão fotográfica em ambiente externo para famílias. Foco em momentos espontâneos e com luz natural. Inclui direção de poses de fotos em grupo ou individuais.",
        preco_base: 450,
        duracao_media_captura: "1 a 2 horas",
        duracao_media_tratamento: "até 10 dias",
        entregaveis: "70 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo."
      },
      
      // Filmagem Aérea com Drone (ID 6)
      6: {
        nome: "Filmagem Aérea com Drone",
        descricao: "Captação de vídeos aéreos para ensaios de família, eventos sociais, imóveis e arquitetura ou projetos especiais, com equipamento profissional e piloto certificado.",
        preco_base: 450,
        duracao_media_captura: "1 a 2 horas",
        duracao_media_tratamento: "até 10 dias",
        entregaveis: "Vídeo editado de até 2 minutos em 4K ou Full HD com tratamento básico de cores. Entrega digital via link seguro e exclusivo."
      },
      
      // Fotografia Aérea com Drone (ID 5)
      5: {
        nome: "Fotografia Aérea com Drone",
        descricao: "Captura de imagens aéreas de propriedades, eventos ou locações, com equipamento profissional e piloto certificado.",
        preco_base: 350,
        duracao_media_captura: "1 a 2 horas",
        duracao_media_tratamento: "até 10 dias",
        entregaveis: "30 fotos em alta resolução, selecionadas, organizadas e com tratamento básico de cores. Entrega digital via link seguro e exclusivo."
      },
      
      // Ensaio Fotográfico Pessoal (ID 1) - Desativado
      1: {
        nome: "Ensaio Fotográfico Pessoal",
        descricao: "Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal.",
        preco_base: 350,
        duracao_media_captura: "1 a 2 horas",
        duracao_media_tratamento: "7 dias úteis",
        entregaveis: "20 fotos editadas em alta resolução",
        ativo: false
      }
    }
  },
  
  // Sincronizar dados de demonstração após a atualização
  SINCRONIZAR_DADOS: true
};

/**
 * Função para atualizar um serviço com valores específicos
 */
async function atualizarServicoComValoresEspecificos(servico, dadosAtualizados) {
  // Verificar se há valores específicos para este serviço
  const valoresEspecificos = CONFIG.VALORES_CAMPOS.servicos[servico.id];
  
  if (valoresEspecificos) {
    // Usar os valores específicos para este serviço
    if (CONFIG.ATUALIZAR_CAMPOS.preco_base && valoresEspecificos.preco_base !== undefined) {
      dadosAtualizados.preco_base = valoresEspecificos.preco_base;
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.descricao && valoresEspecificos.descricao !== undefined) {
      dadosAtualizados.descricao = valoresEspecificos.descricao;
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_captura && valoresEspecificos.duracao_media_captura !== undefined) {
      dadosAtualizados.duracao_media_captura = valoresEspecificos.duracao_media_captura;
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_tratamento && valoresEspecificos.duracao_media_tratamento !== undefined) {
      dadosAtualizados.duracao_media_tratamento = valoresEspecificos.duracao_media_tratamento;
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.entregaveis && valoresEspecificos.entregaveis !== undefined) {
      dadosAtualizados.entregaveis = valoresEspecificos.entregaveis;
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.nome && valoresEspecificos.nome !== undefined) {
      dadosAtualizados.nome = valoresEspecificos.nome;
    }
    
    if (valoresEspecificos.ativo !== undefined) {
      dadosAtualizados.ativo = valoresEspecificos.ativo;
    }
    
    return true;
  }
  
  return false;
}

/**
 * Função principal para atualização em massa
 */
async function atualizarServicosEmMassa() {
  try {
    console.log('\n🔄 Iniciando atualização em massa de serviços em produção...\n');
    
    if (!CONFIG.EXECUTAR_ATUALIZACAO) {
      console.log('⚠️ MODO SIMULAÇÃO: Nenhuma alteração será salva no banco de dados.');
      console.log('⚠️ Para executar a atualização, altere CONFIG.EXECUTAR_ATUALIZACAO para true.\n');
    }
    
    // Verificar conexão com o banco de dados
    try {
      const totalServicos = await prisma.servico.count();
      console.log(`✅ Conexão com banco de dados estabelecida. Total de serviços: ${totalServicos}`);
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error.message);
      return;
    }
    
    // Obter serviços com base no filtro
    const filtro = CONFIG.FILTRO_SERVICOS || {};
    const servicos = await prisma.servico.findMany({
      where: filtro,
      orderBy: { id: 'asc' }
    });
    
    if (servicos.length === 0) {
      console.error('❌ Nenhum serviço encontrado com os critérios especificados.');
      return;
    }
    
    console.log(`📋 Encontrados ${servicos.length} serviços para atualização.`);
    
    // Exibir serviços que serão atualizados
    console.log('\n📋 Serviços que serão atualizados:');
    servicos.forEach((servico, index) => {
      console.log(`${index + 1}. ${servico.nome} (ID: ${servico.id}) - R$ ${servico.preco_base.toFixed(2)}`);
    });
    
    // Exibir configuração da atualização
    console.log('\n⚙️ Configuração da atualização:');
    
    if (CONFIG.ATUALIZAR_CAMPOS.preco_base) {
      if (CONFIG.TIPO_ATUALIZACAO_PRECO === 'percentual') {
        console.log(`- Preço Base: Ajuste de ${CONFIG.VALOR_ATUALIZACAO_PRECO > 0 ? '+' : ''}${CONFIG.VALOR_ATUALIZACAO_PRECO}%`);
      } else {
        console.log(`- Preço Base: Valor fixo de R$ ${CONFIG.VALOR_ATUALIZACAO_PRECO.toFixed(2)}`);
      }
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.descricao) {
      console.log(`- Descrição: Valores específicos por serviço`);
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_captura) {
      console.log(`- Duração Média (Captura): Valores específicos por serviço`);
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_tratamento) {
      console.log(`- Duração Média (Tratamento): Valores específicos por serviço`);
    }
    
    if (CONFIG.ATUALIZAR_CAMPOS.entregaveis) {
      console.log(`- Entregáveis: Valores específicos por serviço`);
    }
    
    console.log(`- Sincronizar dados após atualização: ${CONFIG.SINCRONIZAR_DADOS ? 'Sim' : 'Não'}`);
    
    // Executar a atualização
    console.log('\n🔄 Executando atualização...');
    
    const resultados = [];
    const erros = [];
    
    for (const servico of servicos) {
      try {
        const dadosAtualizados = {};
        
        // Tentar atualizar com valores específicos
        const usouValoresEspecificos = await atualizarServicoComValoresEspecificos(servico, dadosAtualizados);
        
        // Se não usou valores específicos, usar a lógica padrão
        if (!usouValoresEspecificos) {
          // Atualizar preço base
          if (CONFIG.ATUALIZAR_CAMPOS.preco_base) {
            if (CONFIG.TIPO_ATUALIZACAO_PRECO === 'percentual') {
              const percentual = CONFIG.VALOR_ATUALIZACAO_PRECO / 100;
              const valorAtual = parseFloat(servico.preco_base);
              const aumento = valorAtual * percentual;
              dadosAtualizados.preco_base = valorAtual + aumento;
            } else {
              dadosAtualizados.preco_base = CONFIG.VALOR_ATUALIZACAO_PRECO;
            }
          }
          
          // Atualizar outros campos
          if (CONFIG.ATUALIZAR_CAMPOS.descricao) {
            dadosAtualizados.descricao = CONFIG.VALORES_CAMPOS.descricao;
          }
          
          if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_captura) {
            dadosAtualizados.duracao_media_captura = CONFIG.VALORES_CAMPOS.duracao_media_captura;
          }
          
          if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_tratamento) {
            dadosAtualizados.duracao_media_tratamento = CONFIG.VALORES_CAMPOS.duracao_media_tratamento;
          }
          
          if (CONFIG.ATUALIZAR_CAMPOS.entregaveis) {
            dadosAtualizados.entregaveis = CONFIG.VALORES_CAMPOS.entregaveis;
          }
        }
        
        // Exibir dados que serão atualizados
        console.log(`\n📝 Serviço: ${servico.nome} (ID: ${servico.id})`);
        console.log('   Dados atuais:');
        if (CONFIG.ATUALIZAR_CAMPOS.nome) {
          console.log(`   - Nome: "${servico.nome}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.preco_base) {
          console.log(`   - Preço Base: R$ ${servico.preco_base.toFixed(2)}`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.descricao) {
          console.log(`   - Descrição: "${servico.descricao}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_captura) {
          console.log(`   - Duração Média (Captura): "${servico.duracao_media_captura}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.duracao_media_tratamento) {
          console.log(`   - Duração Média (Tratamento): "${servico.duracao_media_tratamento}"`);
        }
        if (CONFIG.ATUALIZAR_CAMPOS.entregaveis) {
          console.log(`   - Entregáveis: "${servico.entregaveis}"`);
        }
        
        console.log('   Novos dados:');
        if (dadosAtualizados.nome) {
          console.log(`   - Nome: "${dadosAtualizados.nome}"`);
        }
        if (dadosAtualizados.preco_base) {
          console.log(`   - Preço Base: R$ ${dadosAtualizados.preco_base.toFixed(2)}`);
        }
        if (dadosAtualizados.descricao) {
          console.log(`   - Descrição: "${dadosAtualizados.descricao}"`);
        }
        if (dadosAtualizados.duracao_media_captura) {
          console.log(`   - Duração Média (Captura): "${dadosAtualizados.duracao_media_captura}"`);
        }
        if (dadosAtualizados.duracao_media_tratamento) {
          console.log(`   - Duração Média (Tratamento): "${dadosAtualizados.duracao_media_tratamento}"`);
        }
        if (dadosAtualizados.entregaveis) {
          console.log(`   - Entregáveis: "${dadosAtualizados.entregaveis}"`);
        }
        if (dadosAtualizados.ativo !== undefined) {
          console.log(`   - Ativo: ${dadosAtualizados.ativo ? 'Sim' : 'Não'}`);
        }
        
        // Executar a atualização no banco de dados
        if (CONFIG.EXECUTAR_ATUALIZACAO) {
          const resultado = await prisma.servico.update({
            where: { id: servico.id },
            data: dadosAtualizados
          });
          
          resultados.push(resultado);
          console.log('   ✅ Atualização realizada com sucesso!');
        } else {
          console.log('   ℹ️ Simulação: Nenhuma alteração foi salva no banco de dados.');
        }
      } catch (error) {
        console.error(`   ❌ Erro ao atualizar serviço ${servico.id}:`, error.message);
        erros.push({ id: servico.id, erro: error.message });
      }
    }
    
    // Resumo da atualização
    console.log('\n📊 Resumo da atualização:');
    console.log(`- Total de serviços processados: ${servicos.length}`);
    console.log(`- Atualizações bem-sucedidas: ${resultados.length}`);
    console.log(`- Erros: ${erros.length}`);
    
    if (erros.length > 0) {
      console.log('\n❌ Erros encontrados:');
      erros.forEach((erro, index) => {
        console.log(`${index + 1}. Serviço ID ${erro.id}: ${erro.erro}`);
      });
    }
    
    // Sincronizar dados de demonstração
    if (CONFIG.SINCRONIZAR_DADOS && CONFIG.EXECUTAR_ATUALIZACAO) {
      console.log('\n🔄 Sincronizando dados de demonstração...');
      
      try {
        // Caminho para o script de atualização de dados de demonstração
        const scriptPath = path.join(__dirname, 'atualizarDadosDemonstracao.js');
        
        // Verificar se o script existe
        try {
          await fs.access(scriptPath);
        } catch (error) {
          console.error('❌ Script de atualização de dados de demonstração não encontrado.');
          return;
        }
        
        // Executar o script
        const { exec } = await import('child_process');
        
        exec(`node ${scriptPath}`, (error, stdout, stderr) => {
          if (error) {
            console.error('❌ Erro ao sincronizar dados de demonstração:', error.message);
            return;
          }
          
          if (stderr) {
            console.error('❌ Erro ao sincronizar dados de demonstração:', stderr);
            return;
          }
          
          console.log('✅ Dados de demonstração sincronizados com sucesso!');
          console.log(stdout);
        });
      } catch (error) {
        console.error('❌ Erro ao sincronizar dados de demonstração:', error.message);
      }
    }
    
    console.log('\n✅ Processo de atualização concluído!');
  } catch (error) {
    console.error('❌ Erro durante a atualização em massa:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função principal
atualizarServicosEmMassa()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
