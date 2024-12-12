export const SITE_CONFIG = {
  name: 'LYTSPOT',
  description: 'Especialistas em captura de imagens profissionais com drones e câmeras',
  contact: {
    phone: '+55 (41) 99888-0303',
    email: 'contato@lytspot.com.br',
    address: 'Curitiba, PR'
  },
  social: {
    instagram: 'https://instagram.com/lytspot',
    facebook: 'https://facebook.com/lytspot',
    youtube: 'https://youtube.com/lytspot',
    linkedin: 'https://linkedin.com/company/lytspot'
  }
};

export const SERVICES = [
  {
    id: 'drone',
    title: 'Filmagem com Drones',
    description: 'Captação aérea profissional para eventos, publicidade, programas e projetos únicos.',
    image: '/images/drone.png',
    features: [
      'Imagens em 4K 60fps',
      'Drones profissionais',
      'Pilotos certificados',
      'Licenças ANAC',
      'Seguro RETA'
    ]
  },
  {
    id: 'photo',
    title: 'Fotografia Profissional',
    description: 'Ensaios fotográficos, eventos corporativos e campanhas publicitárias.',
    image: '/images/photo.png',
    features: [
      'Equipamentos Profissionais',
      'Fotógrafos com ampla experiência',
      'Edição profissional',
      'Entrega rápida'
    ]
  },
  {
    id: 'video',
    title: 'Projetos especiais',
    description: 'Produção audiovisual para projetos personalizados',
    image: '/images/project.png',
    features: [
      'Roteirização',
      'Captação em alta definição',
      'Colaboração com o cliente',
      'Edição profissional'
    ]
  }
];

// Rest of the constants remain the same...