import { BaseEntity, ContentStatus } from '../../types';

export interface Opportunity extends BaseEntity {
    title: string;
    description?: string;
    type?: string; // Consider an ENUM: 'full-time', 'part-time', 'contract', 'volunteer', 'internship'
    location?: string;
    remote?: boolean;
    compensation?: string;
    deadline?: string;
    contact_email?: string;
    website?: string;
    image?: string;
    featured?: boolean;
    organization?: string; // This currently stores the company name.
    posted_by?: string; // Should ideally be a foreign key to members/users
    requirements?: string[];
    responsibilities?: string[];
    benefits?: string[];
    status: ContentStatus;
}

// Local extended interface for mock data that includes all the fields we need
export interface MockOpportunity extends Omit<Opportunity, 'company'> {
    organization?: string;
    contact_email?: string;
    website?: string;
    compensation?: string;
    posted_by?: string;
    requirements?: string[];
    responsibilities?: string[];
    benefits?: string[];
    company: {
        id: string;
        name: string;
        logo: string;
    };
    postedDate: string;
}

export const opportunities: MockOpportunity[] = [
    {
        id: 'e4e1a013-c60c-4f9f-9a7b-3b5a0c2622d1',
        title: 'Full Stack Developer',
        description: 'We are looking for a skilled Full Stack Developer to join our team',
        type: 'full-time',
        location: 'Nelson, BC',
        remote: true,
        compensation: '$70,000 - $90,000/year',
        deadline: '2023-07-30',
        contact_email: 'jobs@mountaintech.example.com',
        website: 'https://mountaintech.example.com/careers',
        image: 'https://placehold.co/800x400?text=Developer+Job',
        status: 'published' as ContentStatus,
        featured: true,
        organization: 'Mountain Tech Solutions',
        posted_by: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        requirements: ['3+ years experience with JavaScript', 'Experience with React and Node.js', 'Strong problem-solving skills'],
        responsibilities: ['Develop and maintain web applications', 'Collaborate with the design team', 'Optimize applications for performance'],
        benefits: ['Flexible work hours', 'Health benefits', 'Professional development budget'],
        // Map to the expected Opportunity interface from types.ts
        company: {
            id: 'org-001',
            name: 'Mountain Tech Solutions',
            logo: 'https://placehold.co/200x200?text=MTS'
        },
        postedDate: '2023-06-30',
    },
    {
        id: 'e4e1a013-c60c-4f9f-9a7b-3b5a0c2622d2',
        title: 'UX/UI Designer',
        description: 'Seeking a talented UX/UI Designer to create beautiful user experiences',
        type: 'contract',
        location: 'Nelson, BC',
        remote: true,
        compensation: '$40-50/hour',
        deadline: '2023-08-15',
        contact_email: 'design@greenvalley.example.com',
        website: 'https://greenvalley.example.com/jobs',
        image: 'https://placehold.co/800x400?text=Designer+Job',
        status: 'published' as ContentStatus,
        featured: false,
        organization: 'Green Valley Design',
        posted_by: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        requirements: ['Portfolio demonstrating UI/UX skills', 'Experience with Figma or similar tools', 'Understanding of accessibility standards'],
        responsibilities: ['Create user-centered designs', 'Develop wireframes and prototypes', 'Conduct user testing'],
        benefits: ['Remote work options', 'Flexible schedule', 'Collaborative team environment'],
        // Map to the expected Opportunity interface from types.ts
        company: {
            id: 'org-002',
            name: 'Green Valley Design',
            logo: 'https://placehold.co/200x200?text=GVD'
        },
        postedDate: '2023-07-15',
    },
    {
        id: 'e4e1a013-c60c-4f9f-9a7b-3b5a0c2622d3',
        title: 'Data Science Volunteer',
        description: 'Volunteer opportunity to help local non-profits with data analysis',
        type: 'volunteer',
        location: 'Nelson, BC',
        remote: false,
        compensation: 'Unpaid',
        deadline: '2023-09-01',
        contact_email: 'volunteer@datainsights.example.com',
        website: 'https://datainsights.example.com/volunteer',
        image: 'https://placehold.co/800x400?text=Volunteer',
        status: 'published' as ContentStatus,
        featured: true,
        organization: 'Data Insights Co',
        posted_by: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        requirements: ['Basic knowledge of data analysis', 'Familiarity with Python or R', 'Interest in non-profit sector'],
        responsibilities: ['Analyze data for local non-profits', 'Create visualizations and reports', 'Present findings to stakeholders'],
        benefits: ['Valuable experience', 'Networking opportunities', 'Reference letter upon completion'],
        // Map to the expected Opportunity interface from types.ts
        company: {
            id: 'org-003',
            name: 'Data Insights Co',
            logo: 'https://placehold.co/200x200?text=DIC'
        },
        postedDate: '2023-08-01',
    }
];
