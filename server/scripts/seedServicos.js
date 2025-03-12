// Script para inserir serviços reais no banco de dados
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const prisma = new PrismaClient();

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Função principal para adicionar serviços de exemplo ao banco de dados
 * @version 1.2.0 - Adicionado suporte para sincronização com dados de demonstração
 * @date 2025-03-11
 */
async function main() {
  try {
    console.log('🔄 Iniciando processo de cadastro de serviços...');
    
    // Limpar serviços existentes (opcional)
    console.log('🗑️ Removendo serviços existentes...');
    await prisma.servico.deleteMany({});
    
    // Definindo os serviços a serem cadastrados
    const servicosPrecificados = [
      {
        nome: 'Ensaio Fotográfico Pessoal',
        descricao:
          'Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal. Direção de poses, edição profissional básica e entrega digital em alta resolução.',
        preco_base: 200.00,
        duracao_media_captura: '2 a 3 horas',
        versoes: [
          {
            tipo: 'Captura',
            descricao:
              'Sessão individual com captação de fotos e correção básica de cor. (Entrega: 20 fotos “in natura” com ajustes mínimos.)',
            preco: 200.00,
            duracao_media_captura: '2 a 3 horas',
            duracao_media_tratamento: 'até 7 dias úteis'
          },
          {
            tipo: 'Complemento de Edição',
            descricao: 'Edição adicional para melhorar as fotos capturadas.',
            duracao_media_tratamento: 'até 7 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao:
                  'Retoques moderados, ajustes de cor e contraste para um resultado natural.',
                preco: 50.00,
                duracao_media_tratamento: 'até 7 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao:
                  'Tratamento completo com retoques minuciosos e finalização profissional.',
                preco: 100.00,
                duracao_media_tratamento: 'até 7 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao:
              'Serviço integrado de captação e edição (opção à escolha) com preço promocional.',
            preco: 280.00,
            duracao_media_tratamento: 'até 7 dias úteis'
          }
        ],
        entregaveis: '20 fotos editadas em alta resolução',
        valor_deslocamento:
          'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Ensaio Externo de Casal ou Família',
        descricao:
          'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos, com tratamento profissional.',
        preco_base: 350.00,
        duracao_media_captura: '2 a 4 horas',
        versoes: [
          {
            tipo: 'Captura',
            descricao:
              'Sessão externa para casais/família com captação de imagens e correção básica, ideal para momentos espontâneos.',
            preco: 350.00,
            duracao_media_captura: '2 a 4 horas',
            duracao_media_tratamento: 'até 10 dias úteis'
          },
          {
            tipo: 'Complemento de Edição',
            descricao:
              'Edição adicional para realçar a naturalidade das imagens capturadas.',
            duracao_media_tratamento: 'até 10 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao:
                  'Ajustes e retoques moderados para uma entrega natural das imagens.',
                preco: 75.00,
                duracao_media_tratamento: 'até 10 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao:
                  'Edição completa com tratamento avançado e personalização de detalhes.',
                preco: 125.00,
                duracao_media_tratamento: 'até 10 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao:
              'Serviço completo com captação e edição avançada inclusa, com preço promocional.',
            preco: 450.00,
            duracao_media_tratamento: 'até 10 dias úteis'
          }
        ],
        entregaveis: '30 fotos editadas em alta resolução',
        valor_deslocamento:
          'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Cobertura Fotográfica de Evento Social',
        descricao:
          'Cobertura profissional de fotos em eventos como aniversários, batizados e eventos corporativos.',
        preco_base: 600.00,
        duracao_media_captura: '4 horas',
        versoes: [
          {
            tipo: 'Captura',
            descricao:
              'Cobertura completa do evento com captação de imagens e correção básica para registrar momentos importantes.',
            preco: 600.00,
            duracao_media_captura: '4 horas',
            duracao_media_tratamento: 'até 10 dias úteis'
          },
          {
            tipo: 'Complemento de Edição',
            descricao:
              'Edição adicional para aprimorar as imagens capturadas no evento.',
            duracao_media_tratamento: 'até 10 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao:
                  'Retoques e ajustes moderados para um resultado natural.',
                preco: 200.00,
                duracao_media_tratamento: 'até 10 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao:
                  'Edição completa com tratamento avançado, realçando detalhes e emoções.',
                preco: 300.00,
                duracao_media_tratamento: 'até 10 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao:
              'Serviço integrado com captação e edição avançada inclusa, a preço promocional.',
            preco: 850.00,
            duracao_media_tratamento: 'até 10 dias úteis'
          }
        ],
        entregaveis: '40 fotos editadas em alta resolução',
        valor_deslocamento:
          'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Filmagem de Evento Social (Solo)',
        descricao:
          'Filmagem profissional para eventos sociais e corporativos, com edição dinâmica e trilha sonora.',
        preco_base: 1000.00,
        duracao_media_captura: '4 horas',
        versoes: [
          {
            tipo: 'Captura de Vídeo',
            descricao:
              'Filmagem do evento com envio dos arquivos já colorizados e cortados, sem edição completa.',
            preco: 1000.00,
            duracao_media_captura: '4 horas',
            duracao_media_tratamento: 'até 15 dias úteis'
          },
          {
            tipo: 'Complemento de Edição de Vídeo',
            descricao:
              'Edição adicional para aprimorar o material capturado.',
            duracao_media_tratamento: 'até 15 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao:
                  'Montagem e cortes com ajustes básicos para um vídeo coeso.',
                preco: 300.00,
                duracao_media_tratamento: 'até 15 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao:
                  'Pós-produção completa com trilha sonora, efeitos e tratamento avançado.',
                preco: 500.00,
                duracao_media_tratamento: 'até 15 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao:
              'Serviço completo de filmagem com edição avançada inclusa, a preço promocional.',
            preco: 1400.00,
            duracao_media_tratamento: 'até 15 dias úteis'
          }
        ],
        entregaveis: 'vídeo editado de 3 a 5 minutos',
        valor_deslocamento:
          'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Fotografia Aérea com Drone',
        descricao:
          'Imagens aéreas profissionais para imóveis, paisagens ou eventos.',
        preco_base: 400.00,
        duracao_media_captura: '2 horas',
        versoes: [
          {
            tipo: 'Captura Aérea',
            descricao:
              'Captação de imagens aéreas com drone, com correção básica aplicada.',
            preco: 400.00,
            duracao_media_captura: '2 horas',
            duracao_media_tratamento: 'até 7 dias úteis'
          },
          {
            tipo: 'Complemento de Edição para Fotos Aéreas',
            descricao:
              'Edição adicional para aprimorar as fotos captadas pelo drone.',
            duracao_media_tratamento: 'até 7 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao:
                  'Ajustes e retoques simples para melhorar a qualidade das imagens.',
                preco: 100.00,
                duracao_media_tratamento: 'até 7 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao:
                  'Tratamento avançado com realce de detalhes e correção minuciosa.',
                preco: 150.00,
                duracao_media_tratamento: 'até 7 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao:
              'Serviço completo com captação e edição avançada de imagens aéreas, a preço promocional.',
            preco: 520.00,
            duracao_media_tratamento: 'até 7 dias úteis'
          }
        ],
        entregaveis: '15 fotos aéreas editadas',
        valor_deslocamento:
          'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Filmagem Aérea com Drone',
        descricao:
          'Filmagens aéreas para eventos, vídeos institucionais ou publicidade, com edição profissional.',
        preco_base: 600.00,
        duracao_media_captura: '2 horas',
        versoes: [
          {
            tipo: 'Captura de Vídeo Aéreo',
            descricao:
              'Filmagem aérea com drone, com entrega dos arquivos cortados e colorizados, sem edição completa.',
            preco: 600.00,
            duracao_media_captura: '2 horas',
            duracao_media_tratamento: 'até 12 dias úteis'
          },
          {
            tipo: 'Complemento de Edição de Vídeo Aéreo',
            descricao:
              'Edição adicional para aprimorar o vídeo capturado pelo drone.',
            duracao_media_tratamento: 'até 12 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao:
                  'Montagem e ajustes básicos para um vídeo dinâmico.',
                preco: 150.00,
                duracao_media_tratamento: 'até 12 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao:
                  'Edição completa com efeitos, legendas e pós-produção avançada.',
                preco: 250.00,
                duracao_media_tratamento: 'até 12 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao:
              'Serviço completo de filmagem aérea com edição avançada inclusa, a preço promocional.',
            preco: 800.00,
            duracao_media_tratamento: 'até 12 dias úteis'
          }
        ],
        entregaveis: 'vídeo editado de 1 a 3 minutos',
        valor_deslocamento:
          'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Pacote VLOG Family (Ilha do Mel ou Outros Lugares)',
        descricao:
          'Produção personalizada de vlog familiar em destinos especiais com fotos e vídeos editados.',
        preco_base: 1000.00,
        duracao_media_captura: '8 a 12 horas',
        versoes: [
          {
            tipo: 'Captura',
            descricao:
              'Cobertura fotográfica e de vídeo durante 8 a 12 horas, captando momentos espontâneos e dirigidos.',
            preco: 1000.00,
            duracao_media_captura: '8 a 12 horas',
            duracao_media_tratamento: 'até 20 dias úteis'
          },
          {
            tipo: 'Complemento de Edição para VLOG',
            descricao:
              'Edição adicional para integrar fotos e vídeos em um produto final dinâmico.',
            duracao_media_tratamento: 'até 20 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao:
                  'Montagem e cortes básicos para criar um vídeo coeso e atraente.',
                preco: 300.00,
                duracao_media_tratamento: 'até 20 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao:
                  'Pós-produção completa com trilha sonora, efeitos e edição avançada para fotos e vídeo.',
                preco: 600.00,
                duracao_media_tratamento: 'até 20 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao:
              'Serviço completo de VLOG com captação e edição avançada inclusa, oferecido a preço promocional.',
            preco: 1500.00,
            duracao_media_tratamento: 'até 20 dias úteis'
          }
        ],
        entregaveis:
          'vídeo principal (10 min), teaser (1 a 3 min), fotos editadas',
        valor_deslocamento:
          'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km + despesas adicionais por conta do cliente'
      },
      {
        nome: 'Pacote VLOG Friends & Community',
        descricao:
          'Pacote exclusivo para grupos de amigos ou comunidades, perfeito para registrar viagens, encontros ou eventos colaborativos com fotos e vídeos profissionais.',
        preco_base: 900.00,
        duracao_media_captura: '6 a 10 horas',
        versoes: [
          {
            tipo: 'Captura',
            descricao:
              'Cobertura fotográfica e de vídeo para grupos, realizada em 6 a 10 horas para registrar viagens, encontros ou eventos colaborativos.',
            preco: 900.00,
            duracao_media_captura: '6 a 10 horas',
            duracao_media_tratamento: 'até 14 dias úteis'
          },
          {
            tipo: 'Complemento de Edição para VLOG',
            descricao:
              'Edição adicional para integrar fotos e vídeos de forma dinâmica.',
            duracao_media_tratamento: 'até 14 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao:
                  'Montagem e ajustes básicos para um vídeo dinâmico e fotos com edição leve.',
                preco: 200.00,
                duracao_media_tratamento: 'até 14 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao:
                  'Edição completa com pós-produção avançada para vídeo e fotos, com cortes precisos e integração de efeitos.',
                preco: 300.00,
                duracao_media_tratamento: 'até 14 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao:
              'Serviço completo com captação e edição avançada inclusa, a preço promocional para grupos.',
            preco: 1300.00,
            duracao_media_tratamento: 'até 14 dias úteis'
          }
        ],
        entregaveis:
          'vídeo principal (7 a 10 min), teaser (até 2 min), 30 fotos editadas',
        valor_deslocamento:
          'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km + despesas adicionais por conta do cliente'
      }
    ];
        
    // Inserindo os serviços no banco de dados
    console.log('📝 Inserindo serviços no banco de dados...');
    let servicosInseridos = 0;
    
    // Função para criar um serviço no banco de dados
    async function criarServico(nome, descricao, preco, duracao_captura, duracao_tratamento, entregaveis, adicionais, deslocamento) {
      try {
        await prisma.servico.create({
          data: {
            nome: nome,
            descricao: descricao,
            preco_base: preco,
            duracao_media_captura: duracao_captura,
            duracao_media_tratamento: duracao_tratamento,
            entregaveis: entregaveis || '',
            possiveis_adicionais: adicionais || '',
            valor_deslocamento: deslocamento || 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
          }
        });
        console.log(`✅ Serviço inserido: ${nome}`);
        servicosInseridos++;
      } catch (error) {
        console.error(`❌ Erro ao inserir serviço ${nome}:`, error);
      }
    }
    
    // Processar todos os serviços, versões e opções
    for (const servico of servicosPrecificados) {
      try {
        // Extrair possíveis adicionais das opções
        let possiveis_adicionais = '';
        if (servico.versoes) {
          const opcoes = servico.versoes
            .filter(v => v.opcoes)
            .flatMap(v => v.opcoes)
            .map(o => o.nome);
          
          if (opcoes.length > 0) {
            possiveis_adicionais = opcoes.join(', ');
          }
        }
        
        // Criar o serviço principal
        await criarServico(
          servico.nome,
          servico.descricao,
          servico.preco_base,
          servico.duracao_media_captura,
          servico.versoes?.[0]?.duracao_media_tratamento || 'até 7 dias úteis',
          servico.entregaveis,
          possiveis_adicionais,
          servico.valor_deslocamento
        );
        
        // Criar as versões como serviços separados
        if (servico.versoes) {
          for (const versao of servico.versoes) {
            // Pular a versão "Captura" que já é o serviço principal
            if (versao.tipo === 'Captura' || versao.tipo === 'Captura Aérea' || versao.tipo === 'Captura de Vídeo' || versao.tipo === 'Captura de Vídeo Aéreo') {
              continue;
            }
            
            // Criar a versão como um serviço
            const nomeVersao = `${servico.nome} - ${versao.tipo}`;
            await criarServico(
              nomeVersao,
              versao.descricao,
              versao.preco || 0,
              versao.duracao_media_captura || servico.duracao_media_captura,
              versao.duracao_media_tratamento || 'até 10 dias úteis',
              servico.entregaveis,
              '',
              servico.valor_deslocamento
            );
            
            // Criar as opções como serviços separados
            if (versao.opcoes) {
              for (const opcao of versao.opcoes) {
                const nomeOpcao = `${servico.nome} - ${versao.tipo} - ${opcao.nome}`;
                await criarServico(
                  nomeOpcao,
                  opcao.descricao,
                  opcao.preco || 0,
                  versao.duracao_media_captura || servico.duracao_media_captura,
                  opcao.duracao_media_tratamento || versao.duracao_media_tratamento || 'até 10 dias úteis',
                  servico.entregaveis,
                  '',
                  servico.valor_deslocamento
                );
              }
            }
          }
        }
         
      } catch (error) {
        console.error(`❌ Erro ao inserir serviço ${servico.nome}:`, error);
      }
    }
    
    console.log(`\n📊 Total de serviços inseridos: ${servicosInseridos}`);
    console.log('🔍 Incluindo serviços principais, versões e opções');
 
    // Consultando os serviços cadastrados para confirmar
    const servicosCadastrados = await prisma.servico.findMany();
    console.log(`\n🎉 Processo concluído! ${servicosCadastrados.length} serviços cadastrados:`);
    console.table(servicosCadastrados.map(s => ({
      id: s.id,
      nome: s.nome,
      preco_base: s.preco_base
    })));
    
    return servicosCadastrados;
    
  } catch (error) {
    console.error('❌ Erro ao cadastrar serviços:', error);
    throw error;
  }
}

/**
 * Função para sincronizar os dados de demonstração com os dados do banco
 * Garante que o simulador de preços use os mesmos dados do painel administrativo
 * mesmo quando a API não estiver disponível
 * 
 * @version 1.0.0
 * @date 2025-03-11
 */
async function sincronizarDadosDemonstracao() {
  try {
    console.log('\n🔄 Iniciando sincronização dos dados de demonstração...');
    
    // Buscar todos os serviços do banco de dados
    const servicos = await prisma.servico.findMany({
      orderBy: {
        nome: 'asc'
      }
    });
    
    if (servicos.length === 0) {
      console.error('❌ Nenhum serviço encontrado no banco de dados. Abortando sincronização.');
      return;
    }
    
    // Transformar os serviços para o formato do PriceSimulator
    const servicosTransformados = servicos.map(servico => {
      // Calcula a duração média aproximada baseada nos campos individuais
      const duracaoCaptura = parseInt(servico.duracao_media_captura?.split(' ')[0] || 0);
      const duracaoTratamento = parseInt(servico.duracao_media_tratamento?.split(' ')[0] || 0);
      const duracaoMedia = Math.ceil((duracaoCaptura + duracaoTratamento) / 2) || 3; // Fallback para 3 dias
      
      return {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        preco_base: servico.preco_base,
        duracao_media: duracaoMedia,
        detalhes: {
          captura: servico.duracao_media_captura || '',
          tratamento: servico.duracao_media_tratamento || '',
          entregaveis: servico.entregaveis || '',
          adicionais: servico.possiveis_adicionais || '',
          deslocamento: servico.valor_deslocamento || ''
        }
      };
    });
    
    // Caminho para o arquivo de dados de demonstração
    const caminhoArquivo = path.resolve(__dirname, '../../src/data/servicos.js');
    
    // Criar o conteúdo do arquivo
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const conteudoArquivo = `/**
 * Dados de serviços para o Simulador de Preços - Versão 2.0
 * Este arquivo centraliza os dados para uso consistente entre a API e o fallback
 * Última atualização: ${dataAtual}
 * ATENÇÃO: Este arquivo é gerado automaticamente pelo script seedServicos.js
 * Não edite manualmente!
 */

export const servicos = ${JSON.stringify(servicosTransformados, null, 2)};
`;
    
    // Escrever o arquivo
    await fs.writeFile(caminhoArquivo, conteudoArquivo, 'utf8');
    
    console.log(`✅ Dados de demonstração sincronizados com sucesso! (${servicosTransformados.length} serviços)`);
    console.log(`📝 Arquivo atualizado: ${caminhoArquivo}`);
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar dados de demonstração:', error);
  }
}

/**
 * Função principal que executa o script
 * Primeiro insere os serviços no banco de dados
 * Depois pergunta se deseja sincronizar os dados de demonstração
 */
async function executarScript() {
  try {
    // Executar a função principal para seed dos serviços
    await main();
    
    // Perguntar ao usuário se deseja sincronizar os dados de demonstração
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n🔄 Deseja sincronizar os dados de demonstração com os dados do banco? (s/n) ', async (resposta) => {
      if (resposta.toLowerCase() === 's') {
        await sincronizarDadosDemonstracao();
      } else {
        console.log('❌ Sincronização de dados de demonstração cancelada.');
      }
      
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Erro ao executar o script:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Executando o script
executarScript();
