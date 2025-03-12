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
        descricao: 'Sessão fotográfica individual para capturar sua melhor versão, com direção profissional e tratamento básico de imagem.',
        preco_base: 350,
        duracao_media_captura: '1 a 2 horas',
        duracao_media_tratamento: 'até 7 dias úteis',
        entregaveis: '20 fotos editadas em alta resolução',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Sessão fotográfica individual para capturar sua melhor versão, com direção profissional e tratamento básico de imagem.',
            preco: 350,
            duracao_media_captura: '1 a 2 horas',
            duracao_media_tratamento: 'até 7 dias úteis'
          },
          {
            tipo: 'Complemento de Edição',
            descricao: 'Edição adicional para realçar sua beleza natural nas imagens.',
            preco: 0,
            duracao_media_tratamento: 'até 7 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Retoques leves e ajustes de cor para um resultado natural.',
                preco: 150,
                duracao_media_tratamento: 'até 7 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Edição completa com tratamento avançado, realçando detalhes e expressões.',
                preco: 250,
                duracao_media_tratamento: 'até 10 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço completo com captação e edição avançada inclusa, com preço promocional.',
            preco: 550,
            duracao_media_captura: '1 a 2 horas',
            duracao_media_tratamento: 'até 10 dias úteis'
          }
        ]
      },
      {
        nome: 'Ensaio Externo de Casal ou Família',
        descricao: 'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos, com edição básica.',
        preco_base: 450,
        duracao_media_captura: '2 a 4 horas',
        duracao_media_tratamento: 'até 10 dias úteis',
        entregaveis: '30 fotos editadas em alta resolução',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Sessão fotográfica externa para casais e famílias, capturando momentos espontâneos e dirigidos, com edição básica.',
            preco: 450,
            duracao_media_captura: '2 a 4 horas',
            duracao_media_tratamento: 'até 10 dias úteis'
          },
          {
            tipo: 'Complemento de Edição',
            descricao: 'Edição adicional para realçar a naturalidade das imagens capturadas.',
            preco: 0,
            duracao_media_tratamento: 'até 10 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Retoques e ajustes moderados para um resultado equilibrado.',
                preco: 200,
                duracao_media_tratamento: 'até 10 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Tratamento avançado para realce de expressões e iluminação.',
                preco: 300,
                duracao_media_tratamento: 'até 14 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço completo com captação e edição avançada inclusa, com preço promocional.',
            preco: 700,
            duracao_media_captura: '2 a 4 horas',
            duracao_media_tratamento: 'até 14 dias úteis'
          }
        ]
      },
      {
        nome: 'Cobertura Fotográfica de Evento Social',
        descricao: 'Cobertura profissional para eventos como aniversários, batizados e eventos corporativos.',
        preco_base: 800,
        duracao_media_captura: '4 horas',
        duracao_media_tratamento: 'até 10 dias úteis',
        entregaveis: '40 fotos editadas em alta resolução',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Cobertura profissional para eventos como aniversários, batizados e eventos corporativos.',
            preco: 800,
            duracao_media_captura: '4 horas',
            duracao_media_tratamento: 'até 10 dias úteis'
          },
          {
            tipo: 'Complemento de Edição',
            descricao: 'Edição adicional para aprimorar as imagens capturadas no evento.',
            preco: 0,
            duracao_media_tratamento: 'até 10 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Retoques de iluminação e contraste.',
                preco: 200,
                duracao_media_tratamento: 'até 10 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Correção de cor avançada e ajustes personalizados.',
                preco: 300,
                duracao_media_tratamento: 'até 14 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço integrado com captação e edição avançada inclusa, a preço promocional.',
            preco: 1050,
            duracao_media_captura: '4 horas',
            duracao_media_tratamento: 'até 14 dias úteis'
          }
        ]
      },
      {
        nome: 'Filmagem de Evento Social (Solo)',
        descricao: 'Captação profissional de vídeo para eventos sociais, com edição básica.',
        preco_base: 1200,
        duracao_media_captura: '4 horas',
        duracao_media_tratamento: 'até 14 dias úteis',
        entregaveis: 'Vídeo editado de 3-5 minutos em alta resolução',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km',
        versoes: [
          {
            tipo: 'Captura de Vídeo',
            descricao: 'Captação profissional de vídeo para eventos sociais, com edição básica.',
            preco: 1200,
            duracao_media_captura: '4 horas',
            duracao_media_tratamento: 'até 14 dias úteis'
          },
          {
            tipo: 'Complemento de Edição de Vídeo',
            descricao: 'Edição adicional para aprimorar o vídeo do evento.',
            preco: 0,
            duracao_media_tratamento: 'até 14 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Montagem dinâmica e ajuste de cores.',
                preco: 250,
                duracao_media_tratamento: 'até 14 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Edição cinematográfica com efeitos visuais e trilha sonora personalizada.',
                preco: 400,
                duracao_media_tratamento: 'até 21 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço integrado com captação e edição avançada inclusa, a preço promocional.',
            preco: 1500,
            duracao_media_captura: '4 horas',
            duracao_media_tratamento: 'até 21 dias úteis'
          }
        ]
      },
      {
        nome: 'Fotografia Aérea com Drone',
        descricao: 'Imagens aéreas em alta resolução para imóveis, eventos e paisagens.',
        preco_base: 700,
        duracao_media_captura: '1 a 2 horas',
        duracao_media_tratamento: 'até 7 dias úteis',
        entregaveis: '15 fotos aéreas editadas',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,50/km',
        versoes: [
          {
            tipo: 'Captura Aérea',
            descricao: 'Imagens aéreas em alta resolução para imóveis, eventos e paisagens.',
            preco: 700,
            duracao_media_captura: '1 a 2 horas',
            duracao_media_tratamento: 'até 7 dias úteis'
          },
          {
            tipo: 'Complemento de Edição para Fotos Aéreas',
            descricao: 'Edição adicional para aprimorar as imagens aéreas.',
            preco: 0,
            duracao_media_tratamento: 'até 7 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Ajuste de cores e nitidez.',
                preco: 100,
                duracao_media_tratamento: 'até 7 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Correção avançada para realce de detalhes.',
                preco: 150,
                duracao_media_tratamento: 'até 10 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço integrado com captação aérea e edição avançada inclusa, a preço promocional.',
            preco: 800,
            duracao_media_captura: '1 a 2 horas',
            duracao_media_tratamento: 'até 10 dias úteis'
          }
        ]
      },
      {
        nome: 'Filmagem Aérea com Drone',
        descricao: 'Filmagens aéreas para eventos, vídeos institucionais e publicidade, com edição básica.',
        preco_base: 900,
        duracao_media_captura: '1 a 2 horas',
        duracao_media_tratamento: 'até 10 dias úteis',
        entregaveis: 'Vídeo editado de 1-2 minutos em 4K',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,50/km',
        versoes: [
          {
            tipo: 'Captura de Vídeo Aéreo',
            descricao: 'Filmagens aéreas para eventos, vídeos institucionais e publicidade, com edição básica.',
            preco: 900,
            duracao_media_captura: '1 a 2 horas',
            duracao_media_tratamento: 'até 10 dias úteis'
          },
          {
            tipo: 'Complemento de Edição de Vídeo Aéreo',
            descricao: 'Edição adicional para aprimorar os vídeos aéreos.',
            preco: 0,
            duracao_media_tratamento: 'até 10 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Ajuste de transições e trilha sonora.',
                preco: 150,
                duracao_media_tratamento: 'até 10 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Efeitos, transições suaves e edição premium.',
                preco: 250,
                duracao_media_tratamento: 'até 14 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço integrado com captação de vídeo aéreo e edição avançada inclusa, a preço promocional.',
            preco: 1100,
            duracao_media_captura: '1 a 2 horas',
            duracao_media_tratamento: 'até 14 dias úteis'
          }
        ]
      },
      {
        nome: 'Pacote VLOG Family (Ilha do Mel ou Outros Lugares)',
        descricao: 'Registro completo de viagens e passeios familiares, com fotos e vídeos de alta qualidade.',
        preco_base: 1500,
        duracao_media_captura: '4 a 6 horas',
        duracao_media_tratamento: 'até 14 dias úteis',
        entregaveis: '30 fotos editadas + vídeo de 3-5 minutos',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada',
        valor_deslocamento: 'Sob consulta, dependendo da localidade',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Registro completo de viagens e passeios familiares, com fotos e vídeos de alta qualidade.',
            preco: 1500,
            duracao_media_captura: '4 a 6 horas',
            duracao_media_tratamento: 'até 14 dias úteis'
          },
          {
            tipo: 'Complemento de Edição',
            descricao: 'Edição adicional para aprimorar as fotos e vídeos do VLOG familiar.',
            preco: 0,
            duracao_media_tratamento: 'até 14 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Retoques e montagem dinâmica.',
                preco: 300,
                duracao_media_tratamento: 'até 14 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Edição profissional com efeitos visuais.',
                preco: 500,
                duracao_media_tratamento: 'até 21 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço integrado com captação e edição avançada inclusa, a preço promocional.',
            preco: 1900,
            duracao_media_captura: '4 a 6 horas',
            duracao_media_tratamento: 'até 21 dias úteis'
          }
        ]
      },
      {
        nome: 'Pacote VLOG Friends & Community',
        descricao: 'Pacote ideal para registrar encontros e eventos comunitários com fotos e vídeos profissionais.',
        preco_base: 1800,
        duracao_media_captura: '6 a 8 horas',
        duracao_media_tratamento: 'até 14 dias úteis',
        entregaveis: '40 fotos editadas + vídeo de 5-7 minutos',
        possiveis_adicionais: 'Edição Mediana, Edição Avançada',
        valor_deslocamento: 'Sob consulta, dependendo da localidade',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Pacote ideal para registrar encontros e eventos comunitários com fotos e vídeos profissionais.',
            preco: 1800,
            duracao_media_captura: '6 a 8 horas',
            duracao_media_tratamento: 'até 14 dias úteis'
          },
          {
            tipo: 'Complemento de Edição',
            descricao: 'Edição adicional para aprimorar as fotos e vídeos do VLOG de grupo.',
            preco: 0,
            duracao_media_tratamento: 'até 14 dias úteis',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Ajustes básicos e transições.',
                preco: 350,
                duracao_media_tratamento: 'até 14 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Edição completa com motion graphics.',
                preco: 600,
                duracao_media_tratamento: 'até 21 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço integrado com captação e edição avançada inclusa, a preço promocional.',
            preco: 2300,
            duracao_media_captura: '6 a 8 horas',
            duracao_media_tratamento: 'até 21 dias úteis'
          }
        ]
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
    
    // Processar todos os serviços
    for (const servico of servicosPrecificados) {
      try {
        // Criar o serviço principal
        await criarServico(
          servico.nome,
          servico.descricao,
          servico.preco_base,
          servico.duracao_media_captura,
          servico.duracao_media_tratamento,
          servico.entregaveis,
          servico.possiveis_adicionais,
          servico.valor_deslocamento
        );
        
        servicosInseridos++;
        
      } catch (error) {
        console.error(`❌ Erro ao inserir serviço ${servico.nome}:`, error);
      }
    }
    
    console.log(`\n📊 Total de serviços inseridos: ${servicosInseridos}`);
    console.log('🔍 Apenas serviços principais, sem versões e opções');
 
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
 * Depois sincroniza automaticamente os dados de demonstração
 */
async function executarScript() {
  try {
    // Executar a função principal para seed dos serviços
    await main();
    
    // Sincronizar automaticamente os dados de demonstração
    console.log('\n🔄 Sincronizando automaticamente os dados de demonstração...');
    await sincronizarDadosDemonstracao();
    
    console.log('\n✅ Processo completo! Serviços atualizados no banco de dados e nos dados de demonstração.');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar o script:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Executando o script
executarScript();
