// Script para inserir serviços reais no banco de dados
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Função principal para adicionar serviços de exemplo ao banco de dados
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
        
    // Consultando os serviços cadastrados para confirmar
    const servicosCadastrados = await prisma.servico.findMany();
    console.log(`\n🎉 Processo concluído! ${servicosCadastrados.length} serviços cadastrados:`);
    console.table(servicosCadastrados.map(s => ({
      id: s.id,
      nome: s.nome,
      preco: `R$ ${s.preco_base.toFixed(2)}`
    })));
    
  } catch (error) {
    console.error('❌ Erro ao cadastrar serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executando a função principal
main();
