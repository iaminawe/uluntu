import { ContentStatus } from '../../types/common';
import { MockMarketplaceListing } from '../../types/marketplace';

// Use the centralized MockMarketplaceListing type
export const marketplaceListings: MockMarketplaceListing[] = [
    {
        id: 'd1a302d5-7109-4c75-9ec8-2d8f41ab8432',
        title: 'Web Development Services',
        description: 'Professional web development services for small businesses and startups',
        type: 'service',
        price: 75.00,
        location: 'Nelson, BC',
        tags: ['web-development', 'frontend', 'backend'],
        status: 'published' as ContentStatus,
        featured: true,
        seller_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        images: ['https://placehold.co/800x600?text=Web+Dev']
    },
    {
        id: 'd1a302d5-7109-4c75-9ec8-2d8f41ab8433',
        title: 'Used MacBook Pro (2019)',
        description: '2019 MacBook Pro, 16-inch, 16GB RAM, 512GB SSD, excellent condition',
        type: 'product',
        price: 1200.00,
        condition: 'used',
        location: 'Nelson, BC',
        tags: ['laptop', 'apple', 'macbook'],
        status: 'published' as ContentStatus,
        featured: false,
        seller_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d482',
        images: ['https://placehold.co/800x600?text=MacBook']
    },
    {
        id: 'd1a302d5-7109-4c75-9ec8-2d8f41ab8434',
        title: 'UX Design Workshop',
        description: 'One-day workshop on UX design principles and practices',
        type: 'event',
        price: 50.00,
        location: 'Nelson, BC',
        tags: ['ux', 'design', 'workshop'],
        status: 'published' as ContentStatus,
        featured: true,
        seller_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        images: ['https://placehold.co/800x600?text=UX+Workshop']
    }
];