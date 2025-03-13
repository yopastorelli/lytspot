/**
 * Script para atualizar os serviços e adicionais no banco de dados
 * @version 1.0.1 - 2025-03-12
 * @description Atualiza os serviços e adicionais conforme as novas definições
 */

import prisma from '../prisma/client.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Configuração para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Verificar se o banco de dados está acessível
async function verificarBancoDados() {
  try {
    // Tentar acessar o banco de dados
    const count = await prisma.servico.count();
    console.log(`📊 Banco de dados contém ${count} serviços.`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao acessar o banco de dados:', error.message);
    return false;
  }
}

// Serviços atualizados conforme solicitado
const servicosAtualizados = [
  {
    nome: 'Ensaio Fotográfico Pessoal',
    descricao: 'Sessão individual em locação externa ou estúdio, ideal para redes sociais, uso profissional ou pessoal. Inclui direção de poses, correção básica de cor e entrega digital em alta resolução.',
    preco_base: 350.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: '7 dias úteis',
    entregaveis: '20 fotos editadas em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    nome: 'Ensaio Externo de Casal ou Família',
    descricao: 'Sessão fotográfica em ambiente externo para casais ou famílias, com foco em momentos naturais e espontâneos. Inclui direção de poses e edição básica.',
    preco_base: 450.00,
    duracao_media_captura: '2 a 4 horas',
    duracao_media_tratamento: '10 dias úteis',
    entregaveis: '30 fotos editadas em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    nome: 'Cobertura Fotográfica de Evento Social',
    descricao: 'Registro fotográfico completo de eventos sociais como aniversários, formaturas e confraternizações. Inclui edição básica e entrega digital.',
    preco_base: 800.00,
    duracao_media_captura: '4 horas',
    duracao_media_tratamento: '10 dias úteis',
    entregaveis: '40 fotos editadas em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    nome: 'Filmagem de Evento Social (Solo)',
    descricao: 'Captação de vídeo para eventos sociais, incluindo edição básica com trilha sonora e entrega em formato digital de alta qualidade.',
    preco_base: 1200.00,
    duracao_media_captura: '4 horas',
    duracao_media_tratamento: '14 dias úteis',
    entregaveis: 'Vídeo editado de 3-5 minutos em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,20/km)'
  },
  {
    nome: 'Fotografia Aérea com Drone',
    descricao: 'Captura de imagens aéreas de propriedades, eventos ou locações, com equipamento profissional e piloto certificado.',
    preco_base: 700.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: '7 dias úteis',
    entregaveis: '15 fotos em alta resolução com edição básica',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,50/km)'
  },
  {
    nome: 'Filmagem Aérea com Drone',
    descricao: 'Captação de vídeos aéreos para imóveis, eventos ou projetos especiais, com equipamento profissional e piloto certificado.',
    preco_base: 900.00,
    duracao_media_captura: '1 a 2 horas',
    duracao_media_tratamento: '10 dias úteis',
    entregaveis: 'Vídeo editado de 1-2 minutos em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Gratuito até 20 km do centro de Curitiba (excedente de R$ 1,50/km)'
  },
  {
    nome: 'Pacote VLOG Family (Ilha do Mel ou Outros Lugares)',
    descricao: 'Documentação em vídeo e foto da sua viagem em família, com edição profissional e entrega em formato digital.',
    preco_base: 1500.00,
    duracao_media_captura: '4 a 6 horas',
    duracao_media_tratamento: '14 dias úteis',
    entregaveis: 'Vídeo editado de 3-5 minutos + 30 fotos em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Sob consulta (depende da localização)'
  },
  {
    nome: 'Pacote VLOG Friends & Community',
    descricao: 'Cobertura fotográfica e de vídeo para grupos de amigos ou comunidades, perfeita para registrar viagens, encontros ou eventos colaborativos.',
    preco_base: 1800.00,
    duracao_media_captura: '6 a 8 horas',
    duracao_media_tratamento: '14 dias úteis',
    entregaveis: 'Vídeo editado de 5-7 minutos + 40 fotos em alta resolução',
    possiveis_adicionais: 'Edição Mediana, Edição Avançada',
    valor_deslocamento: 'Sob consulta (depende da localização)'
  }
];

// Adicionais disponíveis
const adicionaisInfo = `
ADICIONAIS (APLICÁVEIS A TODOS OS SERVIÇOS)

1. Edição Mediana (Fotos)
   Descrição: Retoques moderados, ajustes de cor e contraste para um resultado natural.
   Valor: a partir de R$ 50 (depende do volume de imagens)

2. Edição Avançada (Fotos)
   Descrição: Tratamento completo com retoques minuciosos, remoção de imperfeições e finalização profissional.
   Valor: a partir de R$ 100 (depende do volume de imagens)

3. Edição Mediana (Vídeo)
   Descrição: Montagem e cortes básicos, correção de cor e inserção de trilha simples para um vídeo coeso.
   Valor: a partir de R$ 150 (depende da duração do vídeo)

4. Edição Avançada (Vídeo)
   Descrição: Pós-produção completa com efeitos, legendas, trilha sonora, correções minuciosas e finalização profissional.
   Valor: a partir de R$ 250 (depende da duração e complexidade)

5. Pacote Completo (Captura + Edição Avançada)
   Descrição: Combinação do serviço de captura + edição avançada a preço promocional, com desconto em relação à soma dos valores individuais.
   Valor: varia conforme o serviço escolhido (fotografia ou vídeo)

6. Horas Extras de Cobertura
   Descrição: Caso seja necessário estender a duração de captura além do previsto no pacote básico.
   Valor: a partir de R$ 100/hora adicional (depende do tipo de serviço)

7. Fotos Extras
   Descrição: Para quem deseja mais fotos editadas além do número padrão incluso no pacote.
   Valor: a partir de R$ 10/foto adicional

8. Entrega Expressa
   Descrição: Reduz o prazo de entrega pela metade (sujeito à disponibilidade de agenda).
   Valor: a partir de R$ 150

9. Álbum Impresso ou Fotolivro
   Descrição: Criação de um álbum físico de alta qualidade, com diagramação personalizada.
   Valor: a partir de R$ 200 (varia de acordo com o tamanho e número de páginas)

10. Deslocamento Adicional
    Descrição: Para locais fora do raio de 20 km do centro de Curitiba.
    Valor: R$ 1,20/km adicional (inclui quilometragem extra; pedágios e outras despesas não incluídos)
`;

// Salvar informações dos adicionais em um arquivo JSON
async function salvarAdicionaisJson() {
  const adicionaisData = [
    {
      id: 1,
      nome: 'Edição Mediana (Fotos)',
      descricao: 'Retoques moderados, ajustes de cor e contraste para um resultado natural.',
      valor_base: 50.00,
      observacao: 'Valor pode variar dependendo do volume de imagens',
      categoria: 'foto'
    },
    {
      id: 2,
      nome: 'Edição Avançada (Fotos)',
      descricao: 'Tratamento completo com retoques minuciosos, remoção de imperfeições e finalização profissional.',
      valor_base: 100.00,
      observacao: 'Valor pode variar dependendo do volume de imagens',
      categoria: 'foto'
    },
    {
      id: 3,
      nome: 'Edição Mediana (Vídeo)',
      descricao: 'Montagem e cortes básicos, correção de cor e inserção de trilha simples para um vídeo coeso.',
      valor_base: 150.00,
      observacao: 'Valor pode variar dependendo da duração do vídeo',
      categoria: 'video'
    },
    {
      id: 4,
      nome: 'Edição Avançada (Vídeo)',
      descricao: 'Pós-produção completa com efeitos, legendas, trilha sonora, correções minuciosas e finalização profissional.',
      valor_base: 250.00,
      observacao: 'Valor pode variar dependendo da duração e complexidade',
      categoria: 'video'
    },
    {
      id: 5,
      nome: 'Pacote Completo (Captura + Edição Avançada)',
      descricao: 'Combinação do serviço de captura + edição avançada a preço promocional, com desconto em relação à soma dos valores individuais.',
      valor_base: null,
      observacao: 'Valor varia conforme o serviço escolhido (fotografia ou vídeo)',
      categoria: 'combo'
    },
    {
      id: 6,
      nome: 'Horas Extras de Cobertura',
      descricao: 'Caso seja necessário estender a duração de captura além do previsto no pacote básico.',
      valor_base: 100.00,
      observacao: 'Valor por hora adicional, pode variar dependendo do tipo de serviço',
      categoria: 'tempo'
    },
    {
      id: 7,
      nome: 'Fotos Extras',
      descricao: 'Para quem deseja mais fotos editadas além do número padrão incluso no pacote.',
      valor_base: 10.00,
      observacao: 'Valor por foto adicional',
      categoria: 'foto'
    },
    {
      id: 8,
      nome: 'Entrega Expressa',
      descricao: 'Reduz o prazo de entrega pela metade (sujeito à disponibilidade de agenda).',
      valor_base: 150.00,
      observacao: 'Sujeito à disponibilidade',
      categoria: 'tempo'
    },
    {
      id: 9,
      nome: 'Álbum Impresso ou Fotolivro',
      descricao: 'Criação de um álbum físico de alta qualidade, com diagramação personalizada.',
      valor_base: 200.00,
      observacao: 'Valor varia de acordo com o tamanho e número de páginas',
      categoria: 'produto'
    },
    {
      id: 10,
      nome: 'Deslocamento Adicional',
      descricao: 'Para locais fora do raio de 20 km do centro de Curitiba.',
      valor_base: 1.20,
      observacao: 'Valor por km adicional (inclui quilometragem extra; pedágios e outras despesas não incluídos)',
      categoria: 'deslocamento'
    }
  ];
  
  const adicionaisJsonPath = path.join(rootDir, 'data', 'adicionais.json');
  const adicionaisDir = path.dirname(adicionaisJsonPath);
  
  // Criar diretório se não existir
  if (!fs.existsSync(adicionaisDir)) {
    fs.mkdirSync(adicionaisDir, { recursive: true });
    console.log(`✅ Diretório criado: ${adicionaisDir}`);
  }
  
  // Salvar arquivo JSON
  fs.writeFileSync(adicionaisJsonPath, JSON.stringify(adicionaisData, null, 2), 'utf8');
  console.log(`✅ Arquivo de adicionais salvo em: ${adicionaisJsonPath}`);
}

/**
 * Atualiza os serviços no banco de dados
 */
async function atualizarServicos() {
  try {
    console.log('🔄 Iniciando atualização dos serviços...');
    
    // Verificar se o banco de dados está acessível
    const dbAcessivel = await verificarBancoDados();
    if (!dbAcessivel) {
      console.error('❌ Não foi possível acessar o banco de dados. Verifique a configuração.');
      return;
    }

    // Limpar todos os serviços existentes
    await prisma.servico.deleteMany({});
    console.log('✅ Serviços anteriores removidos com sucesso.');

    // Inserir os novos serviços
    for (const servico of servicosAtualizados) {
      await prisma.servico.create({
        data: servico
      });
    }

    console.log(`✅ ${servicosAtualizados.length} serviços atualizados inseridos com sucesso!`);
    
    // Salvar informações dos adicionais em um arquivo JSON
    await salvarAdicionaisJson();
    
    console.log('\n📝 Informações sobre adicionais:');
    console.log(adicionaisInfo);

  } catch (error) {
    console.error('❌ Erro ao atualizar serviços:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função principal
atualizarServicos()
  .then(() => {
    console.log('✨ Processo de atualização concluído com sucesso!');
  })
  .catch((error) => {
    console.error('❌ Erro durante o processo de atualização:', error);
    process.exit(1);
  });
