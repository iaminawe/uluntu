import { resendService } from '../src/services/resend';
import type { NewsletterCampaign, NewsletterSubscription } from '../src/types/newsletter';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function sendTestNewsletter() {
  console.log('🚀 Starting test newsletter send...\n');

  // Create a test campaign
  const testCampaign: NewsletterCampaign = {
    id: 'test-campaign-' + Date.now(),
    title: 'Test Newsletter Campaign',
    subject: 'Test Newsletter - Kootenay Tech Community',
    template_id: 'default',
    content: {
      events: [
        {
          id: 'event-1',
          title: 'Tech Meetup: AI & Machine Learning',
          description: 'Join us for an exciting evening exploring the latest developments in AI and machine learning. We\'ll have guest speakers from local tech companies sharing their experiences and insights.',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Nelson Innovation Centre',
          registration_url: 'https://example.com/register/ai-meetup',
          categories: ['tech', 'ai', 'networking']
        },
        {
          id: 'event-2',
          title: 'Startup Pitch Night',
          description: 'Watch local startups pitch their innovative ideas to a panel of investors and mentors. Great networking opportunity!',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Castlegar Tech Hub',
          registration_url: 'https://example.com/register/pitch-night',
          categories: ['startup', 'networking', 'investment']
        }
      ],
      news: [
        {
          id: 'news-1',
          title: 'New Co-working Space Opens in Trail',
          excerpt: 'A new co-working space has opened its doors in downtown Trail, offering flexible workspace solutions for remote workers and freelancers in the region.',
          author: 'Sarah Johnson',
          published_at: new Date().toISOString(),
          read_more_url: 'https://example.com/news/coworking-trail',
          categories: ['community', 'workspace']
        },
        {
          id: 'news-2',
          title: 'Local Tech Company Secures $2M in Funding',
          excerpt: 'Kootenay-based software company TechVentures has successfully closed a $2 million funding round to expand their operations.',
          author: 'Mike Chen',
          published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read_more_url: 'https://example.com/news/techventures-funding',
          categories: ['funding', 'startup']
        }
      ],
      opportunities: [
        {
          id: 'opp-1',
          title: 'Senior Full Stack Developer',
          company: 'TechVentures',
          description: 'We\'re looking for an experienced full stack developer to join our growing team. Experience with React, Node.js, and cloud technologies required.',
          location: 'Nelson, BC',
          remote: true,
          application_url: 'https://example.com/jobs/senior-developer',
          categories: ['development', 'full-stack']
        },
        {
          id: 'opp-2',
          title: 'UX/UI Designer',
          company: 'Digital Solutions Inc.',
          description: 'Join our design team to create beautiful and intuitive user experiences for our suite of web applications.',
          location: 'Remote',
          remote: true,
          application_url: 'https://example.com/jobs/ux-designer',
          categories: ['design', 'ux']
        }
      ],
      marketplace: []
    },
    custom_message: 'This is a test newsletter to verify the Resend integration is working correctly. All events and opportunities listed are sample data for testing purposes.',
    branding: {
      primary_color: '#667eea',
      secondary_color: '#764ba2',
      logo_url: '',
      header_image: '',
      footer_text: 'Kootenay Tech Community',
      social_links: [
        { platform: 'twitter', url: 'https://twitter.com/kootenaytech' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/kootenaytech' }
      ]
    },
    status: 'draft',
    send_type: 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'test-script',
    recipient_count: 1,
    delivery_stats: {
      sent: 0,
      delivered: 0,
      bounced: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      complained: 0
    }
  };

  // Create a test subscriber
  const testSubscriber: NewsletterSubscription = {
    id: 'test-subscriber-' + Date.now(),
    email: 'gregg@iaminawe.com',
    status: 'active',
    preferences: {
      frequency: 'weekly',
      content_types: ['events', 'news', 'opportunities', 'marketplace'],
      format: 'digest',
      location_filter: false,
      language: 'en'
    },
    subscription_token: 'test-token-' + Date.now(),
    subscribed_at: new Date().toISOString(),
    bounce_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    // Check if API key is configured
    const apiKey = process.env.VITE_RESEND_API_KEY;
    if (!apiKey) {
      console.error('❌ Resend API key not found in environment variables');
      console.log('Please make sure VITE_RESEND_API_KEY is set in your .env file');
      process.exit(1);
    }

    console.log('📧 Campaign Details:');
    console.log('   - Subject:', testCampaign.subject);
    console.log('   - Recipient:', testSubscriber.email);
    console.log('   - Events:', testCampaign.content.events.length);
    console.log('   - News:', testCampaign.content.news.length);
    console.log('   - Opportunities:', testCampaign.content.opportunities.length);
    console.log('');

    // Send test email using the service
    console.log('📤 Sending test newsletter...');
    const result = await resendService.sendTestEmail(testCampaign, [testSubscriber.email]);

    if (result) {
      console.log('✅ Test newsletter sent successfully!');
      console.log('');
      console.log('📬 The test email should arrive at gregg@iaminawe.com shortly.');
      console.log('   Check for an email with subject: [TEST] ' + testCampaign.subject);
    } else {
      console.error('❌ Failed to send test newsletter');
      console.log('Please check the logs above for more details.');
    }

  } catch (error) {
    console.error('❌ Error sending test newsletter:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
sendTestNewsletter();