import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Script para inicializar o banco de dados
 * Cria um usuário administrador e serviços iniciais
 */
async function main() {
  try {
    console.log('Iniciando a configuração do banco de dados...');

    // Criar usuário administrador
    const adminEmail = 'admin@lytspot.com.br.br';
    
    // Verificar se o usuário já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: adminEmail
      }
    });
    
    if (!usuarioExistente) {
      // Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Black&Red2025', salt);
      
      // Criar o usuário administrador
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          nome: 'Administrador'
        }
      });
      
      console.log('Usuário administrador criado com sucesso!');
      console.log('Email: admin@lytspot.com.br.br');
      console.log('Senha: Black&Red2025');
      console.log('IMPORTANTE: Altere esta senha após o primeiro login!');
    } else {
      console.log('Usuário administrador já existe.');
    }

    // Criar serviços iniciais
    const servicosIniciais = [
      {
        nome: 'Ensaio Fotográfico Pessoal',
        descricao: 'Sessão de fotos profissional para retratos individuais em estúdio ou locação.',
        preco_base: 299.90,
        duracao_media_captura: '1h-2h',
        duracao_media_tratamento: '4h-6h',
        entregaveis: '20 fotos tratadas em alta resolução',
        possiveis_adicionais: 'Fotos extras, álbum impresso, maquiagem profissional',
        valor_deslocamento: 'R$1,20/km para locais fora de Curitiba'
      },
      {
        nome: 'Ensaio Externo de Casal ou Família',
        descricao: 'Sessão de fotos em ambiente externo para casais ou famílias, capturando momentos naturais e espontâneos.',
        preco_base: 399.90,
        duracao_media_captura: '2h-3h',
        duracao_media_tratamento: '6h-8h',
        entregaveis: '30 fotos tratadas em alta resolução',
        possiveis_adicionais: 'Fotos extras, álbum impresso, locação especial',
        valor_deslocamento: 'R$1,20/km para locais fora de Curitiba'
      },
      {
        nome: 'Fotografia de Produtos (Still)',
        descricao: 'Fotografia profissional de produtos para e-commerce, catálogos ou material publicitário.',
        preco_base: 249.90,
        duracao_media_captura: '2h-4h',
        duracao_media_tratamento: '3h-5h',
        entregaveis: '10 fotos tratadas por produto',
        possiveis_adicionais: 'Produtos adicionais, composição de cenário',
        valor_deslocamento: 'Incluído em Curitiba'
      },
      {
        nome: 'Cobertura Fotográfica de Evento Social',
        descricao: 'Cobertura completa de eventos sociais como aniversários, formaturas e confraternizações.',
        preco_base: 599.90,
        duracao_media_captura: '4h-6h',
        duracao_media_tratamento: '8h-12h',
        entregaveis: '100 fotos tratadas em alta resolução',
        possiveis_adicionais: 'Horas extras, álbum impresso, fotos impressas',
        valor_deslocamento: 'R$1,20/km para locais fora de Curitiba'
      },
      {
        nome: 'Filmagem de Evento Social (Solo)',
        descricao: 'Captação de vídeo profissional para eventos sociais, incluindo edição básica.',
        preco_base: 699.90,
        duracao_media_captura: '4h-6h',
        duracao_media_tratamento: '10h-15h',
        entregaveis: 'Vídeo editado de 3-5 minutos em alta resolução',
        possiveis_adicionais: 'Horas extras, drone, edição estendida',
        valor_deslocamento: 'R$1,20/km para locais fora de Curitiba'
      },
      {
        nome: 'Fotografia Aérea com Drone',
        descricao: 'Captação de imagens aéreas com drone para eventos, propriedades ou paisagens.',
        preco_base: 349.90,
        duracao_media_captura: '1h-2h',
        duracao_media_tratamento: '3h-5h',
        entregaveis: '15 fotos aéreas tratadas em alta resolução',
        possiveis_adicionais: 'Tempo adicional de voo, fotos extras',
        valor_deslocamento: 'R$1,50/km para locais fora de Curitiba'
      },
      {
        nome: 'Filmagem Aérea com Drone',
        descricao: 'Captação de vídeos aéreos com drone para eventos, propriedades ou paisagens.',
        preco_base: 449.90,
        duracao_media_captura: '1h-2h',
        duracao_media_tratamento: '5h-8h',
        entregaveis: 'Vídeo editado de 1-2 minutos em 4K',
        possiveis_adicionais: 'Tempo adicional de voo, edição estendida',
        valor_deslocamento: 'R$1,50/km para locais fora de Curitiba'
      },
      {
        nome: 'Pacote VLOG Family (Ilha do Mel)',
        descricao: 'Pacote completo de fotos e vídeos para famílias em passeio na Ilha do Mel, com edição temática.',
        preco_base: 1299.90,
        duracao_media_captura: '6h-8h',
        duracao_media_tratamento: '15h-20h',
        entregaveis: '50 fotos tratadas + vídeo editado de 5-7 minutos',
        possiveis_adicionais: 'Hospedagem, transporte, dias adicionais',
        valor_deslocamento: 'Incluído no pacote'
      }
    ];

    // Verificar se já existem serviços
    const servicosExistentes = await prisma.servico.count();
    
    if (servicosExistentes === 0) {
      // Criar os serviços iniciais
      for (const servico of servicosIniciais) {
        await prisma.servico.create({
          data: servico
        });
      }
      
      console.log(`${servicosIniciais.length} serviços iniciais criados com sucesso!`);
    } else {
      console.log('Serviços já existem no banco de dados.');
    }

    console.log('Configuração do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
