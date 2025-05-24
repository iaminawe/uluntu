// Status type for all entities
export type EntityStatus = 'draft' | 'published' | 'archived';

// Member types
export interface Member {
  id: number;
  name: string;
  title: string;
  company?: string;
  location?: string;
  image: string;
  bio?: string;
  intro?: string;
  skills?: string[];
  joinDate: string;
  status: EntityStatus;
  featured?: boolean;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

// Company types
export interface Company {
  id: number;
  name: string;
  description: string;
  logo: string;
  coverImage?: string;
  industry: string[];
  size: string;
  founded: string;
  location: string;
  website?: string;
  status: EntityStatus;
  featured?: boolean;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  employees?: number[];
}

// Group types with visibility options
export interface GroupMember {
  id: number;
  name: string;
  image: string;
  role: 'admin' | 'member';
  joinedDate: string;
  title?: string;
}

export interface GroupEvent {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
}

export interface GroupResource {
  id: number;
  title: string;
  type: string;
  url: string;
  addedDate: string;
  description: string;
}

export interface GroupPost {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
    image: string;
  };
  date: string;
  image?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  longDescription?: string;
  heroImage: string;
  coverImage?: string;
  visibility: 'open' | 'closed' | 'secret';
  memberCount: number;
  eventCount?: number;
  resourceCount?: number;
  postCount?: number;
  lastActive: string;
  status: EntityStatus;
  featured?: boolean;
  members: GroupMember[];
  events?: GroupEvent[];
  resources?: GroupResource[];
  posts?: GroupPost[];
}

// Session and Presenter types for events
export interface EventSessionResource {
  id: number;
  title: string;
  url: string;
  type: 'slides' | 'document' | 'code' | 'website' | 'other';
}

export interface EventSession {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  presenters: EventPresenter[];
  videoUrl?: string; // URL for YouTube or Vimeo video
  resources?: EventSessionResource[];
}

export interface EventPresenter {
  id: number;
  name: string;
  image: string;
  bio?: string;
  title?: string;
  company?: string;
  website?: string;
}

// Event types
export interface Event {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  description: string;
  image: string;
  organizer: {
    id: number;
    name: string;
    image: string;
  };
  attendees?: number;
  type: 'in-person' | 'online' | 'hybrid';
  url?: string;
  status: EntityStatus;
  featured?: boolean;
  sessions?: EventSession[];
}

// News types
export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image?: string;
  author: {
    id: number;
    name: string;
    image: string;
  };
  tags?: string[];
  status: EntityStatus;
  featured?: boolean;
}

// Resources types
export interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'guide' | 'tool' | 'article' | 'video' | 'document';
  url: string;
  image?: string;
  dateAdded: string;
  contributor: {
    id: number;
    name: string;
  };
  status: EntityStatus;
  featured?: boolean;
}

// Marketplace types
export interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  price?: number;
  type: 'product' | 'service' | 'equipment' | 'event';
  category: string;
  image?: string;
  seller: {
    id: number;
    name: string;
    image: string;
  };
  datePosted: string;
  status: EntityStatus;
  featured?: boolean;
}

// Opportunity types
export interface Opportunity {
  id: number;
  title: string;
  company: {
    id: number;
    name: string;
    logo: string;
  };
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer' | 'internship';
  description: string;
  postedDate: string;
  url: string; // Added
  status: EntityStatus;
  featured?: boolean;
  skillsRequired: string[]; // Added
  experienceLevel: string; // Added
  salaryRange?: string; // Changed from salary
  remoteStatus?: 'On-site' | 'Hybrid' | 'Remote'; // Changed from remote: boolean
  deadline?: string;
}

// Mock data implementations from original components

// Members data
export const members: Member[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'AI Research Lead',
    company: 'Mountain Tech Solutions',
    location: 'Nelson, BC',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'AI researcher with 8+ years of experience in machine learning and neural networks.',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Research'],
    intro: 'Leading the charge in AI research and innovation from the heart of the Kootenays.',
    joinDate: '2023-05-15',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      twitter: 'https://twitter.com/sarahjohnson',
      github: 'https://github.com/sarahjohnson'
    }
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'ML Engineer',
    company: 'Kootenay AI Solutions',
    location: 'Nelson, BC',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    bio: 'Machine learning engineer specializing in computer vision and natural language processing.',
    intro: 'Building intelligent systems that see and understand the world around us.',
    skills: ['Computer Vision', 'Python', 'NLP', 'PyTorch'],
    joinDate: '2023-06-01',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      github: 'https://github.com/michaelchen'
    }
  },
  {
    id: 3,
    name: 'Emma Wilson',
    title: 'Data Scientist',
    company: 'Data Insights Co.',
    location: 'Rossland, BC',
    image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
    intro: 'An AI/ML Engineer at Kootenay AI, specializing in Python, TensorFlow, and NLP.',
    bio: 'Data scientist passionate about using data to solve real-world problems.',
    skills: ['Data Analysis', 'R', 'Python', 'Statistics'],
    joinDate: '2023-07-15',
    status: 'published',
    social: {
      linkedin: 'https://linkedin.com/in/emmawilson',
      twitter: 'https://twitter.com/emmawilson'
    }
  },
];

  // Additional members
  const additionalMembers: Member[] = [
    {
      id: 7,
      name: 'Olivia Martinez',
      title: 'Frontend Developer',
      image: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg',
      company: 'Kootenay Digital',
      location: 'Nelson, BC',
      intro: 'A UI/UX Designer at Creative Solutions, skilled in Figma, Adobe XD, and user research.',
      bio: 'Frontend developer specializing in React and modern JavaScript frameworks with a passion for accessible UI design.',
      skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'Accessibility'],
      joinDate: '2023-04-15',
      status: 'published',
      featured: true,
      social: {
        linkedin: 'https://linkedin.com/in/oliviamartinez',
        github: 'https://github.com/oliviamartinez',
        twitter: 'https://twitter.com/oliviamartinez'
      }
    },
    {
      id: 8,
      name: 'Noah Wilson',
      title: 'Backend Engineer',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      company: 'Alpine Software',
      location: 'Rossland, BC',
      intro: 'A Software Engineer at Quantum Leap AI, building robust systems with Java and Spring Boot.',
      bio: 'Backend engineer with expertise in building scalable APIs and microservices using Node.js and Go.',
      skills: ['Node.js', 'Go', 'MongoDB', 'PostgreSQL', 'Docker'],
      joinDate: '2023-05-10',
      status: 'published',
      social: {
        linkedin: 'https://linkedin.com/in/noahwilson',
        github: 'https://github.com/noahwilson'
      }
    },

  {
    id: 16,
    name: 'Benjamin Lee',
    title: 'Blockchain Developer',
    image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    company: 'Digital Ledger Tech',
    location: 'Rossland, BC',
    intro: 'A Blockchain Developer at Digital Ledger Tech, innovating with Solidity and Web3.js for DeFi applications.',
    bio: 'Blockchain developer with experience in smart contract development, DeFi applications, and web3 technologies.',
    skills: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'DeFi'],
    joinDate: '2024-01-10',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/benjaminlee',
      github: 'https://github.com/benjaminlee',
      website: 'https://benjaminlee.dev'
    }
  }
,
  {
    id: 17,
    name: 'Chloe Davis',
    title: 'Data Analyst',
    image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg',
    company: 'Insightful Data Co.',
    location: 'Nelson, BC',
    intro: 'A Data Analyst at Insightful Data Co., turning complex datasets into actionable insights using SQL and Python.',
    bio: 'Detail-oriented data analyst with a passion for uncovering trends and driving data-informed decisions.',
    skills: ['SQL', 'Python', 'Tableau', 'Data Visualization', 'Excel'],
    joinDate: '2024-02-01',
    status: 'published',
    featured: false,
    social: {
      linkedin: 'https://linkedin.com/in/chloedavis',
      github: 'https://github.com/chloedavis'
    }
  },
  {
    id: 18,
    name: 'Marcus Chen',
    title: 'DevOps Engineer',
    image: 'https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg',
    company: 'CloudStream Solutions',
    location: 'Kaslo, BC',
    intro: 'A DevOps Engineer at CloudStream Solutions, streamlining CI/CD pipelines with Jenkins and Kubernetes.',
    bio: 'Experienced DevOps engineer focused on automation, scalability, and infrastructure reliability.',
    skills: ['Jenkins', 'Kubernetes', 'Docker', 'AWS', 'Terraform'],
    joinDate: '2023-11-15',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/marcuschen',
      github: 'https://github.com/marcuschen'
    }
  },
  {
    id: 19,
    name: 'Sophia Miller',
    title: 'UX Researcher',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    company: 'UserFirst Design',
    location: 'Nelson, BC',
    intro: 'A UX Researcher at UserFirst Design, dedicated to understanding user needs through comprehensive research methodologies.',
    bio: 'Passionate UX researcher committed to creating intuitive and user-centered digital experiences.',
    skills: ['User Interviews', 'Surveys', 'Usability Testing', 'Persona Creation', 'Affinity Mapping'],
    joinDate: '2024-03-10',
    status: 'published',
    featured: false,
    social: {
      linkedin: 'https://linkedin.com/in/sophiamiller',
      website: 'https://sophiamiller.design'
    }
  },
  {
    id: 20,
    name: 'Liam Garcia',
    title: 'Mobile Developer (iOS)',
    image: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg',
    company: 'AppWorks Mobile',
    location: 'Creston, BC',
    intro: 'An iOS Developer at AppWorks Mobile, crafting sleek and performant applications using Swift and SwiftUI.',
    bio: 'Creative iOS developer with a strong background in building engaging mobile apps from concept to launch.',
    skills: ['Swift', 'SwiftUI', 'Objective-C', 'Xcode', 'CoreData'],
    joinDate: '2023-10-01',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/liamgarcia',
      github: 'https://github.com/liamgarcia'
    }
  },
  {
    id: 21,
    name: 'Isabelle Moreau',
    title: 'Technical Writer',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    company: 'DocuTech Experts',
    location: 'Nelson, BC',
    intro: 'A Technical Writer at DocuTech Experts, translating complex technical information into clear and concise documentation.',
    bio: 'Skilled technical writer with experience in API documentation, user guides, and knowledge base creation.',
    skills: ['Technical Writing', 'API Documentation', 'MadCap Flare', 'Markdown', 'Confluence'],
    joinDate: '2024-01-20',
    status: 'published',
    featured: false,
    social: {
      linkedin: 'https://linkedin.com/in/isabellemoreau'
    }
  },
  {
    id: 22,
    name: 'Jackson Reid',
    title: 'AI/ML Engineer',
    image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    company: 'IntelliForge AI',
    location: 'Rossland, BC',
    intro: 'An AI/ML Engineer at IntelliForge AI, developing machine learning models with TensorFlow and PyTorch.',
    bio: 'Innovative AI/ML engineer focused on building intelligent systems and advancing machine learning applications.',
    skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Python', 'NLP'],
    joinDate: '2023-09-05',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/jacksonreid',
      github: 'https://github.com/jacksonreid'
    }
  },
  {
    id: 23,
    name: 'Zoe Kim',
    title: 'Cybersecurity Analyst',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    company: 'SecureNet Solutions',
    location: 'Nelson, BC',
    intro: 'A Cybersecurity Analyst at SecureNet Solutions, protecting systems and data through threat detection and vulnerability management.',
    bio: 'Proactive cybersecurity analyst dedicated to mitigating risks and ensuring robust security postures.',
    skills: ['Threat Detection', 'Vulnerability Assessment', 'SIEM', 'Penetration Testing', 'Incident Response'],
    joinDate: '2024-04-01',
    status: 'published',
    featured: false,
    social: {
      linkedin: 'https://linkedin.com/in/zoekim'
    }
  },
  {
    id: 24,
    name: 'Ethan Tremblay',
    title: 'Game Designer',
    image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
    company: 'PixelPlay Studios',
    location: 'Kaslo, BC',
    intro: 'A Game Designer at PixelPlay Studios, creating engaging game mechanics and narratives for new titles.',
    bio: 'Imaginative game designer with a passion for storytelling and crafting immersive player experiences.',
    skills: ['Game Design', 'Unity', 'Unreal Engine', 'Level Design', 'Narrative Design'],
    joinDate: '2023-12-10',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/ethantremblay',
      website: 'https://ethantremblay.games'
    }
  },
  {
    id: 25,
    name: 'Maya Singh',
    title: 'Cloud Solutions Architect',
    image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
    company: 'Stratus Cloud Services',
    location: 'Nelson, BC',
    intro: 'A Cloud Solutions Architect at Stratus Cloud Services, designing scalable and resilient cloud infrastructures on AWS and Azure.',
    bio: 'Experienced cloud architect specializing in designing and implementing robust cloud solutions for diverse business needs.',
    skills: ['AWS', 'Azure', 'GCP', 'Infrastructure as Code', 'Solution Design'],
    joinDate: '2023-08-15',
    status: 'published',
    featured: false,
    social: {
      linkedin: 'https://linkedin.com/in/mayasingh',
      github: 'https://github.com/mayasingh'
    }
  },
  {
    id: 26,
    name: 'David Walker',
    title: 'Full Stack Developer',
    image: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg',
    company: 'Innovatech Labs',
    location: 'Creston, BC',
    intro: 'A Full Stack Developer at Innovatech Labs, proficient in Angular, Spring Boot, and microservices architecture.',
    bio: 'Versatile full stack developer committed to building high-quality, scalable web applications.',
    skills: ['Angular', 'Spring Boot', 'Java', 'TypeScript', 'Microservices'],
    joinDate: '2024-05-01',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/in/davidwalker',
      github: 'https://github.com/davidwalker'
    }
  }
];

export const companies: Company[] = [
  {
    id: 1,
    name: 'Kootenay Wildcrafts',
    description: 'Artisan goods and locally sourced products from the heart of the Kootenays. Specializing in handcrafted soaps, herbal teas, and unique gifts.',
    logo: 'https://images.pexels.com/photos/4099235/pexels-photo-4099235.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/707582/pexels-photo-707582.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Retail', 'Artisan Goods', 'Local Products'],
    size: '1-10 employees',
    founded: '2018',
    location: 'Nelson, BC',
    website: 'https://kootenaywildcrafts.example.com',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/company/kootenaywildcrafts',
    },
    employees: [],
  },
  {
    id: 2,
    name: 'Selkirk Software Solutions',
    description: 'Custom software development and IT consulting services for businesses in the Kootenay region and beyond. We build robust web and mobile applications.',
    logo: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Technology', 'Software Development', 'IT Consulting'],
    size: '11-50 employees',
    founded: '2015',
    location: 'Castlegar, BC',
    website: 'https://selkirksoftware.example.com',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/company/selkirksoftware',
      github: 'https://github.com/selkirksoftware',
    },
    employees: [],
  },
  {
    id: 3,
    name: 'Purcell Mountain Coffee Roasters',
    description: 'Small-batch, ethically sourced coffee roasted with passion in the Purcell Mountains. Supplying cafes and coffee lovers across the Kootenays.',
    logo: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Food & Beverage', 'Coffee Roasting', 'Retail'],
    size: '1-10 employees',
    founded: '2020',
    location: 'Kimberley, BC',
    website: 'https://purcellcoffee.example.com',
    status: 'published',
    featured: false,
    social: {
      linkedin: 'https://linkedin.com/company/purcellcoffee',
    },
    employees: [],
  },
  {
    id: 4,
    name: 'Arrow Lakes Adventure Tours',
    description: 'Guided kayaking, hiking, and wildlife viewing tours on the beautiful Arrow Lakes. Experience the natural wonders of our region.',
    logo: 'https://images.pexels.com/photos/2409038/pexels-photo-2409038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Tourism', 'Outdoor Recreation', 'Adventure Travel'],
    size: '1-10 employees',
    founded: '2017',
    location: 'Nakusp, BC',
    website: 'https://arrowlakesadventures.example.com',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/company/arrowlakesadventures',
    },
    employees: [],
  },
  {
    id: 5,
    name: 'Boundary Country Bicycles',
    description: 'Your local experts for bike sales, repairs, and rentals in Grand Forks. We support all types of riders, from mountain bikers to commuters.',
    logo: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Retail', 'Sports Equipment', 'Bike Repair'],
    size: '1-10 employees',
    founded: '2012',
    location: 'Grand Forks, BC',
    website: 'https://boundarybikes.example.com',
    status: 'published',
    featured: false,
    employees: [],
  },
  {
    id: 6,
    name: 'Slocan Valley Organics',
    description: 'Certified organic farm producing fresh vegetables, fruits, and herbs for local markets and CSA programs. Committed to sustainable agriculture.',
    logo: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/416676/pexels-photo-416676.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Agriculture', 'Organic Farming', 'Local Food'],
    size: '1-10 employees',
    founded: '2008',
    location: 'Slocan, BC',
    website: 'https://slocanvalleyorganics.example.com',
    status: 'published',
    featured: false,
    employees: [],
  },
  {
    id: 7,
    name: 'Kaslo Community Hub',
    description: 'A non-profit organization providing resources, programs, and event spaces for the Kaslo community. Fostering connection and well-being.',
    logo: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/764681/pexels-photo-764681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Non-profit', 'Community Services', 'Event Space'],
    size: '1-10 employees',
    founded: '2019',
    location: 'Kaslo, BC',
    website: 'https://kaslohub.example.com',
    status: 'published',
    featured: true,
    social: {
      linkedin: 'https://linkedin.com/company/kaslohub',
    },
    employees: [],
  },
  {
    id: 8,
    name: 'Creston Valley Mechatronics',
    description: 'Specializing in custom automation solutions, robotics, and mechatronic system design for industrial and agricultural applications.',
    logo: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/7107529/pexels-photo-7107529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Manufacturing', 'Technology', 'Automation', 'Robotics'],
    size: '11-50 employees',
    founded: '2016',
    location: 'Creston, BC',
    website: 'https://crestonmechatronics.example.com',
    status: 'published',
    featured: false,
    social: {
      linkedin: 'https://linkedin.com/company/crestonmechatronics',
    },
    employees: [],
  },
  {
    id: 9,
    name: 'Revelstoke Renewable Energy',
    description: 'Developing and promoting renewable energy projects in the Revelstoke area, including solar, micro-hydro, and geothermal solutions.',
    logo: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Energy', 'Sustainability', 'Renewable Technology'],
    size: '1-10 employees',
    founded: '2021',
    location: 'Revelstoke, BC',
    website: 'https://revelstokerenewables.example.com',
    status: 'published',
    featured: true,
    employees: [],
  },
  {
    id: 10,
    name: 'Golden Timber Framing',
    description: 'Crafting beautiful and sustainable timber frame homes and structures. Combining traditional craftsmanship with modern building science.',
    logo: 'https://images.pexels.com/photos/129494/pexels-photo-129494.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Construction', 'Trades', 'Home Building'],
    size: '11-50 employees',
    founded: '2005',
    location: 'Golden, BC',
    website: 'https://goldentimber.example.com',
    status: 'published',
    featured: false,
    employees: [],
  },
  {
    id: 11,
    name: 'Nakusp Wellness Collective',
    description: 'A collaborative space for holistic health practitioners, offering massage therapy, acupuncture, yoga, and naturopathic services.',
    logo: 'https://images.pexels.com/photos/3985321/pexels-photo-3985321.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Health & Wellness', 'Alternative Medicine', 'Therapy'],
    size: '1-10 employees',
    founded: '2022',
    location: 'Nakusp, BC',
    website: 'https://nakuspwellness.example.com',
    status: 'published',
    featured: false,
    employees: [],
  },
  {
    id: 12,
    name: 'Fernie Alpine Catering',
    description: 'Providing exceptional catering services for weddings, corporate events, and private parties in Fernie and the Elk Valley. Mountain-inspired cuisine.',
    logo: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    coverImage: 'https://images.pexels.com/photos/3323682/pexels-photo-3323682.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    industry: ['Hospitality', 'Food Service', 'Event Catering'],
    size: '1-10 employees',
    founded: '2014',
    location: 'Fernie, BC',
    website: 'https://ferniecatering.example.com',
    status: 'published',
    featured: true,
    employees: [],
  }
];
const sampleGroupMembers: GroupMember[] = [
  { id: 1, name: 'Alice Wonderland', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', role: 'admin', joinedDate: '2024-01-15', title: 'Lead Organizer' },
  { id: 2, name: 'Bob The Builder', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', role: 'member', joinedDate: '2024-02-01', title: 'Tech Enthusiast' },
];

export const groups: Group[] = [
  {
    id: 1,
    name: 'Kootenay Coders Collective',
    description: 'A group for developers of all skill levels in the Kootenays. Share projects, ask questions, and collaborate.',
    longDescription: 'The Kootenay Coders Collective is dedicated to fostering a vibrant and supportive community for software developers, programmers, and tech enthusiasts across the Kootenay region. Whether you\'re a seasoned professional, a student just starting out, or someone curious about coding, you\'re welcome here. We host regular meetups (both online and in-person when possible), workshops, and collaborative coding sessions. Our goal is to learn from each other, build cool things, and help grow the local tech ecosystem.',
    heroImage: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
    coverImage: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
    visibility: 'open',
    memberCount: 125,
    eventCount: 2,
    resourceCount: 10,
    postCount: 30,
    lastActive: '2025-05-20',
    status: 'published',
    featured: true,
    members: sampleGroupMembers,
    events: [
      {
        id: 1,
        title: 'Kootenay Tech Conference 2025',
        date: '2025-09-15',
        description: 'Join us for the annual Kootenay Tech Conference, featuring talks, workshops, and networking opportunities with tech leaders and innovators from across the region and beyond. Explore the latest trends in software development, AI, cybersecurity, and digital marketing.',
        image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg'
      },
      {
        id: 5,
        title: 'Community Coding Night - Open Source Contributions',
        date: '2025-06-20',
        description: 'Join fellow developers for an evening of contributing to open source projects. All skill levels welcome. Bring your laptop and ideas!',
        image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg'
      }
    ],
    resources: [],
    posts: []
  },
  {
    id: 2,
    name: 'Nelson Digital Nomads',
    description: 'Connect with fellow remote workers and digital nomads in the Nelson area. Share tips, co-work, and explore.',
    longDescription: 'Are you working remotely in or around Nelson, BC? The Nelson Digital Nomads group is your hub for connecting with like-minded individuals. We organize casual co-working sessions, social events, and outdoor adventures. Share your favorite coffee shops with good Wi-Fi, discuss the challenges and rewards of remote work, and build your local network. Whether you\'re new to town or a long-time resident embracing the remote lifestyle, join us!',
    heroImage: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
    coverImage: 'https://images.pexels.com/photos/374710/pexels-photo-374710.jpeg',
    visibility: 'open',
    memberCount: 78,
    eventCount: 1,
    resourceCount: 3,
    postCount: 15,
    lastActive: '2025-05-22',
    status: 'published',
    featured: false,
    members: [sampleGroupMembers[1]],
    events: [
      {
        id: 2,
        title: 'Nelson Farmers Market - Summer Season Opening',
        date: '2025-06-01',
        description: 'Celebrate the start of the summer market season! Fresh local produce, artisan crafts, live music, and food trucks. A great day out for the whole family.',
        image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg'
      }
    ],
    resources: [],
    posts: []
  },
  {
    id: 3,
    name: 'Kootenay AI Innovators (Secret)',
    description: 'A private group for professionals and researchers working on AI/ML projects in the region.',
    longDescription: 'This is a closed, invite-only group for individuals actively involved in Artificial Intelligence and Machine Learning research, development, or application within the Kootenay tech community. The purpose is to facilitate high-level discussions, share breakthroughs, and explore collaborative opportunities in a confidential setting. Membership is curated to ensure a focused and productive environment.',
    heroImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    visibility: 'secret',
    memberCount: 23,
    lastActive: '2025-05-18',
    status: 'published',
    featured: false,
    members: [], 
    events: [],
    resources: [],
    posts: []
  },
  {
    id: 4,
    name: 'Kootenay Hikers & Adventurers',
    description: 'For all who love to explore the Kootenay mountains and trails. Share trail conditions, photos, and plan group hikes.',
    longDescription: 'From casual strolls to challenging peaks, the Kootenay Hikers & Adventurers group is for everyone who enjoys the great outdoors. We encourage sharing of trail information, safety tips, and beautiful photography. Join us for regular group hikes and backpacking trips. All skill levels welcome.',
    heroImage: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg',
    coverImage: 'https://images.pexels.com/photos/772803/pexels-photo-772803.jpeg',
    visibility: 'open',
    memberCount: 215,
    eventCount: 1,
    resourceCount: 8,
    postCount: 55,
    lastActive: '2025-05-23',
    status: 'published',
    featured: true,
    members: [sampleGroupMembers[0], sampleGroupMembers[1]],
    events: [
      {
        id: 7,
        title: 'Rossland Mountain Film Festival',
        date: '2025-11-14',
        description: 'A celebration of mountain culture, adventure sports, and environmental filmmaking. Featuring local and international films, guest speakers, and workshops.',
        image: 'https://images.pexels.com/photos/269839/pexels-photo-269839.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: 5,
    name: 'West Kootenay Arts Council',
    description: 'Supporting and promoting artists and arts initiatives throughout the West Kootenays.',
    longDescription: 'The West Kootenay Arts Council is a non-profit organization dedicated to fostering a vibrant arts community. We provide resources for artists, organize exhibitions, workshops, and advocate for arts funding. Connect with fellow artists, discover local talent, and get involved in creative projects.',
    heroImage: 'https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg',
    coverImage: 'https://images.pexels.com/photos/19680/pexels-photo.jpg',
    visibility: 'open',
    memberCount: 95,
    eventCount: 1,
    lastActive: '2025-05-21',
    status: 'published',
    featured: false,
    members: [sampleGroupMembers[0]],
    events: [
      {
        id: 4,
        title: 'Kaslo Jazz Etc. Festival 2025',
        date: '2025-08-02',
        description: 'Experience world-class jazz, blues, and world music on a floating stage in the beautiful setting of Kaslo Bay. A unique and unforgettable festival.',
        image: 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: 6,
    name: 'Kootenay Lake Sailing Club (Closed)',
    description: 'A closed group for members of the Kootenay Lake Sailing Club. Discuss races, boat maintenance, and social events.',
    longDescription: 'This group is exclusively for registered members of the Kootenay Lake Sailing Club. Share your sailing adventures, get advice on boat repairs, organize crewing opportunities, and stay updated on club news and regattas.',
    heroImage: 'https://images.pexels.com/photos/912422/pexels-photo-912422.jpeg',
    visibility: 'closed',
    memberCount: 62,
    lastActive: '2025-05-19',
    status: 'published',
    featured: false,
    members: [],
    events: [], resources: [], posts: []
  },
  {
    id: 7,
    name: 'Slocan Valley Growers Market',
    description: 'Connecting local farmers, artisans, and consumers in the Slocan Valley. Find fresh produce, handmade goods, and support local.',
    longDescription: 'The Slocan Valley Growers Market group is your online portal to the best of local agriculture and crafts. Farmers can post their available produce, artisans can showcase their creations, and consumers can find out what\'s fresh and in season. Let\'s build a stronger local food system together!',
    heroImage: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg',
    visibility: 'open',
    memberCount: 150,
    eventCount: 1,
    lastActive: '2025-05-22',
    status: 'published',
    featured: true,
    members: [sampleGroupMembers[1]],
    events: [
      {
        id: 2,
        title: 'Nelson Farmers Market - Summer Season Opening',
        date: '2025-06-01',
        description: 'Celebrate the start of the summer market season! Fresh local produce, artisan crafts, live music, and food trucks. A great day out for the whole family.',
        image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: 8,
    name: 'Kootenay Game Developers Meetup',
    description: 'A community for indie game developers, designers, and artists in the Kootenays. Share projects, get feedback, and collaborate.',
    longDescription: 'Whether you\'re a hobbyist or a professional, the Kootenay Game Developers Meetup is the place to connect with others passionate about game creation. We host show-and-tell sessions, game jams, and discussions on tools and techniques. All platforms and genres welcome.',
    heroImage: 'https://images.pexels.com/photos/7238759/pexels-photo-7238759.jpeg',
    visibility: 'open',
    memberCount: 45,
    eventCount: 1,
    lastActive: '2025-05-17',
    status: 'published',
    featured: false,
    members: [],
    events: [
      {
        id: 5,
        title: 'Community Coding Night - Open Source Contributions',
        date: '2025-06-20',
        description: 'Join fellow developers for an evening of contributing to open source projects. All skill levels welcome. Bring your laptop and ideas!',
        image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: 9,
    name: 'Boundary Country History Buffs (Secret)',
    description: 'A private research group for local historians and genealogists focusing on the Boundary region.',
    longDescription: 'This secret group is for dedicated researchers exploring the rich history of the Boundary Country. Share findings, discuss historical records, and collaborate on projects related to local families, industries, and events. Membership by referral.',
    heroImage: 'https://images.pexels.com/photos/769155/pexels-photo-769155.jpeg',
    visibility: 'secret',
    memberCount: 18,
    lastActive: '2025-05-15',
    status: 'published',
    featured: false,
    members: [],
    events: [], resources: [], posts: []
  },
  {
    id: 10,
    name: 'East Kootenay Climbers Coalition',
    description: 'Advocacy, access, and community for rock climbers in the East Kootenays.',
    longDescription: 'The EKCC works to preserve climbing access, promote safety and stewardship, and build a strong climbing community in the East Kootenays. Join us for crag cleanups, route development discussions, and social events.',
    heroImage: 'https://images.pexels.com/photos/1261731/pexels-photo-1261731.jpeg',
    visibility: 'open',
    memberCount: 110,
    eventCount: 1,
    lastActive: '2025-05-20',
    status: 'published',
    featured: true,
    members: [sampleGroupMembers[0]],
    events: [
      {
        id: 7,
        title: 'Rossland Mountain Film Festival',
        date: '2025-11-14',
        description: 'A celebration of mountain culture, adventure sports, and environmental filmmaking. Featuring local and international films, guest speakers, and workshops.',
        image: 'https://images.pexels.com/photos/269839/pexels-photo-269839.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: 11,
    name: 'Nelson Book Club',
    description: 'A friendly group for book lovers in Nelson. We meet monthly to discuss a chosen book.',
    longDescription: 'Join the Nelson Book Club for lively discussions about a wide range of genres. We vote on a book each month and meet in a relaxed setting to share our thoughts. New members are always welcome!',
    heroImage: 'https://images.pexels.com/photos/34075/pexels-photo.jpg',
    visibility: 'open',
    memberCount: 55,
    eventCount: 1,
    lastActive: '2025-05-10',
    status: 'published',
    featured: false,
    members: [sampleGroupMembers[1]],
    events: [
      {
        id: 3,
        title: 'Online Workshop: Introduction to Cybersecurity for Small Businesses',
        date: '2025-07-10',
        description: 'Learn the fundamentals of cybersecurity to protect your small business from common online threats. Topics include password management, phishing awareness, data backup, and secure network practices.',
        image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: 12,
    name: 'Kootenay Permaculture Guild',
    description: 'Sharing knowledge and resources for sustainable living and permaculture design in the Kootenays.',
    longDescription: 'The Kootenay Permaculture Guild connects individuals interested in ecological design, regenerative agriculture, and sustainable living. We organize workshops, site visits, and seed exchanges. Learn how to apply permaculture principles to your home, garden, or community.',
    heroImage: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg',
    visibility: 'open',
    memberCount: 88,
    eventCount: 1,
    lastActive: '2025-05-18',
    status: 'published',
    featured: true,
    members: [],
    events: [
      {
        id: 2,
        title: 'Nelson Farmers Market - Summer Season Opening',
        date: '2025-06-01',
        description: 'Celebrate the start of the summer market season! Fresh local produce, artisan crafts, live music, and food trucks. A great day out for the whole family.',
        image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: 13,
    name: 'Arrow Lakes Photography Club (Closed)',
    description: 'A closed group for photography enthusiasts in the Arrow Lakes region to share work and techniques.',
    longDescription: 'This group is for photographers of all levels in the Arrow Lakes area. Share your latest shots, discuss gear and techniques, critique work constructively, and plan photo outings. Membership is for local residents.',
    heroImage: 'https://images.pexels.com/photos/368893/pexels-photo-368893.jpeg',
    visibility: 'closed',
    memberCount: 35,
    lastActive: '2025-05-16',
    status: 'published',
    featured: false,
    members: [sampleGroupMembers[0], sampleGroupMembers[1]],
    events: [], resources: [], posts: []
  }
];
export const events: Event[] = [
  {
    id: 1,
    title: 'Kootenay Tech Conference 2025',
    date: '2025-09-15',
    endDate: '2025-09-17',
    location: 'Nelson Innovation Centre, Nelson, BC',
    description: 'Join us for the annual Kootenay Tech Conference, featuring talks, workshops, and networking opportunities with tech leaders and innovators from across the region and beyond. Explore the latest trends in software development, AI, cybersecurity, and digital marketing.',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
    organizer: { id: 1, name: 'Kootenay Association for Technology', image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg' },
    attendees: 250,
    type: 'hybrid',
    url: 'https://kootenaytechconf.example.com',
    status: 'published',
    featured: true,
    sessions: [
      {
        id: 1,
        title: 'Keynote: The Future of AI in Rural Economies',
        description: 'Exploring how artificial intelligence can drive innovation and growth in non-urban settings.',
        startTime: '2025-09-15T09:00:00',
        endTime: '2025-09-15T10:00:00',
        presenters: [{ id: 1, name: 'Dr. Evelyn Reed', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', title: 'Chief AI Strategist', company: 'Innovate BC' }]
      },
      {
        id: 2,
        title: 'Workshop: Mastering Modern JavaScript Frameworks',
        description: 'A hands-on workshop for intermediate developers looking to deepen their understanding of React, Vue, and Svelte.',
        startTime: '2025-09-15T10:30:00',
        endTime: '2025-09-15T12:30:00',
        presenters: [{ id: 2, name: 'John Code', image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg', title: 'Senior Frontend Developer', company: 'Tech Solutions Inc.' }]
      }
    ]
  },
  {
    id: 2,
    title: 'Nelson Farmers Market - Summer Season Opening',
    date: '2025-06-01',
    location: 'Cottonwood Falls Park, Nelson, BC',
    description: 'Celebrate the start of the summer market season! Fresh local produce, artisan crafts, live music, and food trucks. A great day out for the whole family.',
    image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg',
    organizer: { id: 2, name: 'Nelson Farmers Market Association', image: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg' },
    attendees: 500,
    type: 'in-person',
    status: 'published',
    featured: true
  },
  {
    id: 3,
    title: 'Online Workshop: Introduction to Cybersecurity for Small Businesses',
    date: '2025-07-10',
    location: 'Online via Zoom',
    description: 'Learn the fundamentals of cybersecurity to protect your small business from common online threats. Topics include password management, phishing awareness, data backup, and secure network practices.',
    image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg',
    organizer: { id: 3, name: 'SecureTech Kootenays', image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg' },
    attendees: 75,
    type: 'online',
    url: 'https://securetechkootenays.example.com/workshop',
    status: 'published',
    featured: false
  },
  {
    id: 4,
    title: 'Kaslo Jazz Etc. Festival 2025',
    date: '2025-08-02',
    endDate: '2025-08-04',
    location: 'Kaslo Bay Park, Kaslo, BC',
    description: 'Experience world-class jazz, blues, and world music on a floating stage in the beautiful setting of Kaslo Bay. A unique and unforgettable festival.',
    image: 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg',
    organizer: { id: 4, name: 'Kaslo Jazz Etc. Society', image: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg' },
    attendees: 3000,
    type: 'in-person',
    url: 'https://kaslojazzfest.com',
    status: 'published',
    featured: true
  },
  {
    id: 5,
    title: 'Community Coding Night - Open Source Contributions',
    date: '2025-06-20',
    location: 'Nelson Innovation Centre, Nelson, BC',
    description: 'Join fellow developers for an evening of contributing to open source projects. All skill levels welcome. Bring your laptop and ideas!',
    image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
    organizer: { id: 1, name: 'Kootenay Coders Collective', image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg' },
    attendees: 30,
    type: 'in-person',
    status: 'published',
    featured: false
  },
  {
    id: 6,
    title: 'Digital Marketing Trends for 2026 - Webinar',
    date: '2025-11-05',
    location: 'Online',
    description: 'Stay ahead of the curve with this insightful webinar on upcoming digital marketing trends. Learn about new strategies in SEO, content marketing, social media, and AI-driven advertising.',
    image: 'https://images.pexels.com/photos/6476254/pexels-photo-6476254.jpeg',
    organizer: { id: 5, name: 'Marketing Masters Inc.', image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg' },
    attendees: 150,
    type: 'online',
    url: 'https://marketingmasters.example.com/webinar/trends2026',
    status: 'published',
    featured: true
  },
  {
    id: 7,
    title: 'Rossland Mountain Film Festival',
    date: '2025-11-14',
    endDate: '2025-11-16',
    location: 'Miners Hall, Rossland, BC',
    description: 'A celebration of mountain culture, adventure sports, and environmental filmmaking. Featuring local and international films, guest speakers, and workshops.',
    image: 'https://images.pexels.com/photos/269839/pexels-photo-269839.jpeg',
    organizer: { id: 6, name: 'Rossland Council for Arts and Culture', image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg' },
    attendees: 400,
    type: 'in-person',
    url: 'https://rosslandfilmfest.example.com',
    status: 'published',
    featured: false
  },
  {
    id: 8,
    title: 'Past Event: Kootenay Virtual Reality Showcase 2024',
    date: '2024-10-20',
    endDate: '2024-10-21',
    location: 'Online & Nelson Innovation Centre',
    description: 'An exploration of VR/AR technologies and their applications in various industries. Featured demos from local developers and panel discussions with experts.',
    image: 'https://images.pexels.com/photos/7238759/pexels-photo-7238759.jpeg',
    organizer: { id: 1, name: 'Kootenay Association for Technology', image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg' },
    attendees: 120,
    type: 'hybrid',
    url: 'https://kootenayvr2024.example.com',
    status: 'archived',
    featured: false,
    sessions: [
      {
        id: 1,
        title: 'Keynote: The Metaverse in the Kootenays - Opportunities & Challenges',
        description: 'Discussing the potential impact of metaverse technologies on local businesses and communities.',
        startTime: '2024-10-20T09:00:00',
        endTime: '2024-10-20T10:00:00',
        presenters: [{ id: 3, name: 'Alex Virtual', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', title: 'Lead VR Researcher', company: 'Future Realities Lab' }],
        videoUrl: 'https://vimeo.com/123456789',
        resources: [
          {
            id: 1,
            title: 'Metaverse in the Kootenays Slides',
            url: 'https://slideshare.net/alexvirtual/metaverse-kootenays',
            type: 'slides'
          }
        ]
      },
      {
        id: 2,
        title: 'Workshop: Introduction to Unity for VR Development',
        description: 'A beginner-friendly workshop on creating simple VR experiences using Unity.',
        startTime: '2024-10-20T10:30:00',
        endTime: '2024-10-20T12:30:00',
        presenters: [{ id: 4, name: 'Dev Guru', image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg', title: 'Senior Unity Developer', company: 'Kootenay Game Studios' }]
      }
    ]
  },
  {
    id: 9,
    title: 'Past Workshop: Advanced Git & GitHub for Teams 2024',
    date: '2024-11-15',
    location: 'Online',
    description: 'Deep dive into advanced Git techniques, branching strategies, and collaborative workflows using GitHub for development teams.',
    image: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg',
    organizer: { id: 1, name: 'Kootenay Coders Collective', image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg' },
    attendees: 45,
    type: 'online',
    url: 'https://kootenaycoders.example.com/git-advanced-2024',
    status: 'archived',
    featured: false,
    sessions: [
      {
        id: 1,
        title: 'Mastering Git Rebase and Merge Conflicts',
        description: 'Strategies for handling complex merge scenarios and maintaining a clean commit history.',
        startTime: '2024-11-15T09:00:00',
        endTime: '2024-11-15T11:00:00',
        presenters: [{ id: 2, name: 'John Code', image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg', title: 'Senior Software Engineer', company: 'GitGood Inc.' }],
        videoUrl: 'https://youtube.com/watch?v=abcdef12345',
        resources: [
          {
            id: 1,
            title: 'Git Rebase and Merge Slides',
            url: 'https://example.com/slides/git-rebase-merge.pdf',
            type: 'slides'
          }
        ]
      }
    ]
  },
  {
    id: 10,
    title: 'Past Conference: Kootenay Agri-Tech Forum 2024',
    date: '2024-09-05',
    endDate: '2024-09-06',
    location: 'Creston Community Complex, Creston, BC',
    description: 'Exploring innovations in agricultural technology, sustainable farming practices, and food security in the Kootenay region.',
    image: 'https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg',
    organizer: { id: 7, name: 'Kootenay Agricultural Society', image: 'https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg' },
    attendees: 180,
    type: 'in-person',
    status: 'archived',
    featured: true
  },
  {
    id: 11,
    title: 'Past Webinar: SEO Strategies for Local Businesses 2024',
    date: '2024-07-22',
    location: 'Online',
    description: 'Effective SEO tactics to help Kootenay-based small businesses improve their online visibility and attract local customers.',
    image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
    organizer: { id: 5, name: 'Marketing Masters Inc.', image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg' },
    attendees: 90,
    type: 'online',
    url: 'https://marketingmasters.example.com/webinar/seo-local-2024',
    status: 'archived',
    featured: false,
    sessions: [
      {
        id: 1,
        title: 'Google My Business Optimization for Maximum Impact',
        description: 'A step-by-step guide to optimizing your GMB listing.',
        startTime: '2024-07-22T10:00:00',
        endTime: '2024-07-22T11:00:00',
        presenters: [{ id: 8, name: 'Sarah Search', image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg', title: 'SEO Specialist', company: 'RankHigh Digital' }],
        videoUrl: 'https://youtube.com/watch?v=seo-gmb-vid',
        resources: [
          {
            id: 1,
            title: 'GMB Optimization Slides',
            url: 'https://example.com/slides/gmb-optimization.pptx',
            type: 'slides'
          }
        ]
      }
    ]
  },
  {
    id: 12,
    title: 'Past Event: Nelson Mural Festival 2024 - Closing Celebration',
    date: '2024-08-18',
    location: 'Hall Street Plaza, Nelson, BC',
    description: 'The grand finale of the annual Nelson Mural Festival, celebrating public art with live music, artist talks, and community engagement.',
    image: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg',
    organizer: { id: 6, name: 'Nelson District Arts Council', image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg' },
    attendees: 600,
    type: 'in-person',
    status: 'archived',
    featured: true
  },
  {
    id: 13,
    title: 'Past Workshop: Intro to 3D Printing & Design 2024',
    date: '2024-06-10',
    location: 'Selkirk College, Nelson Campus',
    description: 'A hands-on introduction to the basics of 3D printing, including CAD design fundamentals and operating a 3D printer.',
    image: 'https://images.pexels.com/photos/4099125/pexels-photo-4099125.jpeg',
    organizer: { id: 1, name: 'Kootenay Association for Technology', image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg' },
    attendees: 25,
    type: 'in-person',
    status: 'archived',
    featured: false,
    sessions: [
      {
        id: 1,
        title: 'Designing Your First 3D Model in TinkerCAD',
        description: 'Learn the basics of 3D modeling with TinkerCAD.',
        startTime: '2024-06-10T13:00:00',
        endTime: '2024-06-10T15:00:00',
        presenters: [{ id: 9, name: 'Fabian Model', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', title: '3D Printing Technician', company: 'Selkirk College' }],
        resources: [
          {
            id: 1,
            title: 'TinkerCAD Intro Slides',
            url: 'https://example.com/slides/tinkercad-intro.pdf',
            type: 'slides'
          }
        ]
      }
    ]
  }
];
export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "The Future of AI in Rural Communities",
    excerpt: "Exploring how artificial intelligence can bridge gaps and create opportunities in less urbanized areas like the Kootenays.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    date: "2025-05-20",
    image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
    author: { id: 1, name: "Sarah Johnson", image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg" },
    tags: ["AI", "Rural Tech", "Innovation"],
    status: "published",
    featured: true
  },
  {
    id: 2,
    title: "Getting Started with Machine Learning: A Kootenay Perspective",
    excerpt: "A beginner-friendly guide to ML concepts, with a focus on resources available to aspiring techies in the Kootenay region.",
    content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    date: "2025-05-15",
    image: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    author: { id: 2, name: "Michael Chen", image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg" },
    tags: ["Machine Learning", "Education", "Kootenays"],
    status: "published",
    featured: false
  },
  {
    id: 3,
    title: "Data-Driven Decisions for Small Town Businesses",
    excerpt: "How small businesses in towns like Rossland and Nelson can leverage data analytics for growth.",
    content: "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?",
    date: "2025-05-10",
    image: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg",
    author: { id: 3, name: "Emma Wilson", image: "https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg" },
    tags: ["Data Science", "Small Business", "Analytics"],
    status: "published",
    featured: true
  },
  {
    id: 4,
    title: "Accessible Web Design: Why It Matters for Kootenay Websites",
    excerpt: "Ensuring your local business website is usable by everyone, including those with disabilities.",
    content: "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
    date: "2025-05-05",
    image: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg",
    author: { id: 7, name: "Olivia Martinez", image: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg" },
    tags: ["Web Design", "Accessibility", "UX"],
    status: "published",
    featured: false
  },
  {
    id: 5,
    title: "Building Scalable Backends for Local Tech Startups",
    excerpt: "Challenges and solutions for developing robust backend systems for growing Kootenay tech companies.",
    content: "Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
    date: "2025-04-30",
    image: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg",
    author: { id: 8, name: "Noah Wilson", image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg" },
    tags: ["Backend", "Startups", "Scalability"],
    status: "published",
    featured: true
  },
  {
    id: 6,
    title: "Blockchain Beyond Crypto: Use Cases for Regional Economies",
    excerpt: "Exploring practical applications of blockchain technology that could benefit the Kootenay region.",
    content: "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
    date: "2025-04-25",
    image: "https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg",
    author: { id: 16, name: "Benjamin Lee", image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg" },
    tags: ["Blockchain", "Innovation", "Local Economy"],
    status: "published",
    featured: false
  },
  {
    id: 7,
    title: "Unlocking Insights: A Data Analyst's Journey in Nelson",
    excerpt: "A personal story about working as a data analyst in the Kootenay tech scene.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Accumsan lacus vel facilisis volutpat est velit egestas dui id. Porttitor massa id neque aliquam vestibulum morbi blandit cursus risus.",
    date: "2025-04-20",
    image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg",
    author: { id: 17, name: "Chloe Davis", image: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg" },
    tags: ["Data Analysis", "Career", "Nelson Tech"],
    status: "published",
    featured: true
  },
  {
    id: 8,
    title: "DevOps in the Mountains: CI/CD for Kootenay Tech Teams",
    excerpt: "Implementing efficient DevOps practices for software teams based in the Kootenays.",
    content: "Vitae congue eu consequat ac felis donec et odio. Amet justo donec enim diam vulputate ut pharetra sit. Urna condimentum mattis pellentesque id nibh tortor id aliquet lectus.",
    date: "2025-04-15",
    image: "https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg",
    author: { id: 18, name: "Marcus Chen", image: "https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg" },
    tags: ["DevOps", "CI/CD", "Software Development"],
    status: "published",
    featured: false
  },
  {
    id: 9,
    title: "User Research for Local Impact: A Kootenay Case Study",
    excerpt: "How understanding local user needs shaped a recent tech project in the region.",
    content: "Pellentesque habitant morbi tristique senectus et netus et malesuada. Arcu cursus euismod quis viverra nibh cras pulvinar mattis nunc. Ac tortor dignissim convallis aenean et tortor at risus viverra.",
    date: "2025-04-10",
    image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg",
    author: { id: 19, name: "Sophia Miller", image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" },
    tags: ["UX Research", "User Experience", "Case Study"],
    status: "published",
    featured: true
  },
  {
    id: 10,
    title: "Crafting Native iOS Experiences for the Kootenay Market",
    excerpt: "Tips and tricks for developing iOS apps that resonate with users in the Kootenay region.",
    content: "Nisl rhoncus mattis rhoncus urna neque viverra justo nec. Eget nullam non nisi est sit amet facilisis magna. Mattis enim ut tellus elementum sagittis vitae et leo duis.",
    date: "2025-04-05",
    image: "https://images.pexels.com/photos/39284/pexels-photo-39284.jpeg",
    author: { id: 20, name: "Liam Garcia", image: "https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg" },
    tags: ["iOS Development", "Mobile Apps", "App Design"],
    status: "published",
    featured: false
  },
  {
    id: 11,
    title: "The Art of Clear Technical Writing for Complex Kootenay Tech",
    excerpt: "Making complex technology understandable through effective technical documentation.",
    content: "Faucibus purus in massa tempor nec feugiat nisl pretium. Tellus cras adipiscing enim eu turpis egestas pretium aenean. Diam maecenas sed enim ut sem viverra aliquet eget.",
    date: "2025-03-30",
    image: "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg",
    author: { id: 21, name: "Isabelle Moreau", image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg" },
    tags: ["Technical Writing", "Documentation", "Communication"],
    status: "published",
    featured: true
  },
  {
    id: 12,
    title: "AI/ML Innovations Brewing in Rossland's Tech Scene",
    excerpt: "A look at exciting AI and Machine Learning projects emerging from Rossland, BC.",
    content: "Elementum curabitur vitae nunc sed velit dignissim sodales ut. Eu sem integer vitae justo eget magna fermentum iaculis eu. Blandit aliquam etiam erat velit scelerisque in dictum non consectetur.",
    date: "2025-03-25",
    image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg",
    author: { id: 22, name: "Jackson Reid", image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg" },
    tags: ["AI", "Machine Learning", "Rossland Tech"],
    status: "published",
    featured: false
  }
];
export const resources: Resource[] = [
  {
    id: 1,
    title: 'Ultimate Guide to React Hooks',
    description: 'A comprehensive guide covering all React hooks with examples and best practices.',
    type: 'guide',
    url: 'https://example.com/react-hooks-guide',
    image: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg',
    dateAdded: '2025-04-10',
    contributor: { id: 1, name: 'Sarah Johnson' },
    status: 'published',
    featured: true
  },
  {
    id: 2,
    title: 'Tanstack Query Deep Dive',
    description: 'Video series exploring advanced concepts and patterns in Tanstack Query (React Query).',
    type: 'video',
    url: 'https://youtube.com/playlist?list=PL123ABCDEF',
    image: 'https://images.pexels.com/photos/5775854/pexels-photo-5775854.jpeg',
    dateAdded: '2025-03-20',
    contributor: { id: 2, name: 'Michael Chen' },
    status: 'published',
    featured: false
  },
  {
    id: 3,
    title: 'Tailwind CSS Best Practices for Large Applications',
    description: 'An article discussing strategies for managing Tailwind CSS in large-scale projects, including configuration, component design, and maintainability.',
    type: 'article',
    url: 'https://example.com/tailwind-best-practices',
    image: 'https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg',
    dateAdded: '2025-05-01',
    contributor: { id: 3, name: 'Alex Rodriguez' },
    status: 'published',
    featured: true
  },
  {
    id: 4,
    title: 'Figma for Developers Toolkit',
    description: 'A collection of Figma plugins and tips specifically for developers to improve collaboration with designers.',
    type: 'tool',
    url: 'https://example.com/figma-dev-toolkit',
    image: 'https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg',
    dateAdded: '2025-04-25',
    contributor: { id: 1, name: 'Sarah Johnson' },
    status: 'published',
    featured: false
  },
  {
    id: 5,
    title: 'Accessibility Checklist for Web Apps',
    description: 'A comprehensive checklist to ensure your web applications meet WCAG 2.1 AA standards.',
    type: 'document',
    url: 'https://example.com/accessibility-checklist.pdf',
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
    dateAdded: '2025-05-15',
    contributor: { id: 4, name: 'Emily Carter' },
    status: 'published',
    featured: true
  },
  {
    id: 6,
    title: 'Introduction to TypeScript for JavaScript Developers',
    description: 'A beginner-friendly guide to understanding TypeScript and how it enhances JavaScript development.',
    type: 'guide',
    url: 'https://example.com/typescript-for-js-devs',
    image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
    dateAdded: '2025-05-20',
    contributor: { id: 2, name: 'Michael Chen' },
    status: 'published',
    featured: true
  },
  {
    id: 7,
    title: 'State Management in React: Context vs. Redux vs. Zustand',
    description: 'An article comparing popular state management solutions for React applications, helping you choose the right one for your project.',
    type: 'article',
    url: 'https://example.com/react-state-management-comparison',
    image: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg',
    dateAdded: '2025-05-18',
    contributor: { id: 3, name: 'Alex Rodriguez' },
    status: 'published',
    featured: false
  },
  {
    id: 8,
    title: 'Building a REST API with Node.js and Express',
    description: 'A step-by-step video tutorial on creating a robust REST API using Node.js and the Express framework.',
    type: 'video',
    url: 'https://youtube.com/playlist?list=PLXYZ123456',
    image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
    dateAdded: '2025-05-12',
    contributor: { id: 1, name: 'Sarah Johnson' },
    status: 'published',
    featured: true
  },
  {
    id: 9,
    title: 'Git & GitHub for Beginners: A Practical Guide',
    description: 'Learn the fundamentals of version control with Git and how to collaborate effectively using GitHub.',
    type: 'guide',
    url: 'https://example.com/git-github-beginners',
    image: 'https://images.pexels.com/photos/693859/pexels-photo-693859.jpeg',
    dateAdded: '2025-05-08',
    contributor: { id: 4, name: 'Emily Carter' },
    status: 'published',
    featured: false
  },
  {
    id: 10,
    title: 'Docker Essentials for Developers',
    description: 'A document outlining the core concepts of Docker and how to use it for containerizing applications.',
    type: 'document',
    url: 'https://example.com/docker-essentials.pdf',
    image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
    dateAdded: '2025-05-02',
    contributor: { id: 2, name: 'Michael Chen' },
    status: 'published',
    featured: true
  },
  {
    id: 11,
    title: 'Responsive Web Design with Flexbox and Grid',
    description: 'Master modern CSS layout techniques using Flexbox and CSS Grid to build responsive websites.',
    type: 'guide',
    url: 'https://example.com/responsive-design-flexbox-grid',
    image: 'https://images.pexels.com/photos/38544/imac-apple-mockup-app-38544.jpeg',
    dateAdded: '2025-04-28',
    contributor: { id: 3, name: 'Alex Rodriguez' },
    status: 'published',
    featured: false
  },
  {
    id: 12,
    title: 'SEO Basics for Small Businesses',
    description: 'An introductory article on Search Engine Optimization (SEO) tailored for small business owners looking to improve their online visibility.',
    type: 'article',
    url: 'https://example.com/seo-small-business',
    image: 'https://images.pexels.com/photos/6476254/pexels-photo-6476254.jpeg',
    dateAdded: '2025-04-22',
    contributor: { id: 1, name: 'Sarah Johnson' },
    status: 'published',
    featured: true
  },
  {
    id: 13,
    title: 'Cybersecurity Fundamentals for Remote Workers',
    description: 'A video guide covering essential cybersecurity practices for individuals working remotely to protect sensitive data.',
    type: 'video',
    url: 'https://youtube.com/playlist?list=PLSECURE789',
    image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg',
    dateAdded: '2025-04-15',
    contributor: { id: 4, name: 'Emily Carter' },
    status: 'published',
    featured: false
  },
  {
    id: 14,
    title: 'Project Management Tools Comparison: Asana vs. Trello vs. Jira',
    description: 'A detailed comparison of popular project management tools to help teams choose the best fit for their workflow.',
    type: 'tool',
    url: 'https://example.com/project-management-tools-comparison',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
    dateAdded: '2025-04-08',
    contributor: { id: 2, name: 'Michael Chen' },
    status: 'published',
    featured: true
  },
  {
    id: 15,
    title: 'The Art of Effective Communication in Tech Teams',
    description: 'A document outlining strategies and best practices for clear and effective communication within technology teams.',
    type: 'document',
    url: 'https://example.com/tech-team-communication.pdf',
    image: 'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg',
    dateAdded: '2025-04-01',
    contributor: { id: 3, name: 'Alex Rodriguez' },
    status: 'published',
    featured: false
  },
  {
    id: 16,
    title: 'DevOps Culture and Practices Handbook',
    description: 'A comprehensive document outlining best practices for fostering a strong DevOps culture and implementing efficient CI/CD pipelines.',
    type: 'document',
    url: 'https://example.com/devops-culture-handbook.pdf',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
    dateAdded: '2025-05-20',
    contributor: { id: 1, name: 'Sarah Johnson' },
    status: 'published',
    featured: true
  },
  {
    id: 17,
    title: 'AI-Powered Code Generation Tools Review',
    description: 'A review of the top AI tools that assist in code generation, debugging, and testing, such as GitHub Copilot and Tabnine.',
    type: 'tool',
    url: 'https://example.com/ai-code-gen-tools-review',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    dateAdded: '2025-05-19',
    contributor: { id: 2, name: 'Michael Chen' },
    status: 'published',
    featured: false
  },
  {
    id: 18,
    title: 'Mastering Microservices Communication Patterns',
    description: 'Video series covering synchronous and asynchronous communication patterns in microservices architectures, including REST, gRPC, and message queues.',
    type: 'video',
    url: 'https://youtube.com/playlist?list=PLMICROCOMM789',
    image: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg',
    dateAdded: '2025-05-18',
    contributor: { id: 3, name: 'Alex Rodriguez' },
    status: 'published',
    featured: true
  },
  {
    id: 19,
    title: 'Ethical Hacking and Penetration Testing Fundamentals',
    description: 'An introductory guide to the principles and methodologies of ethical hacking and penetration testing for securing systems.',
    type: 'guide',
    url: 'https://example.com/ethical-hacking-fundamentals',
    image: 'https://images.pexels.com/photos/5380603/pexels-photo-5380603.jpeg',
    dateAdded: '2025-05-17',
    contributor: { id: 4, name: 'Emily Carter' },
    status: 'published',
    featured: false
  },
  {
    id: 20,
    title: 'The Future of Quantum Computing and Its Impact on Tech',
    description: 'An article exploring the potential of quantum computing and its implications for various technology sectors.',
    type: 'article',
    url: 'https://example.com/future-quantum-computing',
    image: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg',
    dateAdded: '2025-05-16',
    contributor: { id: 1, name: 'Sarah Johnson' },
    status: 'published',
    featured: true
  },
  {
    id: 21,
    title: 'Kubernetes Monitoring and Observability Tools',
    description: 'A curated list of tools and best practices for monitoring Kubernetes clusters and ensuring observability.',
    type: 'tool',
    url: 'https://example.com/kubernetes-monitoring-tools',
    image: 'https://images.pexels.com/photos/614117/pexels-photo-614117.jpeg',
    dateAdded: '2025-05-15',
    contributor: { id: 2, name: 'Michael Chen' },
    status: 'published',
    featured: false
  },
  {
    id: 22,
    title: 'Progressive Web Apps (PWAs): The Definitive Guide',
    description: 'A comprehensive guide to building and deploying Progressive Web Apps, covering service workers, manifests, and offline capabilities.',
    type: 'guide',
    url: 'https://example.com/pwa-definitive-guide',
    image: 'https://images.pexels.com/photos/169573/pexels-photo-169573.jpeg',
    dateAdded: '2025-05-14',
    contributor: { id: 3, name: 'Alex Rodriguez' },
    status: 'published',
    featured: true
  },
  {
    id: 23,
    title: 'Data Structures and Algorithms in Python - Full Course',
    description: 'A complete video course covering essential data structures and algorithms implemented in Python.',
    type: 'video',
    url: 'https://youtube.com/playlist?list=PLPYTHONALGOS101',
    image: 'https://images.pexels.com/photos/5775854/pexels-photo-5775854.jpeg',
    dateAdded: '2025-05-13',
    contributor: { id: 4, name: 'Emily Carter' },
    status: 'published',
    featured: false
  },
  {
    id: 24,
    title: 'Open Source Contribution Guide for Beginners',
    description: 'A document to help newcomers understand how to start contributing to open-source projects effectively.',
    type: 'document',
    url: 'https://example.com/opensource-contribution-guide.pdf',
    image: 'https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg',
    dateAdded: '2025-05-12',
    contributor: { id: 1, name: 'Sarah Johnson' },
    status: 'published',
    featured: true
  }
];
export const marketplaceItems: MarketplaceItem[] = [
  {
    id: 1,
    title: 'Handmade Ceramic Mug Set (4)',
    description: 'Beautiful, locally crafted ceramic mugs. Perfect for your morning coffee or tea. Set of 4, unique glaze on each.',
    price: 85.00,
    type: 'product',
    category: 'Home Goods',
    image: 'https://images.pexels.com/photos/1300367/pexels-photo-1300367.jpeg',
    seller: { id: 5, name: 'Kootenay Pottery Co.', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
    datePosted: '2025-05-05',
    status: 'published',
    featured: true
  },
  {
    id: 2,
    title: 'Freelance Web Development Services',
    description: 'Experienced web developer offering services for custom websites, e-commerce solutions, and web application development. Specializing in React, Node.js, and Shopify.',
    type: 'service',
    category: 'Professional Services',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
    seller: { id: 6, name: 'DevWorks Solutions', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' },
    datePosted: '2025-04-15',
    status: 'published',
    featured: false
  },
  {
    id: 3,
    title: 'Vintage Mountain Bike - Norco Sasquatch 1998',
    description: 'Classic Norco Sasquatch mountain bike from 1998. In good condition for its age, perfect for a collector or retro enthusiast. Needs a tune-up.',
    price: 350.00,
    type: 'equipment',
    category: 'Sporting Goods',
    image: 'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg',
    seller: { id: 7, name: 'BikeHoarder Nelson', image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg' },
    datePosted: '2025-05-10',
    status: 'published',
    featured: false
  },
  {
    id: 4,
    title: 'Workshop: Introduction to Local Beekeeping',
    description: 'Join us for a hands-on workshop covering the basics of beekeeping in the Kootenay region. Learn about hive management, honey extraction, and supporting local pollinators. All materials provided.',
    price: 75.00,
    type: 'event',
    category: 'Workshops & Classes',
    image: 'https://images.pexels.com/photos/796607/pexels-photo-796607.jpeg',
    seller: { id: 8, name: 'Kootenay Bee Collective', image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg' },
    datePosted: '2025-04-20',
    status: 'published',
    featured: true
  },
  {
    id: 5,
    title: 'Organic Sourdough Bread - Weekly Subscription',
    description: 'Freshly baked organic sourdough bread, delivered weekly to your door (Nelson area only). Various loaf types available.',
    price: 12.00, // Price per loaf, subscription model implied
    type: 'product',
    category: 'Food & Beverage',
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
    seller: { id: 9, name: 'The Kootenay Loaf', image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' },
    datePosted: '2025-03-30',
    status: 'published',
    featured: false
  },
  {
    id: 6,
    title: 'Graphic Design Services for Startups',
    description: 'Branding, logo design, and marketing materials for new businesses. Affordable packages available.',
    type: 'service',
    category: 'Design & Creative',
    image: 'https://images.pexels.com/photos/326502/pexels-photo-326502.jpeg',
    seller: { id: 10, name: 'Kootenay Creative Co.', image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' },
    datePosted: '2025-05-22',
    status: 'published',
    featured: true
  },
  {
    id: 7,
    title: 'Used Office Desk - Excellent Condition',
    description: 'Large L-shaped office desk with drawers. Minor wear and tear, perfect for a home office setup. Must pick up.',
    price: 150.00,
    type: 'equipment',
    category: 'Furniture',
    image: 'https://images.pexels.com/photos/1170979/pexels-photo-1170979.jpeg',
    seller: { id: 11, name: 'Sarah B.', image: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg' },
    datePosted: '2025-05-20',
    status: 'published',
    featured: false
  },
  {
    id: 8,
    title: 'Tickets: Kootenay Craft Beer Festival (2)',
    description: 'Two tickets to the annual Kootenay Craft Beer Festival. Saturday pass. Unable to attend.',
    price: 90.00,
    type: 'event',
    category: 'Tickets & Events',
    image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    seller: { id: 12, name: 'Mike R.', image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
    datePosted: '2025-05-19',
    status: 'published',
    featured: false
  },
  {
    id: 9,
    title: 'Locally Roasted Coffee Beans - Dark Roast (1lb)',
    description: 'Artisan dark roast coffee beans, roasted weekly in Nelson. Whole beans or ground to order.',
    price: 22.00,
    type: 'product',
    category: 'Food & Beverage',
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    seller: { id: 13, name: 'Nelson Bean Co.', image: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg' },
    datePosted: '2025-05-15',
    status: 'published',
    featured: true
  },
  {
    id: 10,
    title: 'Online Yoga Classes - Drop-in or Monthly Pass',
    description: 'Live-streamed yoga classes for all levels. Vinyasa, Hatha, and Restorative styles. Experienced instructor.',
    type: 'service',
    category: 'Health & Wellness',
    image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg',
    seller: { id: 14, name: 'ZenFlow Yoga', image: 'https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg' },
    datePosted: '2025-05-12',
    status: 'published',
    featured: false
  },
  {
    id: 11,
    title: 'Professional Photography Drone - DJI Mavic 3',
    description: 'Lightly used DJI Mavic 3 drone with Fly More Combo. Excellent for aerial photography and videography. Original packaging included.',
    price: 2200.00,
    type: 'equipment',
    category: 'Electronics',
    image: 'https://images.pexels.com/photos/7249183/pexels-photo-7249183.jpeg',
    seller: { id: 15, name: 'AerialVisions Kootenay', image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg' },
    datePosted: '2025-05-08',
    status: 'published',
    featured: true
  },
  {
    id: 12,
    title: 'Guided Fly Fishing Trip - Kootenay River',
    description: 'Full-day guided fly fishing trip on the Kootenay River. All gear provided. Experienced local guide. Catch and release.',
    price: 450.00,
    type: 'event',
    category: 'Experiences & Tours',
    image: 'https://images.pexels.com/photos/951318/pexels-photo-951318.jpeg',
    seller: { id: 16, name: 'Kootenay Anglers', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
    datePosted: '2025-05-01',
    status: 'published',
    featured: false
  },
  {
    id: 13,
    title: 'Hand-knitted Wool Sweaters',
    description: 'Cozy and warm hand-knitted wool sweaters. Various sizes and colors available. Made with locally sourced wool.',
    price: 120.00,
    type: 'product',
    category: 'Apparel & Accessories',
    image: 'https://images.pexels.com/photos/7109019/pexels-photo-7109019.jpeg',
    seller: { id: 17, name: 'Kootenay Knitters', image: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg' },
    datePosted: '2025-04-25',
    status: 'published',
    featured: true
  },
  {
    id: 14,
    title: 'Social Media Marketing Consultation',
    description: 'One-hour consultation to review your social media strategy and provide actionable recommendations for growth and engagement.',
    type: 'service',
    category: 'Marketing & Advertising',
    image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg',
    seller: { id: 18, name: 'Boost Social Kootenays', image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg' },
    datePosted: '2025-04-18',
    status: 'published',
    featured: false
  },
  {
    id: 15,
    title: 'Vintage Record Player & Vinyl Collection',
    description: 'Working vintage record player (Audio-Technica AT-LP60) and a collection of 50 classic rock and jazz LPs. Great starter set.',
    price: 275.00,
    type: 'equipment',
    category: 'Electronics',
    image: 'https://images.pexels.com/photos/374678/pexels-photo-374678.jpeg',
    seller: { id: 19, name: 'Retro Grooves Nelson', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg' },
    datePosted: '2025-04-10',
    status: 'published',
    featured: true
  }
];
export const opportunities: Opportunity[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer (React)',
    company: {
      id: 1,
      name: 'Innovatech Solutions',
      logo: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg'
    },
    location: 'Nelson, BC',
    type: 'full-time',
    description: 'Join our dynamic team to build next-generation web applications using React, TypeScript, and modern frontend technologies. Lead complex projects and mentor junior developers.',
    postedDate: '2025-05-20',
    url: '#',
    status: 'published',
    featured: true,
    skillsRequired: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'GraphQL'],
    experienceLevel: 'Senior',
    salaryRange: '$90,000 - $120,000',
    remoteStatus: 'Hybrid'
  },
  {
    id: 2,
    title: 'Marketing Coordinator',
    company: {
      id: 2,
      name: 'Kootenay Connect',
      logo: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg'
    },
    location: 'Remote (BC Preferred)',
    type: 'part-time',
    description: 'Support our marketing initiatives, manage social media channels, create engaging content, and assist with campaign execution. Excellent communication skills required.',
    postedDate: '2025-05-18',
    url: '#',
    status: 'published',
    featured: false,
    skillsRequired: ['Social Media Marketing', 'Content Creation', 'SEO Basics', 'Mailchimp'],
    experienceLevel: 'Entry',
    remoteStatus: 'Remote'
  },
  {
    id: 3,
    title: 'Full Stack Developer (Node.js/Vue.js)',
    company: {
      id: 3,
      name: 'Mountain Digital',
      logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
    },
    location: 'Rossland, BC',
    type: 'full-time',
    description: 'Develop and maintain web applications using Node.js for the backend and Vue.js for the frontend. Experience with databases and cloud platforms is a plus.',
    postedDate: '2025-05-15',
    url: '#',
    status: 'published',
    featured: true,
    skillsRequired: ['Node.js', 'Vue.js', 'MongoDB', 'AWS', 'REST APIs'],
    experienceLevel: 'Mid',
    salaryRange: '$75,000 - $95,000',
    remoteStatus: 'On-site'
  },
  {
    id: 4,
    title: 'UX/UI Designer Internship',
    company: {
      id: 4,
      name: 'Selkirk Software',
      logo: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg'
    },
    location: 'Nelson, BC',
    type: 'internship',
    description: 'Gain hands-on experience in UX/UI design. Work on real projects, create wireframes, mockups, and prototypes. Portfolio required.',
    postedDate: '2025-05-22',
    url: '#',
    status: 'published',
    featured: false,
    skillsRequired: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    experienceLevel: 'Entry',
    remoteStatus: 'Hybrid'
  },
  {
    id: 5,
    title: 'Community Manager',
    company: {
      id: 5,
      name: 'Nelson Tech Hub',
      logo: 'https://images.pexels.com/photos/5439473/pexels-photo-5439473.jpeg'
    },
    location: 'Nelson, BC',
    type: 'contract',
    description: 'Build and engage our tech community. Organize events, manage online forums, and foster a collaborative environment for tech enthusiasts and professionals in Nelson.',
    postedDate: '2025-05-10',
    url: '#',
    status: 'published',
    featured: true,
    skillsRequired: ['Community Management', 'Event Planning', 'Communication', 'Social Media'],
    experienceLevel: 'Mid',
    remoteStatus: 'On-site'
  },
  {
    id: 6,
    title: 'Backend Developer (Python/Django)',
    company: {
      id: 1,
      name: 'Innovatech Solutions',
      logo: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg'
    },
    location: 'Remote',
    type: 'full-time',
    description: 'Design, develop, and maintain robust backend systems using Python and Django. Work with APIs, databases, and ensure scalability and performance.',
    postedDate: '2025-05-05',
    url: '#',
    status: 'published',
    featured: false,
    skillsRequired: ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Docker'],
    experienceLevel: 'Mid',
    salaryRange: '$80,000 - $110,000',
    remoteStatus: 'Remote'
  },
  {
    id: 7,
    title: 'Technical Writer (Software Documentation)',
    company: {
      id: 4,
      name: 'Selkirk Software',
      logo: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg'
    },
    location: 'Nelson, BC',
    type: 'contract',
    description: 'Create clear, concise, and comprehensive technical documentation for our software products. Target audience includes developers and end-users.',
    postedDate: '2025-04-28',
    url: '#',
    status: 'published',
    featured: false,
    skillsRequired: ['Technical Writing', 'Software Documentation', 'API Documentation', 'Markdown'],
    experienceLevel: 'Mid',
    remoteStatus: 'Hybrid'
  },
  {
    id: 8,
    title: 'DevOps Engineer',
    company: {
      id: 3,
      name: 'Mountain Digital',
      logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
    },
    location: 'Rossland, BC',
    type: 'full-time',
    description: 'Manage and improve our CI/CD pipelines, cloud infrastructure (AWS), and deployment processes. Focus on automation, reliability, and security.',
    postedDate: '2025-04-25',
    url: '#',
    status: 'published',
    featured: true,
    skillsRequired: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
    experienceLevel: 'Senior',
    salaryRange: '$100,000 - $130,000',
    remoteStatus: 'On-site'
  },
  {
    id: 9,
    title: 'Junior Graphic Designer',
    company: {
      id: 2,
      name: 'Kootenay Connect',
      logo: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg'
    },
    location: 'Nelson, BC',
    type: 'part-time',
    description: 'Assist the design team with creating visual assets for web, print, and social media. A keen eye for detail and creativity is essential.',
    postedDate: '2025-05-19',
    url: '#',
    status: 'published',
    featured: false,
    skillsRequired: ['Adobe Creative Suite', 'Graphic Design', 'Typography', 'Illustration Basics'],
    experienceLevel: 'Entry',
    remoteStatus: 'Hybrid'
  },
  {
    id: 10,
    title: 'Data Analyst',
    company: {
      id: 1,
      name: 'Innovatech Solutions',
      logo: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg'
    },
    location: 'Remote',
    type: 'full-time',
    description: 'Analyze complex datasets to provide actionable insights. Develop dashboards, reports, and support data-driven decision-making across the company.',
    postedDate: '2025-05-01',
    url: '#',
    status: 'published',
    featured: false,
    skillsRequired: ['SQL', 'Python (Pandas, NumPy)', 'Tableau', 'Data Visualization', 'Statistics'],
    experienceLevel: 'Mid',
    salaryRange: '$70,000 - $90,000',
    remoteStatus: 'Remote'
  },
  {
    id: 11,
    title: 'Volunteer Web Developer for Non-Profit',
    company: {
      id: 5,
      name: 'Nelson Tech Hub',
      logo: 'https://images.pexels.com/photos/5439473/pexels-photo-5439473.jpeg'
    },
    location: 'Remote / Nelson, BC',
    type: 'volunteer',
    description: 'Help a local non-profit organization improve their web presence. Flexible hours. Opportunity to contribute to a meaningful cause.',
    postedDate: '2025-04-15',
    url: '#',
    status: 'published',
    featured: true,
    skillsRequired: ['HTML', 'CSS', 'JavaScript', 'WordPress (Optional)'],
    experienceLevel: 'Entry',
    remoteStatus: 'Hybrid'
  },
  {
    id: 12,
    title: 'Lead Mobile Developer (React Native)',
    company: {
      id: 4,
      name: 'Selkirk Software',
      logo: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg'
    },
    location: 'Nelson, BC',
    type: 'full-time',
    description: 'Lead the development of our flagship mobile application using React Native. Architect solutions, guide the mobile team, and ensure high-quality delivery.',
    postedDate: '2025-05-12',
    url: '#',
    status: 'published',
    featured: true,
    skillsRequired: ['React Native', 'iOS Development', 'Android Development', 'Mobile Architecture', 'TypeScript'],
    experienceLevel: 'Lead',
    salaryRange: '$110,000 - $140,000',
    remoteStatus: 'Hybrid'
  }
];

// Combine original members with additional members
const allMembers = [...members, ...additionalMembers];

// Export all mock data
export const mockData = {
  members: allMembers,
  companies,
  groups,
  events,
  newsArticles,
  resources,
  marketplaceItems,
  opportunities
};

export default mockData;
