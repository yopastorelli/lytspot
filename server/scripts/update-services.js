import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { prepareServiceDataForDatabase } from '../utils/serviceDataUtils.js';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Script para atualizar os serviços no banco de dados
 * Baseado no catálogo completo da Lytspot
 * @version 1.1.0 - 2025-03-15 - Atualizado para usar prepareServiceDataForDatabase
 */
async function main() {
  try {
    console.log('Iniciando a atualização dos serviços...');

    // Catálogo completo de serviços da Lytspot
    const servicosPrecificados = [
      {
        nome: 'Ensaio Fotográfico Pessoal',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Sessão individual com captação de fotos e correção básica de cor. (Entrega: 20 fotos “in natura” com ajustes mínimos.)',
            preco: 200.00,
            duracao_media_captura: '2 a 3 horas'
          },
          {
            tipo: 'Complemento de Edição',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Retoques moderados, ajustes de cor e contraste para um resultado natural.',
                preco: 50.00,
                duracao_media_tratamento: 'até 7 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Tratamento completo com retoques minuciosos e finalização profissional.',
                preco: 100.00,
                duracao_media_tratamento: 'até 7 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço integrado de captação e edição (opção à escolha) com preço promocional.',
            preco: 280.00 // preço ligeiramente inferior à soma dos serviços individuais (ex.: 200 + 100 = 300)
          }
        ],
        entregaveis: '20 fotos editadas em alta resolução',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Ensaio Externo de Casal ou Família',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Sessão externa para casais/família com captação de imagens e correção básica, ideal para momentos espontâneos.',
            preco: 350.00,
            duracao_media_captura: '2 a 4 horas'
          },
          {
            tipo: 'Complemento de Edição',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Ajustes e retoques moderados para realçar a naturalidade das imagens.',
                preco: 75.00,
                duracao_media_tratamento: 'até 10 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Edição completa com tratamento avançado e personalização dos detalhes.',
                preco: 125.00,
                duracao_media_tratamento: 'até 10 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço completo de ensaio externo com edição avançada inclusa a preço especial.',
            preco: 450.00
          }
        ],
        entregaveis: '30 fotos editadas em alta resolução',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Cobertura Fotográfica de Evento Social',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Cobertura do evento com captação de imagens e correção básica para registrar todos os momentos importantes.',
            preco: 600.00,
            duracao_media_captura: '4 horas'
          },
          {
            tipo: 'Complemento de Edição',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Retoques e ajustes moderados para uma entrega com aparência natural.',
                preco: 200.00,
                duracao_media_tratamento: 'até 10 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Edição completa com tratamento avançado, realçando detalhes e emoções.',
                preco: 300.00,
                duracao_media_tratamento: 'até 10 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Cobertura com edição avançada inclusa, com preço promocional para o conjunto do serviço.',
            preco: 850.00
          }
        ],
        entregaveis: '40 fotos editadas em alta resolução',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Filmagem de Evento Social (Solo)',
        versoes: [
          {
            tipo: 'Captura de Vídeo',
            descricao: 'Filmagem do evento com envio dos arquivos já colorizados e cortados – sem edição completa.',
            preco: 1000.00,
            duracao_media_captura: '4 horas'
          },
          {
            tipo: 'Complemento de Edição de Vídeo',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Montagem e cortes com ajustes básicos para um vídeo coeso.',
                preco: 300.00,
                duracao_media_tratamento: 'até 15 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Pós-produção completa com trilha sonora, efeitos e tratamento avançado.',
                preco: 500.00,
                duracao_media_tratamento: 'até 15 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Filmagem com edição avançada inclusa, oferecida a um preço promocional.',
            preco: 1400.00
          }
        ],
        entregaveis: 'vídeo editado de 3 a 5 minutos',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Fotografia Aérea com Drone',
        versoes: [
          {
            tipo: 'Captura Aérea',
            descricao: 'Captação de imagens aéreas com drone, com correção básica aplicada.',
            preco: 400.00,
            duracao_media_captura: '2 horas'
          },
          {
            tipo: 'Complemento de Edição para Fotos Aéreas',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Ajustes e retoques simples para aprimorar as imagens.',
                preco: 100.00,
                duracao_media_tratamento: 'até 7 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Tratamento avançado das imagens, com realce de detalhes e correção minuciosa.',
                preco: 150.00,
                duracao_media_tratamento: 'até 7 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço completo com captação e edição avançada, com preço especial.',
            preco: 520.00
          }
        ],
        entregaveis: '15 fotos aéreas editadas',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Filmagem Aérea com Drone',
        versoes: [
          {
            tipo: 'Captura de Vídeo Aéreo',
            descricao: 'Filmagem aérea com drone, com entrega dos arquivos cortados e colorizados, sem edição completa.',
            preco: 600.00,
            duracao_media_captura: '2 horas'
          },
          {
            tipo: 'Complemento de Edição de Vídeo Aéreo',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Montagem e ajustes básicos para um vídeo dinâmico.',
                preco: 150.00,
                duracao_media_tratamento: 'até 12 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Edição completa com efeitos, legendas e pós-produção avançada.',
                preco: 250.00,
                duracao_media_tratamento: 'até 12 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Filmagem aérea com edição avançada inclusa a um preço promocional.',
            preco: 800.00
          }
        ],
        entregaveis: 'vídeo editado de 1 a 3 minutos',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km'
      },
      {
        nome: 'Pacote VLOG Family (Ilha do Mel ou Outros Lugares)',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Cobertura fotográfica e de vídeo durante 8 a 12 horas, captando momentos espontâneos e dirigidos.',
            preco: 1000.00,
            duracao_media_captura: '8 a 12 horas'
          },
          {
            tipo: 'Complemento de Edição para VLOG',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Montagem e cortes básicos para integrar fotos e vídeo de forma dinâmica.',
                preco: 300.00,
                duracao_media_tratamento: 'até 20 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Pós-produção completa com trilha sonora, efeitos e tratamento avançado para fotos e vídeo.',
                preco: 600.00,
                duracao_media_tratamento: 'até 20 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço integrado de VLOG com captação e edição avançada, oferecido a preço promocional.',
            preco: 1500.00
          }
        ],
        entregaveis: 'vídeo principal (10 min), teaser (1 a 3 min), fotos editadas',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km + despesas adicionais por conta do cliente'
      },
      {
        nome: 'Pacote VLOG Friends & Community',
        versoes: [
          {
            tipo: 'Captura',
            descricao: 'Cobertura fotográfica e de vídeo para grupos, realizada em 6 a 10 horas para registrar viagens, encontros ou eventos colaborativos.',
            preco: 900.00,
            duracao_media_captura: '6 a 10 horas'
          },
          {
            tipo: 'Complemento de Edição para VLOG',
            opcoes: [
              {
                nome: 'Edição Mediana',
                descricao: 'Montagem e ajustes básicos para um vídeo dinâmico e fotos com edição leve.',
                preco: 200.00,
                duracao_media_tratamento: 'até 14 dias úteis'
              },
              {
                nome: 'Edição Avançada',
                descricao: 'Edição completa com pós-produção avançada para vídeo e fotos, com cortes precisos e integração de efeitos.',
                preco: 300.00,
                duracao_media_tratamento: 'até 14 dias úteis'
              }
            ]
          },
          {
            tipo: 'Pacote Completo',
            descricao: 'Serviço completo com captação e edição avançada, a um preço promocional especial para grupos.',
            preco: 1300.00
          }
        ],
        entregaveis: 'vídeo principal (7 a 10 min), teaser (até 2 min), 30 fotos editadas',
        valor_deslocamento: 'gratuito até 20 km do centro de Curitiba, excedente R$1,20/km + despesas adicionais por conta do cliente'
      }
    ];
    

    // Limpar todos os serviços existentes
    await prisma.servico.deleteMany({});
    console.log('Serviços existentes removidos com sucesso.');
    
    // Processar e criar os novos serviços
    const servicosAtualizados = [];
    
    for (const servicoPrecificado of servicosPrecificados) {
      // Preparar os dados do serviço para o banco de dados usando a função utilitária
      const servicoProcessado = prepareServiceDataForDatabase({
        nome: servicoPrecificado.nome,
        descricao: servicoPrecificado.versoes[0].descricao,
        preco_base: servicoPrecificado.versoes[0].preco,
        duracao_media_captura: servicoPrecificado.versoes[0].duracao_media_captura,
        duracao_media_tratamento: servicoPrecificado.versoes[2]?.opcoes?.[1]?.duracao_media_tratamento || 'Sob consulta',
        entregaveis: servicoPrecificado.entregaveis,
        valor_deslocamento: servicoPrecificado.valor_deslocamento,
        detalhes: {
          versoes: servicoPrecificado.versoes,
          captura: servicoPrecificado.versoes[0].duracao_media_captura,
          tratamento: servicoPrecificado.versoes[2]?.opcoes?.[1]?.duracao_media_tratamento || 'Sob consulta'
        }
      });
      
      servicosAtualizados.push(servicoProcessado);
    }
    
    // Criar os novos serviços
    for (const servico of servicosAtualizados) {
      await prisma.servico.create({
        data: servico
      });
    }
    
    console.log(`${servicosAtualizados.length} serviços atualizados criados com sucesso!`);
    console.log('Atualização dos serviços concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a atualização dos serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
