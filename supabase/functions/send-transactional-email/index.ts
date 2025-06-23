import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Starting send-transactional-email function')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  template_name: string;
  to: string | string[];
  template_data: Record<string, any>;
  options?: {
    subject?: string;
    from?: string;
    campaign_id?: string;
    user_id?: string;
  };
}

interface NewsletterTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'mjml' | 'react-email';
  template_content: string;
  default_settings?: Record<string, any>;
  is_active: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing transactional email request')

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable not set')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Parse and validate request body
    let emailRequest: EmailRequest
    try {
      emailRequest = await req.json()
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { template_name, to, template_data, options } = emailRequest

    // Validate required fields
    if (!template_name || !to || !template_data) {
      console.error('Missing required fields:', { template_name: !!template_name, to: !!to, template_data: !!template_data })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: template_name, to, template_data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Request validated, fetching template:', template_name)

    // Get template from database
    const { data: template, error: templateError } = await supabaseClient
      .from('newsletter_templates')
      .select('*')
      .eq('name', template_name)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      console.error('Template fetch error:', templateError)
      return new Response(
        JSON.stringify({ error: `Template '${template_name}' not found or inactive` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Template found, rendering email content')

    // Render template
    const { subject, html, text } = await renderTemplate(template, template_data)

    // Prepare email data
    const emailData = {
      from: options?.from || Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@kootenaytech.community',
      to: Array.isArray(to) ? to : [to],
      subject: options?.subject || subject,
      html,
      text,
      headers: {
        'X-Template-Name': template_name,
        'X-Campaign-ID': options?.campaign_id || '',
        'X-User-ID': options?.user_id || '',
        'X-Source': 'supabase-edge-function',
      },
      tags: [
        { name: 'source', value: 'transactional' },
        { name: 'template', value: template_name },
        ...(options?.campaign_id ? [{ name: 'campaign_id', value: options.campaign_id }] : []),
        ...(options?.user_id ? [{ name: 'user_id', value: options.user_id }] : []),
      ]
    }

    console.log('Sending email via Resend API to:', Array.isArray(to) ? to.length + ' recipients' : to)

    // Send email using Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    const resendResult = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendResult)
      throw new Error(`Resend API error: ${JSON.stringify(resendResult)}`)
    }

    console.log('Email sent successfully, message ID:', resendResult.id)

    // Log successful send to analytics if campaign_id provided
    if (options?.campaign_id && options?.user_id) {
      console.log('Logging analytics for campaign:', options.campaign_id)
      const { error: analyticsError } = await supabaseClient
        .from('newsletter_analytics')
        .insert({
          campaign_id: options.campaign_id,
          subscription_id: options.user_id,
          event_type: 'sent',
          event_data: {
            template_name,
            resend_id: resendResult.id,
            to: emailData.to,
          },
          postmark_message_id: resendResult.id,
        })
      
      if (analyticsError) {
        console.warn('Failed to log analytics:', analyticsError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: resendResult.id,
        template_used: template_name 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending transactional email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/**
 * Render template with data
 */
async function renderTemplate(
  template: NewsletterTemplate, 
  data: Record<string, any>
): Promise<{ subject: string; html: string; text: string }> {
  // Extract subject from template content or use template name
  let subject = template.name
  if (template.template_content.includes('<mj-title>')) {
    const titleMatch = template.template_content.match(/<mj-title>(.*?)<\/mj-title>/)
    if (titleMatch) {
      subject = titleMatch[1]
    }
  }

  // For MJML templates, we'd normally compile them here
  // For now, we'll use a simple template renderer
  let html = template.template_content
  
  // Simple variable substitution
  html = renderString(html, data)
  subject = renderString(subject, data)
  
  // Convert MJML to HTML (simplified - in production you'd use MJML compiler)
  if (template.type === 'mjml') {
    html = await convertMjmlToHtml(html)
  }

  // Generate text version
  const text = htmlToText(html)

  return { subject, html, text }
}

/**
 * Simple variable substitution
 */
function renderString(str: string, data: Record<string, any>): string {
  return str.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const value = getNestedValue(data, path)
    return value !== undefined ? String(value) : match
  })
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Convert MJML to HTML (simplified implementation)
 * In production, you'd use the official MJML compiler
 */
async function convertMjmlToHtml(mjml: string): Promise<string> {
  // This is a very basic conversion for demo purposes
  // In production, you should use the official MJML library
  let html = mjml
    .replace(/<mjml>/g, '<!DOCTYPE html><html>')
    .replace(/<\/mjml>/g, '</html>')
    .replace(/<mj-head>/g, '<head>')
    .replace(/<\/mj-head>/g, '</head>')
    .replace(/<mj-title>/g, '<title>')
    .replace(/<\/mj-title>/g, '</title>')
    .replace(/<mj-body([^>]*)>/g, '<body$1>')
    .replace(/<\/mj-body>/g, '</body>')
    .replace(/<mj-section([^>]*)>/g, '<div class="section"$1>')
    .replace(/<\/mj-section>/g, '</div>')
    .replace(/<mj-column([^>]*)>/g, '<div class="column"$1>')
    .replace(/<\/mj-column>/g, '</div>')
    .replace(/<mj-text([^>]*)>/g, '<div class="text"$1>')
    .replace(/<\/mj-text>/g, '</div>')
    .replace(/<mj-button([^>]*)>/g, '<a class="button"$1>')
    .replace(/<\/mj-button>/g, '</a>')
    .replace(/<mj-image([^>]*)>/g, '<img$1>')
    .replace(/<mj-attributes>.*?<\/mj-attributes>/gs, '')

  // Add basic CSS for email compatibility
  html = html.replace('<head>', `<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      .section { max-width: 600px; margin: 0 auto; padding: 20px; }
      .column { width: 100%; }
      .text { margin-bottom: 16px; }
      .button { 
        display: inline-block; 
        padding: 12px 24px; 
        background-color: #3B82F6; 
        color: white; 
        text-decoration: none; 
        border-radius: 6px; 
        margin: 10px 0;
      }
      img { max-width: 100%; height: auto; }
    </style>`)

  return html
}

/**
 * Convert HTML to plain text
 */
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}