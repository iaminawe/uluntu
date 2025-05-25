import { BaseEntity } from './types';

// News article interface
export interface NewsArticle extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  image?: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  tags?: string[];
}

// News articles data
export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Kootenay Tech Ecosystem Sees Record Growth in 2024',
    slug: 'kootenay-tech-ecosystem-growth-2024',
    excerpt: 'The Kootenay region has experienced unprecedented growth in its technology sector, with new startups, increased investment, and expanding talent pool.',
    content: `
      <p>The Kootenay region's technology ecosystem has reached new heights in 2024, according to a recent report by the BC Tech Association. The report highlights a 35% increase in tech-related businesses, a significant jump from previous years.</p>
      
      <p>"We're seeing a perfect storm of factors contributing to this growth," says Sarah Johnson, AI Research Lead at Mountain Tech Solutions. "The combination of remote work opportunities, quality of life, and growing support infrastructure has made the Kootenays an attractive destination for tech professionals and entrepreneurs."</p>
      
      <p>The report identifies several key drivers behind this growth:</p>
      
      <ul>
        <li>Expansion of high-speed internet infrastructure to more rural areas</li>
        <li>Increase in co-working spaces and innovation hubs</li>
        <li>Growing network of angel investors focused on rural tech</li>
        <li>Success of local startups attracting attention and talent</li>
        <li>Educational initiatives creating a pipeline of skilled workers</li>
      </ul>
      
      <p>Particularly notable is the diversity of the tech ecosystem, with companies spanning AI, clean technology, digital health, and creative industries. Many are leveraging the unique environmental and social context of the Kootenays to develop innovative solutions.</p>
      
      <p>The Nelson Innovation Centre has played a central role in this growth, providing resources, mentorship, and community for tech workers and entrepreneurs. "We've seen our membership triple in the past two years," notes Michael Chen, the centre's program director. "What's exciting is the collaboration happening between established professionals who've relocated here and local talent."</p>
      
      <p>As the ecosystem continues to evolve, stakeholders are focused on ensuring sustainable growth that benefits the broader community while preserving the qualities that make the region special.</p>
    `,
    publishedAt: '2025-03-15',
    image: 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg',
    author: {
      id: '1',
      name: 'Emma Wilson',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    tags: ['Technology', 'Economic Development', 'Startups'],
    status: 'published',
    featured: true
  },
  {
    id: '2',
    title: 'Local AI Startup Secures $2M in Funding for Environmental Monitoring Platform',
    slug: 'local-ai-startup-funding-environmental-monitoring',
    excerpt: 'Mountain Tech Solutions has secured $2 million in seed funding to develop an AI-powered platform for monitoring forest health and wildfire risk in the Kootenay region.',
    content: `
      <p>Nelson-based AI startup Mountain Tech Solutions has announced a $2 million seed funding round to accelerate development of its environmental monitoring platform, KootenayWatch.</p>
      
      <p>The platform uses a combination of satellite imagery, ground sensors, and machine learning algorithms to monitor forest health, detect early signs of wildfires, and track watershed conditions across the Kootenay region.</p>
      
      <p>"This funding will allow us to expand our sensor network and refine our AI models," says Sarah Johnson, the company's AI Research Lead. "Our goal is to provide communities, conservation organizations, and emergency services with actionable insights about environmental conditions."</p>
      
      <p>The seed round was led by Cascadia Ventures, with participation from the BC Tech Fund and several angel investors with ties to the region.</p>
      
      <p>"What impressed us about Mountain Tech Solutions is how they're applying cutting-edge AI to solve problems that are directly relevant to their community," explains Jordan Chen, partner at Cascadia Ventures. "Their deep understanding of both the technology and the local environmental context gives them a unique advantage."</p>
      
      <p>The company plans to deploy an additional 200 sensors throughout the West Kootenay region this summer and launch a public beta of their platform by fall. They're also partnering with Selkirk College to develop educational resources around environmental data science.</p>
      
      <p>Founded in 2023, Mountain Tech Solutions has grown to a team of 12, with plans to hire an additional 8 employees by the end of the year. The company exemplifies a growing trend of tech startups in the region that leverage the natural environment as both inspiration and laboratory for their innovations.</p>
    `,
    publishedAt: '2025-03-10',
    image: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg',
    author: {
      id: '2',
      name: 'David Park',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    },
    tags: ['Artificial Intelligence', 'Funding', 'Environmental Tech'],
    status: 'published',
    featured: true
  },
  {
    id: '3',
    title: 'Kootenay Tech Conference Announces 2025 Program and Keynote Speakers',
    slug: 'kootenay-tech-conference-2025-program',
    excerpt: 'The annual Kootenay Tech Conference has revealed its program for 2025, featuring keynote speakers from leading tech companies and a focus on rural innovation.',
    content: `
      <p>The organizing committee for the Kootenay Tech Conference (KTC) has announced the program for its 2025 edition, scheduled for June 15-17 at the Nelson Innovation Centre.</p>
      
      <p>Now in its fifth year, the conference has grown to become the premier tech event in the Kootenay region, attracting participants from across British Columbia and beyond.</p>
      
      <p>This year's theme, "Rural Innovation: Technology Beyond Urban Centers," will explore how rural communities are leveraging technology to address unique challenges and create new opportunities.</p>
      
      <p>The conference will feature keynote presentations from:</p>
      
      <ul>
        <li>Dr. Maya Rodriguez, Director of Rural Development at Microsoft</li>
        <li>Jamie Chen, Founder of AgriTech Solutions</li>
        <li>Sarah Johnson, AI Research Lead at Mountain Tech Solutions</li>
      </ul>
      
      <p>"We're excited to bring together such a diverse group of speakers and participants," says Michael Chen, chair of the KTC organizing committee. "The conference has become an important catalyst for collaboration and innovation in our region."</p>
      
      <p>The three-day program includes workshops on AI applications, sustainable technology, remote work strategies, and digital accessibility. New this year is a startup showcase featuring emerging companies from rural communities across Canada.</p>
      
      <p>Early bird registration is now open, with special rates for students and community organizations. The organizers expect approximately 200 attendees, with options for both in-person and virtual participation.</p>
    `,
    publishedAt: '2025-03-05',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    author: {
      id: '3',
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    tags: ['Events', 'Conference', 'Rural Innovation'],
    status: 'published',
    featured: false
  },
  {
    id: '4',
    title: 'New Digital Nomad Program Launches in Nelson',
    slug: 'digital-nomad-program-nelson',
    excerpt: 'The City of Nelson has partnered with local tech organizations to launch a program supporting digital nomads who choose the Kootenay region as their remote work destination.',
    content: `
      <p>The City of Nelson, in partnership with the Nelson Innovation Centre and the Nelson Digital Nomads group, has launched a new program designed to attract and support remote workers to the area.</p>
      
      <p>The "Work From Kootenay" initiative provides resources, community connections, and infrastructure for digital professionals who choose to base themselves in the region while working remotely for companies around the world.</p>
      
      <p>"We've seen a significant increase in remote workers moving to our community over the past few years," explains Mayor Sarah Thompson. "This program formalizes our support for these new residents who bring diverse skills and economic benefits to our region."</p>
      
      <p>The program includes:</p>
      
      <ul>
        <li>A dedicated co-working space at the Nelson Innovation Centre with high-speed internet</li>
        <li>Monthly networking events and professional development workshops</li>
        <li>A digital welcome package with information on local services and community resources</li>
        <li>Discounts at participating local businesses</li>
        <li>Optional mentorship matching with established local professionals</li>
      </ul>
      
      <p>David Park, founder of the Nelson Digital Nomads group, sees the program as a natural evolution of the community that has been forming organically. "We started as an informal meetup group, but the interest has been overwhelming. This partnership with the city allows us to create more structure and support for people who want to combine meaningful work with the Kootenay lifestyle."</p>
      
      <p>The initiative also aims to address challenges that can come with an influx of remote workers, including housing pressures and integration with the existing community. A portion of program fees will support affordable housing initiatives in the region.</p>
      
      <p>Applications for the first cohort of the program are now open, with an initial capacity of 50 participants.</p>
    `,
    publishedAt: '2025-02-28',
    image: 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg',
    author: {
      id: '4',
      name: 'Olivia Martinez',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
    },
    tags: ['Remote Work', 'Digital Nomads', 'Community'],
    status: 'published',
    featured: false
  },
  {
    id: '5',
    title: 'Kootenay Tech Mentorship Program Celebrates First Year of Success',
    slug: 'kootenay-tech-mentorship-program-first-year',
    excerpt: 'The Kootenay Tech Mentorship program marks its first anniversary, having connected over 50 mentors and mentees in the regional tech community.',
    content: `
      <p>The Kootenay Tech Mentorship program is celebrating its first year of operation, having successfully paired over 50 experienced tech professionals with newcomers, career changers, and students in the region.</p>
      
      <p>Launched in March 2024, the program was created to strengthen the local tech ecosystem by facilitating knowledge transfer and building professional relationships across different experience levels and specializations.</p>
      
      <p>"When I moved to Nelson from Vancouver, I was worried about feeling disconnected from the tech community," says Jamie Lee, a software developer who participated as a mentee. "Through this program, I not only found professional guidance but also made connections that led to a job with a local company."</p>
      
      <p>The program operates on a six-month mentorship cycle, with structured check-ins and suggested activities, while allowing each pair to customize their experience. Mentors and mentees meet at least monthly, with many reporting more frequent interactions.</p>
      
      <p>Sarah Johnson, who serves on the program's organizing committee, notes that the benefits flow in both directions. "Our mentors consistently report that the experience has been rewarding for them as well. Explaining concepts to others and being exposed to fresh perspectives helps them grow as professionals and leaders."</p>
      
      <p>The program has attracted participants from across the tech spectrum, including software development, data science, UX design, and digital marketing. A particular focus has been placed on supporting women and other underrepresented groups in the tech industry.</p>
      
      <p>Looking ahead to its second year, the program plans to expand to include group mentorship options and specialized tracks for youth and career transitioners. Applications for the next cohort will open in April 2025.</p>
    `,
    publishedAt: '2025-02-20',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    author: {
      id: '1',
      name: 'Emma Wilson',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    tags: ['Mentorship', 'Education', 'Community'],
    status: 'published',
    featured: false
  }
];
