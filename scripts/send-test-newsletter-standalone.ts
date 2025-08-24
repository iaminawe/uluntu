import { Resend } from 'resend';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

interface NewsletterContent {
  events: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    registration_url?: string;
  }>;
  news: Array<{
    id: string;
    title: string;
    excerpt: string;
    author: string;
    published_at: string;
    read_more_url?: string;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    company: string;
    description: string;
    location?: string;
    remote?: boolean;
    application_url?: string;
  }>;
}

async function sendTestNewsletter() {
  console.log('🚀 Starting test newsletter send...\n');

  const apiKey = process.env.VITE_RESEND_API_KEY;
  const fromEmail = process.env.VITE_FROM_EMAIL || 'newsletter@kootenaytech.community';
  const fromName = process.env.VITE_FROM_NAME || 'Kootenay Tech Community';

  if (!apiKey) {
    console.error('❌ Resend API key not found in environment variables');
    console.log('Please make sure VITE_RESEND_API_KEY is set in your .env file');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  // Create test content
  const content: NewsletterContent = {
    events: [
      {
        id: 'event-1',
        title: 'Tech Meetup: AI & Machine Learning',
        description: 'Join us for an exciting evening exploring the latest developments in AI and machine learning.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Nelson Innovation Centre',
        registration_url: 'https://example.com/register/ai-meetup'
      },
      {
        id: 'event-2',
        title: 'Startup Pitch Night',
        description: 'Watch local startups pitch their innovative ideas to investors and mentors.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Castlegar Tech Hub',
        registration_url: 'https://example.com/register/pitch-night'
      }
    ],
    news: [
      {
        id: 'news-1',
        title: 'New Co-working Space Opens in Trail',
        excerpt: 'A new co-working space has opened in downtown Trail, offering flexible workspace solutions.',
        author: 'Sarah Johnson',
        published_at: new Date().toISOString(),
        read_more_url: 'https://example.com/news/coworking-trail'
      },
      {
        id: 'news-2',
        title: 'Local Tech Company Secures $2M in Funding',
        excerpt: 'TechVentures has successfully closed a $2 million funding round.',
        author: 'Mike Chen',
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read_more_url: 'https://example.com/news/techventures-funding'
      }
    ],
    opportunities: [
      {
        id: 'opp-1',
        title: 'Senior Full Stack Developer',
        company: 'TechVentures',
        description: 'Looking for an experienced full stack developer with React and Node.js skills.',
        location: 'Nelson, BC',
        remote: true,
        application_url: 'https://example.com/jobs/senior-developer'
      },
      {
        id: 'opp-2',
        title: 'UX/UI Designer',
        company: 'Digital Solutions Inc.',
        description: 'Join our design team to create beautiful user experiences.',
        location: 'Remote',
        remote: true,
        application_url: 'https://example.com/jobs/ux-designer'
      }
    ]
  };

  // Generate HTML email
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kootenay Tech Community Newsletter</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
        }
        .content { 
          padding: 30px;
        }
        .section { 
          margin-bottom: 40px;
        }
        .section h2 {
          color: #2d3748;
          font-size: 22px;
          margin: 0 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        .event-card, .news-card, .job-card { 
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
        }
        .event-card h3, .news-card h3, .job-card h3 {
          color: #4a5568;
          margin: 0 0 10px 0;
          font-size: 18px;
        }
        .meta {
          color: #718096;
          font-size: 14px;
          margin: 5px 0;
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 5px;
          font-weight: 500;
          margin-top: 10px;
        }
        .test-notice {
          background: #fff5e5;
          border: 1px solid #ffb347;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 30px;
        }
        .test-notice h3 {
          color: #ff8c00;
          margin: 0 0 10px 0;
        }
        .footer { 
          background-color: #2d3748; 
          color: #a0aec0;
          padding: 30px; 
          text-align: center; 
          font-size: 14px;
        }
        .footer a {
          color: #a0aec0;
          text-decoration: underline;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Kootenay Tech Community</h1>
          <p>Your Weekly Tech Newsletter</p>
        </div>
        
        <div class="content">
          <div class="test-notice">
            <h3>⚠️ Test Newsletter</h3>
            <p>This is a test newsletter to verify the Resend integration. All events and opportunities listed are sample data for testing purposes.</p>
          </div>

          <div class="section">
            <h2>📅 Upcoming Events</h2>
            ${content.events.map(event => `
              <div class="event-card">
                <h3>${event.title}</h3>
                <p class="meta">📍 ${event.location} • 📅 ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p>${event.description}</p>
                ${event.registration_url ? `<a href="${event.registration_url}" class="button">Register Now</a>` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2>📰 Community News</h2>
            ${content.news.map(article => `
              <div class="news-card">
                <h3>${article.title}</h3>
                <p class="meta">By ${article.author} • ${new Date(article.published_at).toLocaleDateString()}</p>
                <p>${article.excerpt}</p>
                ${article.read_more_url ? `<a href="${article.read_more_url}" style="color: #667eea; text-decoration: none;">Read more →</a>` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2>💼 Job Opportunities</h2>
            ${content.opportunities.map(job => `
              <div class="job-card">
                <h3>${job.title}</h3>
                <p class="meta"><strong>${job.company}</strong> • ${job.location || 'Remote'} ${job.remote ? '• 🏠 Remote Available' : ''}</p>
                <p>${job.description}</p>
                ${job.application_url ? `<a href="${job.application_url}" class="button">Apply Now</a>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Kootenay Tech Community</strong></p>
          <p>Building connections in the Kootenay tech ecosystem</p>
          <p style="margin-top: 20px;">
            <a href="#">Unsubscribe</a> • 
            <a href="#">View in browser</a> • 
            <a href="#">Update preferences</a>
          </p>
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            This is a test email sent to verify the Resend integration
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Kootenay Tech Community Newsletter - Test

⚠️ TEST NEWSLETTER
This is a test newsletter to verify the Resend integration.

UPCOMING EVENTS:
${content.events.map(e => `- ${e.title} at ${e.location} on ${new Date(e.date).toLocaleDateString()}`).join('\n')}

COMMUNITY NEWS:
${content.news.map(n => `- ${n.title} by ${n.author}`).join('\n')}

JOB OPPORTUNITIES:
${content.opportunities.map(j => `- ${j.title} at ${j.company}`).join('\n')}

---
Kootenay Tech Community
Building connections in the Kootenay tech ecosystem

Unsubscribe | View in browser | Update preferences
  `;

  try {
    console.log('📧 Sending test newsletter to gregg@iaminawe.com...');
    console.log('   From:', `${fromName} <${fromEmail}>`);
    
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: ['gregg@iaminawe.com'],
      subject: '[TEST] Kootenay Tech Community Newsletter - Integration Test',
      html,
      text,
      headers: {
        'X-Test-Email': 'true',
        'X-Campaign-ID': 'test-' + Date.now()
      },
      tags: [
        { name: 'type', value: 'test' },
        { name: 'campaign', value: 'integration-test' }
      ]
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      process.exit(1);
    }

    console.log('\n✅ Test newsletter sent successfully!');
    console.log('\n📬 Email Details:');
    console.log('   - Message ID:', data?.id);
    console.log('   - To: gregg@iaminawe.com');
    console.log('   - Subject: [TEST] Kootenay Tech Community Newsletter');
    console.log('\n✨ The test email should arrive in your inbox shortly.');
    
  } catch (error) {
    console.error('❌ Failed to send test newsletter:', error);
    process.exit(1);
  }
}

// Run the test
sendTestNewsletter();