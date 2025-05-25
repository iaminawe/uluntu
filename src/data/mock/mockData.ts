// Status type for all entities
import type { EntityStatus as AppEntityStatus } from '../../types';

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
  status: AppEntityStatus;
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
  status: AppEntityStatus;
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
  id: string; // Changed from number
  name: string;
  description: string;
  long_description: string | null; // Changed from longDescription, added null
  hero_image: string; // Changed from heroImage
  cover_image: string | null; // Changed from coverImage, added null
  visibility: string; // Changed from 'open' | 'closed' | 'secret'
  member_count: number | null; // Changed from memberCount, added null
  status: string; // Changed from EntityStatus
  featured: boolean | null; // Added null
  created_at: string | null; // Added

  // Fields to retain as per user request (pending Supabase schema update discussion)
  eventCount?: number;
  resourceCount?: number;
  postCount?: number;
  lastActive: string;
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
  address: string | null;
  created_at: string | null;
  current_attendees: number | null;
  date: string;
  description: string;
  end_date: string | null;
  featured: boolean | null;
  group_id: string | null;
  id: string; // Changed from number
  image: string;
  latitude: number | null;
  location: string;
  longitude: number | null;
  max_attendees: number | null;
  organizer_id: string; // Added, from organizer.id
  status: string; // Changed from EntityStatus
  title: string;
  type: string; // Changed from specific literals
  url: string | null;
  // Removed: organizer object, attendees, sessions (sessions are likely related data)
}

// News types
export interface NewsArticle {
  id: string; // Changed
  title: string;
  slug: string; // Added
  excerpt: string;
  content: string;
  publishedAt: string;
  image?: string;
  author: {
    id: string; // Changed
    name: string;
    image: string;
  };
  tags?: string[];
  status: AppEntityStatus;
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
  status: AppEntityStatus;
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
  status: AppEntityStatus;
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
  status: AppEntityStatus;
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
      status: 'approved',
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
      status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    id: "1",
    name: 'Kootenay Coders Collective',
    description: 'A group for developers of all skill levels in the Kootenays. Share projects, ask questions, and collaborate.',
    long_description: 'The Kootenay Coders Collective is dedicated to fostering a vibrant and supportive community for software developers, programmers, and tech enthusiasts across the Kootenay region. Whether you\'re a seasoned professional, a student just starting out, or someone curious about coding, you\'re welcome here. We host regular meetups (both online and in-person when possible), workshops, and collaborative coding sessions. Our goal is to learn from each other, build cool things, and help grow the local tech ecosystem.',
    hero_image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
    cover_image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
    visibility: 'open',
    member_count: 125,
    eventCount: 2,
    resourceCount: 10,
    postCount: 30,
    lastActive: '2025-05-20',
    status: 'approved',
    featured: true,
    created_at: '2023-01-01T00:00:00.000Z',
    members: sampleGroupMembers,
    events: [
      {
        id: 1, // Assuming GroupEvent ID remains number for now, or needs separate refactoring
        title: 'Kootenay Tech Conference 2025',
        date: '2025-09-15',
        description: 'Join us for the annual Kootenay Tech Conference, featuring talks, workshops, and networking opportunities with tech leaders and innovators from across the region and beyond. Explore the latest trends in software development, AI, cybersecurity, and digital marketing.',
        image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg'
      },
      {
        id: 5, // Assuming GroupEvent ID remains number
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
    id: "2",
    name: 'Nelson Digital Nomads',
    description: 'Connect with fellow remote workers and digital nomads in the Nelson area. Share tips, co-work, and explore.',
    long_description: 'Are you working remotely in or around Nelson, BC? The Nelson Digital Nomads group is your hub for connecting with like-minded individuals. We organize casual co-working sessions, social events, and outdoor adventures. Share your favorite coffee shops with good Wi-Fi, discuss the challenges and rewards of remote work, and build your local network. Whether you\'re new to town or a long-time resident embracing the remote lifestyle, join us!',
    hero_image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
    cover_image: 'https://images.pexels.com/photos/374710/pexels-photo-374710.jpeg',
    visibility: 'open',
    member_count: 78,
    eventCount: 1,
    resourceCount: 3,
    postCount: 15,
    lastActive: '2025-05-22',
    status: 'approved',
    featured: false,
    created_at: '2023-01-01T00:00:00.000Z',
    members: [sampleGroupMembers[1]],
    events: [
      {
        id: 2, // Assuming GroupEvent ID remains number
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
    id: "3",
    name: 'Kootenay AI Innovators (Secret)',
    description: 'A private group for professionals and researchers working on AI/ML projects in the region.',
    long_description: 'This is a closed, invite-only group for individuals actively involved in Artificial Intelligence and Machine Learning research, development, or application within the Kootenay tech community. The purpose is to facilitate high-level discussions, share breakthroughs, and explore collaborative opportunities in a confidential setting. Membership is curated to ensure a focused and productive environment.',
    hero_image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    cover_image: null, // Added as it's in the interface
    visibility: 'secret',
    member_count: 23,
    // eventCount, resourceCount, postCount are optional and not present here
    lastActive: '2025-05-18',
    status: 'approved',
    featured: false,
    created_at: '2023-01-01T00:00:00.000Z',
    members: [], 
    events: [],
    resources: [],
    posts: []
  },
  {
    id: "4",
    name: 'Kootenay Hikers & Adventurers',
    description: 'For all who love to explore the Kootenay mountains and trails. Share trail conditions, photos, and plan group hikes.',
    long_description: 'From casual strolls to challenging peaks, the Kootenay Hikers & Adventurers group is for everyone who enjoys the great outdoors. We encourage sharing of trail information, safety tips, and beautiful photography. Join us for regular group hikes and backpacking trips. All skill levels welcome.',
    hero_image: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg',
    cover_image: 'https://images.pexels.com/photos/772803/pexels-photo-772803.jpeg',
    visibility: 'open',
    member_count: 215,
    eventCount: 1,
    resourceCount: 8,
    postCount: 55,
    lastActive: '2025-05-23',
    status: 'approved',
    featured: true,
    created_at: '2023-01-01T00:00:00.000Z',
    members: [sampleGroupMembers[0], sampleGroupMembers[1]],
    events: [
      {
        id: 7, // Assuming GroupEvent ID remains number
        title: 'Rossland Mountain Film Festival',
        date: '2025-11-14',
        description: 'A celebration of mountain culture, adventure sports, and environmental filmmaking. Featuring local and international films, guest speakers, and workshops.',
        image: 'https://images.pexels.com/photos/269839/pexels-photo-269839.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: "5",
    name: 'West Kootenay Arts Council',
    description: 'Supporting and promoting artists and arts initiatives throughout the West Kootenays.',
    long_description: 'The West Kootenay Arts Council is a non-profit organization dedicated to fostering a vibrant arts community. We provide resources for artists, organize exhibitions, workshops, and advocate for arts funding. Connect with fellow artists, discover local talent, and get involved in creative projects.',
    hero_image: 'https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg',
    cover_image: 'https://images.pexels.com/photos/19680/pexels-photo.jpg',
    visibility: 'open',
    member_count: 95,
    eventCount: 1,
    // resourceCount, postCount are optional
    lastActive: '2025-05-21',
    status: 'approved',
    featured: false,
    created_at: '2023-01-01T00:00:00.000Z',
    members: [sampleGroupMembers[0]],
    events: [
      {
        id: 4, // Assuming GroupEvent ID remains number
        title: 'Kaslo Jazz Etc. Festival 2025',
        date: '2025-08-02',
        description: 'Experience world-class jazz, blues, and world music on a floating stage in the beautiful setting of Kaslo Bay. A unique and unforgettable festival.',
        image: 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: "6",
    name: 'Kootenay Lake Sailing Club (Closed)',
    description: 'A closed group for members of the Kootenay Lake Sailing Club. Discuss races, boat maintenance, and social events.',
    long_description: 'This group is exclusively for registered members of the Kootenay Lake Sailing Club. Share your sailing adventures, get advice on boat repairs, organize crewing opportunities, and stay updated on club news and regattas.',
    hero_image: 'https://images.pexels.com/photos/912422/pexels-photo-912422.jpeg',
    cover_image: null, // Added as it's in the interface
    visibility: 'closed',
    member_count: 62,
    // eventCount, resourceCount, postCount are optional
    lastActive: '2025-05-19',
    status: 'approved',
    featured: false,
    created_at: '2023-01-01T00:00:00.000Z',
    members: [],
    events: [], resources: [], posts: []
  },
  {
    id: "7",
    name: 'Slocan Valley Growers Market',
    description: 'Connecting local farmers, artisans, and consumers in the Slocan Valley. Find fresh produce, handmade goods, and support local.',
    long_description: 'The Slocan Valley Growers Market group is your online portal to the best of local agriculture and crafts. Farmers can post their available produce, artisans can showcase their creations, and consumers can find out what\'s fresh and in season. Let\'s build a stronger local food system together!',
    hero_image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg',
    cover_image: null, // Added as it's in the interface
    visibility: 'open',
    member_count: 150,
    eventCount: 1,
    // resourceCount, postCount are optional
    lastActive: '2025-05-22',
    status: 'approved',
    featured: true,
    created_at: '2023-01-01T00:00:00.000Z',
    members: [sampleGroupMembers[1]],
    events: [
      {
        id: 2, // Assuming GroupEvent ID remains number
        title: 'Nelson Farmers Market - Summer Season Opening',
        date: '2025-06-01',
        description: 'Celebrate the start of the summer market season! Fresh local produce, artisan crafts, live music, and food trucks. A great day out for the whole family.',
        image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg'
      }
    ], resources: [], posts: []
  },
  {
    id: "8",
    name: 'Kootenay Game Developers Meetup',
    description: 'A community for indie game developers, designers, and artists in the Kootenays. Share projects, get feedback, and collaborate.',
    long_description: 'Whether you\'re a hobbyist or a professional, the Kootenay Game Developers Meetup is the place to connect with others passionate about game creation. We host show-and-tell sessions, game jams, and discussions on tools and techniques. All platforms and genres welcome.',
    hero_image: 'https://images.pexels.com/photos/7238759/pexels-photo-7238759.jpeg',
    cover_image: null,
    created_at: '2023-01-01T00:00:00.000Z',
    visibility: 'open',
    member_count: 45,
    eventCount: 1,
    lastActive: '2025-05-17',
    status: 'approved',
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
    id: "9",
    name: 'Boundary Country History Buffs (Secret)',
    description: 'A private research group for local historians and genealogists focusing on the Boundary region.',
    long_description: 'This secret group is for dedicated researchers exploring the rich history of the Boundary Country. Share findings, discuss historical records, and collaborate on projects related to local families, industries, and events. Membership by referral.',
    hero_image: 'https://images.pexels.com/photos/769155/pexels-photo-769155.jpeg',
    cover_image: null,
    created_at: '2023-01-01T00:00:00.000Z',
    visibility: 'secret',
    member_count: 18,
    lastActive: '2025-05-15',
    status: 'approved',
    featured: false,
    members: [],
    events: [], resources: [], posts: []
  },
  {
    id: "10",
    name: 'East Kootenay Climbers Coalition',
    description: 'Advocacy, access, and community for rock climbers in the East Kootenays.',
    long_description: 'The EKCC works to preserve climbing access, promote safety and stewardship, and build a strong climbing community in the East Kootenays. Join us for crag cleanups, route development discussions, and social events.',
    hero_image: 'https://images.pexels.com/photos/1261731/pexels-photo-1261731.jpeg',
    cover_image: null,
    created_at: '2023-01-01T00:00:00.000Z',
    visibility: 'open',
    member_count: 110,
    eventCount: 1,
    lastActive: '2025-05-20',
    status: 'approved',
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
    id: "11",
    name: 'Nelson Book Club',
    description: 'A friendly group for book lovers in Nelson. We meet monthly to discuss a chosen book.',
    long_description: 'Join the Nelson Book Club for lively discussions about a wide range of genres. We vote on a book each month and meet in a relaxed setting to share our thoughts. New members are always welcome!',
    hero_image: 'https://images.pexels.com/photos/34075/pexels-photo.jpg',
    cover_image: null,
    created_at: '2023-01-01T00:00:00.000Z',
    visibility: 'open',
    member_count: 55,
    eventCount: 1,
    lastActive: '2025-05-10',
    status: 'approved',
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
    id: "12",
    name: 'Kootenay Permaculture Guild',
    description: 'Sharing knowledge and resources for sustainable living and permaculture design in the Kootenays.',
    long_description: 'The Kootenay Permaculture Guild connects individuals interested in ecological design, regenerative agriculture, and sustainable living. We organize workshops, site visits, and seed exchanges. Learn how to apply permaculture principles to your home, garden, or community.',
    hero_image: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg',
    cover_image: null,
    created_at: '2023-01-01T00:00:00.000Z',
    visibility: 'open',
    member_count: 88,
    eventCount: 1,
    lastActive: '2025-05-18',
    status: 'approved',
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
    id: "13",
    name: 'Arrow Lakes Photography Club (Closed)',
    description: 'A closed group for photography enthusiasts in the Arrow Lakes region to share work and techniques.',
    long_description: 'This group is for photographers of all levels in the Arrow Lakes area. Share your latest shots, discuss gear and techniques, critique work constructively, and plan photo outings. Membership is for local residents.',
    hero_image: 'https://images.pexels.com/photos/368893/pexels-photo-368893.jpeg',
    cover_image: null,
    created_at: '2023-01-01T00:00:00.000Z',
    visibility: 'closed',
    member_count: 35,
    lastActive: '2025-05-16',
    status: 'approved',
    featured: false,
    members: [sampleGroupMembers[0], sampleGroupMembers[1]],
    events: [], resources: [], posts: []
  }
];

export const events: Event[] = [
  // NOTE: Mock data updated to align with new Event interface
  // Existing fields adjusted, new fields added with placeholder/null values.
  {
    id: "1",
    title: 'Kootenay Tech Conference 2025',
    date: '2025-09-15',
    end_date: '2025-09-17',
    location: 'Nelson Innovation Centre, Nelson, BC',
    description: 'Join us for the annual Kootenay Tech Conference, featuring talks, workshops, and networking opportunities with tech leaders and innovators from across the region and beyond. Explore the latest trends in software development, AI, cybersecurity, and digital marketing.',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
    organizer_id: "1",
    type: 'hybrid',
    url: 'https://kootenaytechconf.example.com',
    status: 'approved',
    featured: true,
    address: 'Nelson Innovation Centre, Nelson, BC',
    created_at: '2025-01-01T00:00:00.000Z',
    current_attendees: 250,
    group_id: null,
    latitude: 49.4944,
    longitude: -117.2929,
    max_attendees: 500
  },
  {
    id: "2",
    title: 'Nelson Farmers Market - Summer Season Opening',
    date: '2025-06-01',
    end_date: null,
    location: 'Cottonwood Falls Park, Nelson, BC',
    description: 'Celebrate the start of the summer market season! Fresh local produce, artisan crafts, live music, and food trucks. A great day out for the whole family.',
    image: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg',
    organizer_id: "2",
    type: 'in-person',
    url: null,
    status: 'approved',
    featured: true,
    address: 'Cottonwood Falls Park, Nelson, BC',
    created_at: '2025-01-02T00:00:00.000Z',
    current_attendees: 500,
    group_id: null,
    latitude: 49.4922,
    longitude: -117.2875,
    max_attendees: 1000
  },
  {
    id: "3",
    title: 'Online Workshop: Introduction to Cybersecurity for Small Businesses',
    date: '2025-07-10',
    end_date: null,
    location: 'Online via Zoom',
    description: 'Learn the fundamentals of cybersecurity to protect your small business from common online threats. Topics include password management, phishing awareness, data backup, and secure network practices.',
    image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg',
    organizer_id: "3",
    type: 'online',
    url: 'https://securetechkootenays.example.com/workshop',
    status: 'approved',
    featured: false,
    address: null,
    created_at: '2025-01-03T00:00:00.000Z',
    current_attendees: 75,
    group_id: null,
    latitude: null,
    longitude: null,
    max_attendees: 150
  },
  {
    id: "4",
    title: 'Kaslo Jazz Etc. Festival 2025',
    date: '2025-08-02',
    end_date: '2025-08-04',
    location: 'Kaslo Bay Park, Kaslo, BC',
    description: 'Experience world-class jazz, blues, and world music on a floating stage in the beautiful setting of Kaslo Bay. A unique and unforgettable festival.',
    image: 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg',
    organizer_id: "4",
    type: 'in-person',
    url: 'https://kaslojazzfest.com',
    status: 'approved',
    featured: true,
    address: 'Kaslo Bay Park, Kaslo, BC',
    created_at: '2025-01-04T00:00:00.000Z',
    current_attendees: 3000,
    group_id: null,
    latitude: 49.9085,
    longitude: -116.9007,
    max_attendees: 6000
  },
  {
    id: "5",
    title: 'Community Coding Night - Open Source Contributions',
    date: '2025-06-20',
    end_date: null,
    location: 'Nelson Innovation Centre, Nelson, BC',
    description: 'Join fellow developers for an evening of contributing to open source projects. All skill levels welcome. Bring your laptop and ideas!',
    image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
    organizer_id: "1",
    type: 'in-person',
    url: null,
    status: 'approved',
    featured: false,
    address: 'Nelson Innovation Centre, Nelson, BC',
    created_at: '2025-01-05T00:00:00.000Z',
    current_attendees: 30,
    group_id: null,
    latitude: 49.4944,
    longitude: -117.2929,
    max_attendees: 60
  },
  {
    id: "6",
    title: 'Digital Marketing Trends for 2026 - Webinar',
    date: '2025-11-05',
    end_date: null,
    location: 'Online',
    description: 'Stay ahead of the curve with this insightful webinar on upcoming digital marketing trends. Learn about new strategies in SEO, content marketing, social media, and AI-driven advertising.',
    image: 'https://images.pexels.com/photos/6476254/pexels-photo-6476254.jpeg',
    organizer_id: "5",
    type: 'online',
    url: 'https://marketingmasters.example.com/webinar/trends2026',
    status: 'approved',
    featured: true,
    address: null,
    created_at: '2025-01-06T00:00:00.000Z',
    current_attendees: 150,
    group_id: null,
    latitude: null,
    longitude: null,
    max_attendees: 300
  },
  {
    id: "7",
    title: 'Rossland Mountain Film Festival',
    date: '2025-11-14',
    end_date: '2025-11-16',
    location: 'Miners Hall, Rossland, BC',
    description: 'A celebration of mountain culture, adventure sports, and environmental filmmaking. Featuring local and international films, guest speakers, and workshops.',
    image: 'https://images.pexels.com/photos/269839/pexels-photo-269839.jpeg',
    organizer_id: "6",
    type: 'in-person',
    url: 'https://rosslandfilmfest.example.com',
    status: 'approved',
    featured: false,
    address: 'Miners Hall, Rossland, BC',
    created_at: '2025-01-07T00:00:00.000Z',
    current_attendees: 400,
    group_id: null,
    latitude: 49.0773,
    longitude: -117.8029,
    max_attendees: 800
  },
  {
    id: "8",
    title: 'Past Event: Kootenay Virtual Reality Showcase 2024',
    date: '2024-10-20T09:00:00.000Z',
    end_date: '2024-10-21T17:00:00.000Z',
    location: 'Online & Nelson Innovation Centre',
    description: 'An exploration of VR/AR technologies and their applications in various industries. Featured demos from local developers and panel discussions with experts.',
    image: 'https://images.pexels.com/photos/7238759/pexels-photo-7238759.jpeg',
    organizer_id: "1",
    type: 'hybrid',
    url: 'https://kootenayvr2024.example.com',
    status: 'rejected',
    featured: false,
    address: '601 Front St, Nelson, BC',
    created_at: '2024-01-15T00:00:00.000Z',
    current_attendees: 120,
    group_id: null,
    latitude: 49.4944,
    longitude: -117.2929,
    max_attendees: 200
  },
  {
    id: "9",
    title: 'Past Workshop: Advanced Git & GitHub for Teams 2024',
    date: '2024-11-15T14:00:00.000Z',
    end_date: null,
    location: 'Online',
    description: 'Deep dive into advanced Git techniques, branching strategies, and collaborative workflows using GitHub for development teams.',
    image: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg',
    organizer_id: "1",
    type: 'online',
    url: 'https://kootenaycoders.example.com/git-advanced-2024',
    status: 'rejected',
    featured: false,
    address: null,
    created_at: '2024-02-10T00:00:00.000Z',
    current_attendees: 45,
    group_id: null,
    latitude: null,
    longitude: null,
    max_attendees: 100
  },
  {
    id: "10",
    title: 'Past Conference: Kootenay Agri-Tech Forum 2024',
    date: '2024-09-05T09:00:00.000Z',
    end_date: '2024-09-06T17:00:00.000Z',
    location: 'Creston Community Complex, Creston, BC',
    description: 'Exploring innovations in agricultural technology, sustainable farming practices, and food security in the Kootenay region.',
    image: 'https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg',
    organizer_id: "7",
    type: 'in-person',
    url: null,
    status: 'rejected',
    featured: true,
    address: 'Creston Community Complex, Creston, BC',
    created_at: '2024-03-10T00:00:00.000Z',
    current_attendees: 180,
    group_id: null,
    latitude: 49.0973,
    longitude: -116.5139,
    max_attendees: 300
  },
  {
    id: "11",
    title: 'Past Webinar: SEO Strategies for Local Businesses 2024',
    date: '2024-07-22T14:00:00.000Z',
    end_date: null,
    location: 'Online',
    description: 'Effective SEO tactics to help Kootenay-based small businesses improve their online visibility and attract local customers.',
    image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
    organizer_id: "5",
    type: 'online',
    url: 'https://marketingmasters.example.com/webinar/seo-local-2024',
    status: 'rejected',
    featured: false,
    address: null,
    created_at: '2024-04-10T00:00:00.000Z',
    current_attendees: 90,
    group_id: null,
    latitude: null,
    longitude: null,
    max_attendees: 200
  },
  {
    id: "12",
    title: 'Past Event: Nelson Mural Festival 2024 - Closing Celebration',
    date: '2024-08-18T09:00:00.000Z',
    end_date: '2024-08-18T17:00:00.000Z',
    location: 'Hall Street Plaza, Nelson, BC',
    description: 'The grand finale of the annual Nelson Mural Festival, celebrating public art with live music, artist talks, and community engagement.',
    image: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg',
    organizer_id: "6",
    type: 'in-person',
    url: null,
    status: 'rejected',
    featured: true,
    address: 'Hall Street Plaza, Nelson, BC',
    created_at: '2024-05-10T00:00:00.000Z',
    current_attendees: 600,
    group_id: null,
    latitude: 49.4944,
    longitude: -117.2929,
    max_attendees: 1000
  },
  {
    id: "13",
    title: 'Past Workshop: Intro to 3D Printing & Design 2024',
    date: '2024-06-10T13:00:00.000Z',
    end_date: '2024-06-10T15:00:00.000Z',
    location: 'Selkirk College, Nelson Campus',
    description: 'A hands-on introduction to the basics of 3D printing, including CAD design fundamentals and operating a 3D printer.',
    image: 'https://images.pexels.com/photos/4099125/pexels-photo-4099125.jpeg',
    organizer_id: "1",
    type: 'in-person',
    url: null,
    status: 'rejected',
    featured: false,
    address: 'Selkirk College, Nelson Campus',
    created_at: '2024-03-10T00:00:00.000Z',
    current_attendees: 25,
    group_id: null,
    latitude: 49.4944,
    longitude: -117.2929,
    max_attendees: 50
  }
];

export const sampleMarketplaceItems: MarketplaceItem[] = [
  {
    id: 14,
    title: 'Social Media Marketing Consultation',
    description: 'One-hour consultation to review your social media strategy and provide actionable recommendations for growth and engagement.',
    type: 'service',
    category: 'Marketing & Advertising',
    image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg',
    seller: { id: 18, name: 'Boost Social Kootenays', image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg' },
    datePosted: '2025-04-18',
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
    featured: true,
    skillsRequired: ['React Native', 'iOS Development', 'Android Development', 'Mobile Architecture', 'TypeScript'],
    experienceLevel: 'Lead',
    salaryRange: '$110,000 - $140,000',
    remoteStatus: 'Hybrid'
  }
];

export const sampleNewsArticles: NewsArticle[] = [];
export const sampleResources: Resource[] = [];

// Combine original members with additional members
const allMembers = [...members, ...additionalMembers];

// Export all mock data
export const mockData = {
  members: allMembers,
  companies,
  groups,
  events,
  newsArticles: sampleNewsArticles,
  resources: sampleResources,
  marketplaceItems: sampleMarketplaceItems,
  opportunities
};

export default mockData;
