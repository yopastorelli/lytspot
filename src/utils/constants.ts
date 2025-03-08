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

export const ABOUT_CONTENT = {
  mission: "Proporcionar experiências visuais extraordinárias através da captura de imagens de alta qualidade, utilizando tecnologia de ponta e criatividade.",
  vision: "Ser referência em captação de imagens aéreas e terrestres, reconhecida pela excelência, inovação e compromisso com a satisfação do cliente.",
  values: [
    "Excelência técnica",
    "Inovação constante",
    "Compromisso com o cliente",
    "Segurança em primeiro lugar",
    "Criatividade e originalidade"
  ]
};

export const TEAM_MEMBERS = [
  {
    name: "Lucas",
    role: "Imagens terrestres",
    image: "/images/black.PNG",
    bio: "Especialista em fotografia profissional com mais de 18 anos de experiência.",
    social: [
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/lucas-ferreira-3a15039b/" },
      { platform: "Instagram", url: "https://www.instagram.com/lucasferreirafotografo" }
    ]
  },
  {
    name: "Daniel",
    role: "Imagens aéreas",
    image: "/images/red.PNG",
    bio: "Especialista em tecnologia e apaixonado por imagens e máquinas aéreas.",
    social: [
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/dfdelgado/" },
      { platform: "Instagram", url: "https://www.instagram.com/dfdelgado" }
    ]
  }
];

export const EQUIPMENT = {
  drones: [
    {
      model: "DJI Mavic 3 Pro",
      description: "Drone profissional com câmera Hasselblad",
      features: [
        "Sensor 4/3 CMOS",
        "Gravação 5.1K",
        "Autonomia de 46 minutos",
        "Sistema de detecção de obstáculos omnidirecional"
      ]
    },
    {
      model: "DJI Inspire 2",
      description: "Drone para cinematografia profissional",
      features: [
        "Câmera intercambiável",
        "Gravação 6K RAW",
        "Velocidade máxima de 94 km/h",
        "Sistema de transmissão duplo"
      ]
    }
  ],
  cameras: [
    {
      model: "Sony A7S III",
      description: "Câmera mirrorless full-frame",
      features: [
        "Sensor full-frame de 12.1MP",
        "Gravação 4K 120fps",
        "ISO expansível até 409.600",
        "Estabilização de 5 eixos"
      ]
    },
    {
      model: "Canon EOS R5",
      description: "Câmera mirrorless profissional",
      features: [
        "Sensor full-frame de 45MP",
        "Gravação 8K RAW",
        "Estabilização de 8 stops",
        "AF com detecção de olhos"
      ]
    }
  ]
};
