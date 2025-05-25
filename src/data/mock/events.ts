import { BaseEntity } from './types';

// Event session resource interface
export interface EventSessionResource {
  id: number;
  title: string;
  url: string;
  type: 'slides' | 'document' | 'code' | 'website' | 'other';
}

// Event session interface
export interface EventSession {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  presenters: EventPresenter[];
  videoUrl?: string;
  resources?: EventSessionResource[];
}

// Event presenter interface
export interface EventPresenter {
  id: number;
  name: string;
  image: string;
  bio?: string;
  title?: string;
  company?: string;
  website?: string;
}

// Event interface
export interface Event extends BaseEntity {
  address: string | null;
  date: string;
  description: string;
  end_date: string | null;
  group_id: string | null;
  image: string;
  latitude: number | null;
  location: string;
  longitude: number | null;
  max_attendees: number | null;
  current_attendees: number | null;
  organizer_id: string;
  title: string;
  type: string;
  url: string | null;
  sessions?: EventSession[];
}

// Events data
export const events: Event[] = [
  {
    id: '1',
    title: 'Kootenay Tech Conference 2025',
    date: '2025-06-15',
    end_date: '2025-06-17',
    description: 'The annual Kootenay Tech Conference brings together tech professionals, entrepreneurs, and enthusiasts from across the region to share knowledge, network, and explore the latest trends in technology.',
    location: 'Nelson Innovation Centre',
    address: '450 Ward Street, Nelson, BC',
    latitude: 49.4928,
    longitude: -117.2948,
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    type: 'conference',
    url: 'https://kootenaytech.example.com',
    max_attendees: 200,
    current_attendees: 145,
    organizer_id: '1',
    group_id: '1',
    status: 'published',
    featured: true,
    created_at: '2025-01-15',
    sessions: [
      {
        id: 1,
        title: 'Opening Keynote: The Future of Tech in Rural Communities',
        description: 'Exploring how technology is transforming rural economies and creating new opportunities in regions like the Kootenays.',
        startTime: '2025-06-15T09:00:00',
        endTime: '2025-06-15T10:30:00',
        presenters: [
          {
            id: 1,
            name: 'Sarah Johnson',
            image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
            bio: 'AI researcher with 8+ years of experience in machine learning and neural networks.',
            title: 'AI Research Lead',
            company: 'Mountain Tech Solutions'
          }
        ]
      },
      {
        id: 2,
        title: 'AI Applications in Environmental Monitoring',
        description: 'How machine learning and AI are being used to monitor and protect the unique ecosystems of the Kootenay region.',
        startTime: '2025-06-15T11:00:00',
        endTime: '2025-06-15T12:30:00',
        presenters: [
          {
            id: 2,
            name: 'Michael Chen',
            image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
            bio: 'Machine learning engineer specializing in computer vision and natural language processing.',
            title: 'ML Engineer',
            company: 'Kootenay AI Solutions'
          },
          {
            id: 3,
            name: 'Emma Wilson',
            image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
            bio: 'Data scientist with a background in statistics and environmental science.',
            title: 'Data Scientist',
            company: 'Kootenay Data Insights'
          }
        ],
        resources: [
          {
            id: 1,
            title: 'Presentation Slides',
            url: 'https://example.com/slides/ai-environmental-monitoring',
            type: 'slides'
          },
          {
            id: 2,
            title: 'Sample Code Repository',
            url: 'https://github.com/example/environmental-ai',
            type: 'code'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Nelson Farmers Market - Summer Season Opening',
    date: '2025-05-01',
    end_date: '2025-05-01',
    description: 'Join us for the opening day of the Nelson Farmers Market, featuring local produce, crafts, and a special tech corner showcasing digital solutions for sustainable agriculture.',
    location: 'Cottonwood Falls Park',
    address: '820 Baker Street, Nelson, BC',
    latitude: 49.4935,
    longitude: -117.2953,
    image: 'https://images.pexels.com/photos/2284170/pexels-photo-2284170.jpeg',
    type: 'community',
    url: null,
    max_attendees: null,
    current_attendees: null,
    organizer_id: '4',
    group_id: '2',
    status: 'published',
    featured: false,
    created_at: '2025-03-10'
  },
  {
    id: '3',
    title: 'AI for Good Hackathon',
    date: '2025-05-15',
    end_date: '2025-05-16',
    description: 'A 24-hour hackathon focused on developing AI solutions for social and environmental challenges facing the Kootenay region.',
    location: 'Selkirk College, Nelson Campus',
    address: '820 Tenth Street, Nelson, BC',
    latitude: 49.4950,
    longitude: -117.2960,
    image: 'https://images.pexels.com/photos/7096/people-woman-coffee-meeting.jpg',
    type: 'hackathon',
    url: 'https://aiforgood.example.com',
    max_attendees: 50,
    current_attendees: 32,
    organizer_id: '1',
    group_id: '3',
    status: 'published',
    featured: true,
    created_at: '2025-02-20'
  },
  {
    id: '4',
    title: 'Kaslo Jazz Etc. Festival 2025',
    date: '2025-07-30',
    end_date: '2025-08-01',
    description: 'Annual music festival featuring jazz, blues, and more on the shores of Kootenay Lake, with a tech pavilion showcasing digital art and music technology.',
    location: 'Kaslo Bay Park',
    address: 'Front Street, Kaslo, BC',
    latitude: 49.9122,
    longitude: -116.9100,
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    type: 'festival',
    url: 'https://kaslojazzfest.example.com',
    max_attendees: 3000,
    current_attendees: 2100,
    organizer_id: '5',
    group_id: '5',
    status: 'published',
    featured: true,
    created_at: '2025-01-05'
  },
  {
    id: '5',
    title: 'Community Coding Night - Open Source Contributions',
    date: '2025-04-20',
    end_date: '2025-04-20',
    description: 'Join us for a night of collaborative coding and contributing to open source projects that benefit the Kootenay community.',
    location: 'Nelson Innovation Centre',
    address: '450 Ward Street, Nelson, BC',
    latitude: 49.4928,
    longitude: -117.2948,
    image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg',
    type: 'workshop',
    url: null,
    max_attendees: 30,
    current_attendees: 18,
    organizer_id: '4',
    group_id: '1',
    status: 'published',
    featured: false,
    created_at: '2025-03-01'
  },
  {
    id: '6',
    title: 'Kootenay Tech Startup Weekend',
    date: '2025-06-05',
    end_date: '2025-06-07',
    description: 'A weekend-long event where aspiring entrepreneurs form teams, develop ideas, and launch startup concepts focused on solving local challenges.',
    location: 'MIDAS Lab',
    address: '900 Industrial Road, Trail, BC',
    latitude: 49.0966,
    longitude: -117.7117,
    image: 'https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg',
    type: 'startup',
    url: 'https://startupweekend.example.com',
    max_attendees: 75,
    current_attendees: 45,
    organizer_id: '3',
    group_id: null,
    status: 'published',
    featured: true,
    created_at: '2025-02-10'
  },
  {
    id: '7',
    title: 'Rossland Mountain Film Festival',
    date: '2025-04-30',
    end_date: '2025-05-02',
    description: 'Annual film festival celebrating mountain culture, outdoor adventure, and environmental documentaries, with a special focus on films using innovative technology.',
    location: 'Miners Hall',
    address: '1765 Columbia Avenue, Rossland, BC',
    latitude: 49.0773,
    longitude: -117.8022,
    image: 'https://images.pexels.com/photos/2686558/pexels-photo-2686558.jpeg',
    type: 'festival',
    url: 'https://rmff.example.com',
    max_attendees: 200,
    current_attendees: 175,
    organizer_id: '3',
    group_id: '4',
    status: 'published',
    featured: false,
    created_at: '2025-01-20'
  },
  {
    id: '8',
    title: 'Web Development Bootcamp',
    date: '2024-11-10',
    end_date: '2024-11-12',
    description: 'Intensive three-day bootcamp covering modern web development technologies and practices.',
    location: 'Nelson Innovation Centre',
    address: '450 Ward Street, Nelson, BC',
    latitude: 49.4928,
    longitude: -117.2948,
    image: 'https://images.pexels.com/photos/574069/pexels-photo-574069.jpeg',
    type: 'workshop',
    url: null,
    max_attendees: 25,
    current_attendees: 25,
    organizer_id: '4',
    group_id: '1',
    status: 'archived',
    featured: false,
    created_at: '2024-09-15',
    sessions: [
      {
        id: 3,
        title: 'Modern Frontend Development with React',
        description: 'An introduction to building responsive, interactive web applications with React.',
        startTime: '2024-11-10T09:00:00',
        endTime: '2024-11-10T16:00:00',
        presenters: [
          {
            id: 4,
            name: 'David Park',
            image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            title: 'Frontend Developer',
            company: 'Mountain Web Works'
          }
        ],
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        resources: [
          {
            id: 3,
            title: 'Workshop Materials',
            url: 'https://github.com/example/react-workshop',
            type: 'code'
          }
        ]
      }
    ]
  },
  {
    id: '9',
    title: 'Data Science for Environmental Monitoring',
    date: '2024-09-20',
    end_date: '2024-09-20',
    description: 'Workshop on using data science techniques to analyze environmental data from the Kootenay region.',
    location: 'Selkirk College, Castlegar Campus',
    address: '301 Frank Beinder Way, Castlegar, BC',
    latitude: 49.3150,
    longitude: -117.6390,
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg',
    type: 'workshop',
    url: null,
    max_attendees: 30,
    current_attendees: 28,
    organizer_id: '3',
    group_id: '3',
    status: 'archived',
    featured: false,
    created_at: '2024-08-01',
    sessions: [
      {
        id: 4,
        title: 'Analyzing Water Quality Data with Python',
        description: 'Hands-on session working with real water quality data from Kootenay Lake.',
        startTime: '2024-09-20T13:00:00',
        endTime: '2024-09-20T16:00:00',
        presenters: [
          {
            id: 3,
            name: 'Emma Wilson',
            image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
            title: 'Data Scientist',
            company: 'Kootenay Data Insights'
          }
        ],
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        resources: [
          {
            id: 4,
            title: 'Workshop Notebook',
            url: 'https://github.com/example/water-quality-analysis',
            type: 'code'
          },
          {
            id: 5,
            title: 'Data Sets',
            url: 'https://example.com/datasets/kootenay-water',
            type: 'document'
          }
        ]
      }
    ]
  },
  {
    id: '10',
    title: 'Kootenay AI Meetup: Machine Learning Basics',
    date: '2024-10-05',
    end_date: '2024-10-05',
    description: 'Monthly meetup of the Kootenay AI community, focusing on the fundamentals of machine learning.',
    location: 'Nelson Innovation Centre',
    address: '450 Ward Street, Nelson, BC',
    latitude: 49.4928,
    longitude: -117.2948,
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    type: 'meetup',
    url: null,
    max_attendees: 40,
    current_attendees: 35,
    organizer_id: '1',
    group_id: '1',
    status: 'archived',
    featured: false,
    created_at: '2024-09-10'
  },
  {
    id: '11',
    title: 'UX Design for Mountain Communities',
    date: '2024-08-15',
    end_date: '2024-08-15',
    description: 'Workshop exploring how to design digital experiences that meet the unique needs of mountain and rural communities.',
    location: 'Kootenay Gallery of Art',
    address: '120 Heritage Way, Castlegar, BC',
    latitude: 49.3230,
    longitude: -117.6360,
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
    type: 'workshop',
    url: null,
    max_attendees: 25,
    current_attendees: 20,
    organizer_id: '5',
    group_id: '5',
    status: 'archived',
    featured: false,
    created_at: '2024-07-01',
    sessions: [
      {
        id: 5,
        title: 'Designing for Rural Connectivity Challenges',
        description: 'Strategies for creating user experiences that work well in areas with limited internet connectivity.',
        startTime: '2024-08-15T10:00:00',
        endTime: '2024-08-15T12:00:00',
        presenters: [
          {
            id: 5,
            name: 'Olivia Martinez',
            image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
            title: 'UX/UI Designer',
            company: 'Kootenay Creative'
          }
        ],
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        resources: [
          {
            id: 6,
            title: 'Workshop Slides',
            url: 'https://example.com/slides/rural-ux-design',
            type: 'slides'
          }
        ]
      }
    ]
  },
  {
    id: '12',
    title: 'Open Source Contribution Day',
    date: '2024-07-20',
    end_date: '2024-07-20',
    description: 'A day dedicated to contributing to open source projects that benefit the local community.',
    location: 'Nelson Innovation Centre',
    address: '450 Ward Street, Nelson, BC',
    latitude: 49.4928,
    longitude: -117.2948,
    image: 'https://images.pexels.com/photos/1181290/pexels-photo-1181290.jpeg',
    type: 'hackathon',
    url: null,
    max_attendees: 30,
    current_attendees: 25,
    organizer_id: '2',
    group_id: '1',
    status: 'archived',
    featured: false,
    created_at: '2024-06-15'
  },
  {
    id: '13',
    title: 'Kootenay Tech Showcase 2024',
    date: '2024-06-10',
    end_date: '2024-06-11',
    description: 'Annual showcase of technology projects and startups from across the Kootenay region.',
    location: 'Prestige Lakeside Resort',
    address: '701 Lakeside Drive, Nelson, BC',
    latitude: 49.4960,
    longitude: -117.2880,
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    type: 'conference',
    url: 'https://kootenaytech.example.com/showcase2024',
    max_attendees: 150,
    current_attendees: 135,
    organizer_id: '1',
    group_id: '1',
    status: 'archived',
    featured: true,
    created_at: '2024-04-01',
    sessions: [
      {
        id: 6,
        title: 'Startup Showcase: Pitches from Local Tech Companies',
        description: 'Five-minute pitches from emerging tech startups in the Kootenay region.',
        startTime: '2024-06-10T13:00:00',
        endTime: '2024-06-10T15:00:00',
        presenters: [
          {
            id: 1,
            name: 'Sarah Johnson',
            image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
            title: 'AI Research Lead',
            company: 'Mountain Tech Solutions'
          }
        ],
        videoUrl: 'https://www.youtube.com/watch?v=example4',
        resources: [
          {
            id: 7,
            title: 'Showcase Program',
            url: 'https://example.com/showcase2024/program',
            type: 'document'
          }
        ]
      }
    ]
  }
];
