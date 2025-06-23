-- Add transactional email templates to newsletter_templates table
-- This migration adds specific templates for transactional emails

-- Insert transactional email templates
INSERT INTO newsletter_templates (name, description, type, template_content, default_settings, is_active) VALUES 
(
  'Welcome Email',
  'Welcome email for new community members',
  'mjml',
  '<mjml>
    <mj-head>
      <mj-title>Welcome to {{community_name}}</mj-title>
      <mj-attributes>
        <mj-all font-family="Arial, sans-serif" />
        <mj-text font-size="16px" color="#333" line-height="1.6" />
        <mj-button background-color="{{branding.primary_color}}" border-radius="6px" font-size="16px" />
      </mj-attributes>
    </mj-head>
    <mj-body background-color="#f8f9fa">
      <mj-section background-color="#ffffff" border-radius="8px" padding="40px">
        <mj-column>
          <mj-image src="{{branding.logo_url}}" alt="{{community_name}}" width="200px" />
          <mj-text font-size="24px" font-weight="bold" color="{{branding.primary_color}}" align="center">
            Welcome to {{community_name}}!
          </mj-text>
          <mj-text>
            Hi {{user.first_name}},
          </mj-text>
          <mj-text>
            We''re excited to have you join our tech community! Your account has been successfully created and you can now access all the features of our platform.
          </mj-text>
          <mj-text font-weight="bold">
            What you can do now:
          </mj-text>
          <mj-text>
            • Browse and join community events<br/>
            • Connect with other tech professionals<br/>
            • Access exclusive resources and opportunities<br/>
            • Participate in discussions and forums
          </mj-text>
          <mj-button href="{{platform_url}}/dashboard">
            Get Started
          </mj-button>
          <mj-text font-size="14px" color="#666">
            If you have any questions, feel free to reach out to our support team at {{support_email}}.
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section padding="20px">
        <mj-column>
          <mj-text font-size="12px" color="#999" align="center">
            {{branding.footer_text}}<br/>
            <a href="{{unsubscribe_url}}" style="color: #999;">Unsubscribe</a>
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>',
  '{"variables": ["user", "community_name", "platform_url", "support_email", "branding", "unsubscribe_url"]}',
  true
),
(
  'Password Reset',
  'Password reset email with secure token',
  'mjml',
  '<mjml>
    <mj-head>
      <mj-title>Password Reset Request</mj-title>
      <mj-attributes>
        <mj-all font-family="Arial, sans-serif" />
        <mj-text font-size="16px" color="#333" line-height="1.6" />
        <mj-button background-color="{{branding.primary_color}}" border-radius="6px" font-size="16px" />
      </mj-attributes>
    </mj-head>
    <mj-body background-color="#f8f9fa">
      <mj-section background-color="#ffffff" border-radius="8px" padding="40px">
        <mj-column>
          <mj-image src="{{branding.logo_url}}" alt="{{community_name}}" width="200px" />
          <mj-text font-size="24px" font-weight="bold" color="{{branding.primary_color}}" align="center">
            Password Reset Request
          </mj-text>
          <mj-text>
            Hi {{user.first_name}},
          </mj-text>
          <mj-text>
            We received a request to reset your password for your {{community_name}} account. If you made this request, click the button below to reset your password:
          </mj-text>
          <mj-button href="{{reset_url}}">
            Reset Password
          </mj-button>
          <mj-text font-size="14px" color="#666">
            This link will expire in {{expiry_hours}} hours for security reasons.
          </mj-text>
          <mj-text font-size="14px" color="#666">
            If you didn''t request this password reset, please ignore this email. Your password will remain unchanged.
          </mj-text>
          <mj-text font-size="12px" color="#999" padding-top="20px">
            For security reasons, if you continue to receive these emails, please contact our support team at {{support_email}}.
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section padding="20px">
        <mj-column>
          <mj-text font-size="12px" color="#999" align="center">
            {{branding.footer_text}}<br/>
            This is an automated security email.
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>',
  '{"variables": ["user", "community_name", "reset_url", "expiry_hours", "support_email", "branding"]}',
  true
),
(
  'Email Verification',
  'Email verification for new accounts',
  'mjml',
  '<mjml>
    <mj-head>
      <mj-title>Verify Your Email Address</mj-title>
      <mj-attributes>
        <mj-all font-family="Arial, sans-serif" />
        <mj-text font-size="16px" color="#333" line-height="1.6" />
        <mj-button background-color="{{branding.primary_color}}" border-radius="6px" font-size="16px" />
      </mj-attributes>
    </mj-head>
    <mj-body background-color="#f8f9fa">
      <mj-section background-color="#ffffff" border-radius="8px" padding="40px">
        <mj-column>
          <mj-image src="{{branding.logo_url}}" alt="{{community_name}}" width="200px" />
          <mj-text font-size="24px" font-weight="bold" color="{{branding.primary_color}}" align="center">
            Verify Your Email
          </mj-text>
          <mj-text>
            Hi {{user.first_name}},
          </mj-text>
          <mj-text>
            Thanks for signing up for {{community_name}}! To complete your registration and activate your account, please verify your email address by clicking the button below:
          </mj-text>
          <mj-button href="{{verification_url}}">
            Verify Email Address
          </mj-button>
          <mj-text font-size="14px" color="#666">
            This verification link will expire in {{expiry_hours}} hours.
          </mj-text>
          <mj-text font-size="14px" color="#666">
            If you didn''t create an account with {{community_name}}, please ignore this email.
          </mj-text>
          <mj-text font-size="12px" color="#999">
            If you''re having trouble clicking the button, copy and paste this URL into your browser:<br/>
            {{verification_url}}
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section padding="20px">
        <mj-column>
          <mj-text font-size="12px" color="#999" align="center">
            {{branding.footer_text}}<br/>
            This is an automated verification email.
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>',
  '{"variables": ["user", "community_name", "verification_url", "expiry_hours", "branding"]}',
  true
),
(
  'Contact Form Auto-Reply',
  'Automated response for contact form submissions',
  'mjml',
  '<mjml>
    <mj-head>
      <mj-title>Thank you for contacting us</mj-title>
      <mj-attributes>
        <mj-all font-family="Arial, sans-serif" />
        <mj-text font-size="16px" color="#333" line-height="1.6" />
        <mj-button background-color="{{branding.primary_color}}" border-radius="6px" font-size="16px" />
      </mj-attributes>
    </mj-head>
    <mj-body background-color="#f8f9fa">
      <mj-section background-color="#ffffff" border-radius="8px" padding="40px">
        <mj-column>
          <mj-image src="{{branding.logo_url}}" alt="{{community_name}}" width="200px" />
          <mj-text font-size="24px" font-weight="bold" color="{{branding.primary_color}}" align="center">
            Thanks for reaching out!
          </mj-text>
          <mj-text>
            Hi {{submission.name}},
          </mj-text>
          <mj-text>
            We''ve received your message and will get back to you as soon as possible. Here''s a summary of what you sent us:
          </mj-text>
          <mj-section background-color="#f8f9fa" border-radius="6px" padding="20px">
            <mj-column>
              <mj-text font-weight="bold">Subject:</mj-text>
              <mj-text>{{submission.subject}}</mj-text>
              <mj-text font-weight="bold" padding-top="10px">Message:</mj-text>
              <mj-text>{{submission.message}}</mj-text>
              <mj-text font-weight="bold" padding-top="10px">Ticket ID:</mj-text>
              <mj-text>#{{submission.id}}</mj-text>
            </mj-column>
          </mj-section>
          <mj-text>
            <strong>Estimated response time:</strong> {{estimated_response_time}}
          </mj-text>
          <mj-text font-size="14px" color="#666">
            If you have any urgent questions, please don''t hesitate to reach out to us directly at {{support_email}}.
          </mj-text>
          <mj-button href="{{support_url}}">
            Visit Support Center
          </mj-button>
        </mj-column>
      </mj-section>
      <mj-section padding="20px">
        <mj-column>
          <mj-text font-size="12px" color="#999" align="center">
            {{branding.footer_text}}<br/>
            This is an automated response.
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>',
  '{"variables": ["submission", "community_name", "estimated_response_time", "support_email", "support_url", "branding"]}',
  true
),
(
  'Newsletter Digest',
  'Weekly community digest newsletter',
  'mjml',
  '<mjml>
    <mj-head>
      <mj-title>{{newsletter.title}}</mj-title>
      <mj-attributes>
        <mj-all font-family="Arial, sans-serif" />
        <mj-text font-size="16px" color="#333" line-height="1.6" />
        <mj-button background-color="{{branding.primary_color}}" border-radius="6px" font-size="16px" />
      </mj-attributes>
    </mj-head>
    <mj-body background-color="#f8f9fa">
      <!-- Header -->
      <mj-section background-color="{{branding.primary_color}}" padding="20px">
        <mj-column>
          <mj-image src="{{branding.logo_url}}" alt="{{community_name}}" width="200px" />
          <mj-text color="#ffffff" font-size="24px" font-weight="bold" align="center">
            {{newsletter.title}}
          </mj-text>
          <mj-text color="#ffffff" font-size="16px" align="center">
            {{newsletter.date}}
          </mj-text>
        </mj-column>
      </mj-section>

      <!-- Custom Message -->
      {{#if newsletter.custom_message}}
      <mj-section background-color="#ffffff" padding="20px">
        <mj-column>
          <mj-text font-size="18px" font-weight="bold" color="{{branding.primary_color}}">
            Message from the Team
          </mj-text>
          <mj-text>
            {{newsletter.custom_message}}
          </mj-text>
        </mj-column>
      </mj-section>
      {{/if}}

      <!-- Events Section -->
      {{#if content.events}}
      <mj-section background-color="#ffffff" padding="20px">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" color="{{branding.primary_color}}">
            📅 Upcoming Events
          </mj-text>
          {{#each content.events}}
          <mj-text padding-bottom="15px">
            <strong>{{this.title}}</strong><br/>
            {{this.date}} at {{this.time}}<br/>
            {{this.location}}<br/>
            <a href="{{this.url}}" style="color: {{branding.primary_color}};">Learn more →</a>
          </mj-text>
          {{/each}}
        </mj-column>
      </mj-section>
      {{/if}}

      <!-- News Section -->
      {{#if content.news}}
      <mj-section background-color="#f8f9fa" padding="20px">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" color="{{branding.primary_color}}">
            📰 Latest News
          </mj-text>
          {{#each content.news}}
          <mj-text padding-bottom="15px">
            <strong>{{this.title}}</strong><br/>
            {{this.excerpt}}<br/>
            <a href="{{this.url}}" style="color: {{branding.primary_color}};">Read more →</a>
          </mj-text>
          {{/each}}
        </mj-column>
      </mj-section>
      {{/if}}

      <!-- Opportunities Section -->
      {{#if content.opportunities}}
      <mj-section background-color="#ffffff" padding="20px">
        <mj-column>
          <mj-text font-size="20px" font-weight="bold" color="{{branding.primary_color}}">
            💼 New Opportunities
          </mj-text>
          {{#each content.opportunities}}
          <mj-text padding-bottom="15px">
            <strong>{{this.title}}</strong><br/>
            {{this.company}} - {{this.location}}<br/>
            {{this.type}}<br/>
            <a href="{{this.url}}" style="color: {{branding.primary_color}};">Apply now →</a>
          </mj-text>
          {{/each}}
        </mj-column>
      </mj-section>
      {{/if}}

      <!-- Footer -->
      <mj-section background-color="{{branding.secondary_color}}" padding="20px">
        <mj-column>
          <mj-text color="#ffffff" align="center">
            {{branding.footer_text}}
          </mj-text>
          <mj-text color="#ffffff" font-size="12px" align="center">
            <a href="{{view_online_url}}" style="color: #ffffff;">View online</a> | 
            <a href="{{unsubscribe_url}}" style="color: #ffffff;">Unsubscribe</a>
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>',
  '{"variables": ["newsletter", "content", "community_name", "branding", "view_online_url", "unsubscribe_url"]}',
  true
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  template_content = EXCLUDED.template_content,
  default_settings = EXCLUDED.default_settings,
  updated_at = NOW();

-- Update existing templates to ensure they're marked as active
UPDATE newsletter_templates 
SET is_active = true 
WHERE name IN ('Welcome Email', 'Password Reset', 'Email Verification', 'Contact Form Auto-Reply', 'Newsletter Digest');