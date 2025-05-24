import { PageContent, ContentSection } from '../types/content';

export const DEFAULT_PAGES: Record<string, PageContent> = {
  home: {
    id: 'home',
    title: {
      en: 'Nelson Tech Community',
      es: 'Comunidad Nelson Tech',
      fr: 'Communauté Nelson Tech',
      de: 'Nelson Tech Gemeinschaft',
      zh: 'Nelson Tech 社区',
      ja: 'Nelson Tech コミュニティ'
    },
    description: {
      en: 'Connecting technology professionals and fostering innovation in our community',
      es: 'Conectando profesionales de tecnología y fomentando la innovación en nuestra comunidad',
      fr: 'Connecter les professionnels de la technologie et favoriser l\'innovation dans notre communauté',
      de: 'Technologie-Profis verbinden und Innovation in unserer Gemeinschaft fördern',
      zh: '连接技术专业人士，促进我们社区的创新',
      ja: '技術専門家をつなぎ、コミュニティでのイノベーションを促進'
    },
    backgroundImage: '/images/hero-bg.jpg',
    gradientFrom: '#1e40af',
    gradientTo: '#7c3aed',
    lastModified: new Date().toISOString(),
    modifiedBy: 'system'
  },
  about: {
    id: 'about',
    title: {
      en: 'About Us',
      es: 'Acerca de Nosotros',
      fr: 'À Propos de Nous',
      de: 'Über Uns',
      zh: '关于我们',
      ja: '私たちについて'
    },
    description: {
      en: 'Learn more about our mission, vision, and the team behind Nelson Tech',
      es: 'Conoce más sobre nuestra misión, visión y el equipo detrás de Nelson Tech',
      fr: 'En savoir plus sur notre mission, notre vision et l\'équipe derrière Nelson Tech',
      de: 'Erfahren Sie mehr über unsere Mission, Vision und das Team hinter Nelson Tech',
      zh: '了解更多关于我们的使命、愿景和 Nelson Tech 背后的团队',
      ja: '私たちの使命、ビジョン、そしてNelson Techの背後にあるチームについて詳しく学ぶ'
    },
    backgroundImage: '/images/about-bg.jpg',
    gradientFrom: '#059669',
    gradientTo: '#0891b2',
    lastModified: new Date().toISOString(),
    modifiedBy: 'system'
  },
  opportunities: {
    id: 'opportunities',
    title: {
      en: 'Opportunities',
      es: 'Oportunidades',
      fr: 'Opportunités',
      de: 'Möglichkeiten',
      zh: '机会',
      ja: '機会'
    },
    description: {
      en: 'Discover job opportunities, internships, and projects in the tech industry',
      es: 'Descubre oportunidades de trabajo, pasantías y proyectos en la industria tecnológica',
      fr: 'Découvrez les opportunités d\'emploi, les stages et les projets dans l\'industrie technologique',
      de: 'Entdecken Sie Stellenangebote, Praktika und Projekte in der Technologiebranche',
      zh: '发现科技行业的工作机会、实习和项目',
      ja: 'テクノロジー業界での就職機会、インターンシップ、プロジェクトを発見'
    },
    backgroundImage: '/images/opportunities-bg.jpg',
    gradientFrom: '#dc2626',
    gradientTo: '#ea580c',
    lastModified: new Date().toISOString(),
    modifiedBy: 'system'
  },
  directory: {
    id: 'directory',
    title: {
      en: 'Member Directory',
      es: 'Directorio de Miembros',
      fr: 'Annuaire des Membres',
      de: 'Mitgliederverzeichnis',
      zh: '成员目录',
      ja: 'メンバーディレクトリ'
    },
    description: {
      en: 'Connect with fellow tech professionals in our community',
      es: 'Conecta con otros profesionales de tecnología en nuestra comunidad',
      fr: 'Connectez-vous avec d\'autres professionnels de la technologie dans notre communauté',
      de: 'Vernetzen Sie sich mit anderen Technologie-Profis in unserer Gemeinschaft',
      zh: '与我们社区中的其他技术专业人士建立联系',
      ja: '私たちのコミュニティの他の技術専門家とつながる'
    },
    backgroundImage: '/images/directory-bg.jpg',
    gradientFrom: '#7c2d12',
    gradientTo: '#a21caf',
    lastModified: new Date().toISOString(),
    modifiedBy: 'system'
  }
};

export const DEFAULT_SECTIONS: Record<string, ContentSection[]> = {
  home: [
    {
      id: 'hero-heading',
      pageId: 'home',
      sectionKey: 'hero.heading',
      type: 'heading',
      content: {
        en: 'Welcome to Nelson Tech',
        es: 'Bienvenido a Nelson Tech',
        fr: 'Bienvenue chez Nelson Tech',
        de: 'Willkommen bei Nelson Tech',
        zh: '欢迎来到 Nelson Tech',
        ja: 'Nelson Tech へようこそ'
      },
      lastModified: new Date().toISOString(),
      modifiedBy: 'system'
    },
    {
      id: 'hero-subtitle',
      pageId: 'home',
      sectionKey: 'hero.subtitle',
      type: 'text',
      content: {
        en: 'Connecting innovators, sharing knowledge, building the future',
        es: 'Conectando innovadores, compartiendo conocimiento, construyendo el futuro',
        fr: 'Connecter les innovateurs, partager les connaissances, construire l\'avenir',
        de: 'Innovatoren verbinden, Wissen teilen, die Zukunft gestalten',
        zh: '连接创新者，分享知识，构建未来',
        ja: 'イノベーターをつなぎ、知識を共有し、未来を築く'
      },
      lastModified: new Date().toISOString(),
      modifiedBy: 'system'
    },
    {
      id: 'hero-cta',
      pageId: 'home',
      sectionKey: 'hero.cta',
      type: 'button',
      content: {
        en: 'Join Our Community',
        es: 'Únete a Nuestra Comunidad',
        fr: 'Rejoignez Notre Communauté',
        de: 'Treten Sie Unserer Gemeinschaft Bei',
        zh: '加入我们的社区',
        ja: '私たちのコミュニティに参加'
      },
      lastModified: new Date().toISOString(),
      modifiedBy: 'system'
    }
  ]
};
