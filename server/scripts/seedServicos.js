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
    const servicos = [
      {
        nome: "Fotografia de Eventos",
        descricao: "Cobertura fotográfica profissional para eventos empresariais, festas e cerimônias.",
        preco_base: 1500.00,
        duracao_media_captura: "4",
        duracao_media_tratamento: "8",
        entregaveis: "100 fotos em alta resolução, acesso a galeria digital",
        possiveis_adicionais: "Álbum físico, impressões, sessão pré-evento",
        valor_deslocamento: "Sob consulta"
      },
      {
        nome: "Ensaio Fotográfico",
        descricao: "Sessão fotográfica em estúdio ou externa, com entrega de 20 fotos editadas.",
        preco_base: 800.00,
        duracao_media_captura: "2",
        duracao_media_tratamento: "4",
        entregaveis: "20 fotos em alta resolução, galeria digital privada",
        possiveis_adicionais: "Fotos adicionais, maquiagem profissional, locação especial",
        valor_deslocamento: "R$ 100,00 por hora de deslocamento"
      },
      {
        nome: "Vídeo Institucional",
        descricao: "Produção completa de vídeo promocional para sua empresa, incluindo edição e trilha sonora.",
        preco_base: 3500.00,
        duracao_media_captura: "8",
        duracao_media_tratamento: "40",
        entregaveis: "Vídeo de 2-3 minutos em 4K, versão para redes sociais",
        possiveis_adicionais: "Locutor profissional, animações personalizadas, filmagem aérea",
        valor_deslocamento: "Incluso em até 50km"
      },
      {
        nome: "Filmagem de Casamento",
        descricao: "Cobertura completa do seu casamento, desde os preparativos até a festa.",
        preco_base: 3200.00,
        duracao_media_captura: "12",
        duracao_media_tratamento: "60",
        entregaveis: "Filme completo, trailer de 3-5 minutos, versões para redes sociais",
        possiveis_adicionais: "Filmagem com drone, same-day edit, entrevistas com convidados",
        valor_deslocamento: "R$ 150,00 por hora de deslocamento"
      },
      {
        nome: "Sessão de Fotos de Produto",
        descricao: "Fotografia profissional de produtos para e-commerce, catálogos ou publicidade.",
        preco_base: 1200.00,
        duracao_media_captura: "4",
        duracao_media_tratamento: "6",
        entregaveis: "15 fotos por produto em alta resolução, diferentes ângulos",
        possiveis_adicionais: "Ambientação personalizada, mais ângulos, vídeo 360°",
        valor_deslocamento: "R$ 80,00 fixo"
      }
    ];
    
    // Inserindo os serviços no banco de dados
    console.log('➕ Cadastrando novos serviços...');
    for (const servico of servicos) {
      await prisma.servico.create({
        data: servico
      });
      console.log(`✅ Serviço cadastrado: ${servico.nome}`);
    }
    
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
