import { streamText } from 'ai';
import { getAIProvider, getAIConfig, createSystemPrompt, formatUserPrompt } from './provider';

// Simplified AI integration for BlockNote
export const callAI = async (prompt: string, selectedText?: string) => {
  const aiProvider = getAIProvider();
  const aiConfig = getAIConfig();
  
  if (!aiProvider || !aiConfig.isEnabled) {
    throw new Error('AI features are not configured');
  }
  
  try {
    const model = aiProvider.getModel();
    
    // Enhanced system prompt for better content generation
    const systemMessage = {
      role: 'system' as const,
      content: `You are an expert content writer helping to create and edit content in a block-based editor. 
        
        CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:
        
        1. LENGTH REQUIREMENTS:
        - Blog posts: Write 1000-1500 words with 8-12 paragraphs minimum
        - Articles: Write 800-1200 words with proper sections
        - Introductions: Write 2-3 full paragraphs (200-300 words)
        - Conclusions: Write 2-3 full paragraphs (200-300 words)
        - Executive summaries: Write 300-500 words minimum
        - How-to guides: Write detailed steps totaling 600-1000 words
        - Product descriptions: Write 300-500 words with features and benefits
        
        2. FORMATTING RULES:
        - Use markdown formatting for structure (# for headings, ** for bold, * for lists, etc.)
        - Separate each paragraph with TWO line breaks
        - Each paragraph should be 3-5 sentences
        - Use proper heading hierarchy (# Main Title, ## Sections, ### Subsections)
        - Use bullet points and numbered lists where appropriate
        - Make content ready to publish without editing
        
        3. QUALITY STANDARDS:
        - Write COMPLETE thoughts, not fragments
        - Be thorough and comprehensive
        - Include specific details and examples
        - Ensure professional quality output
        - Never write placeholder text like "[Add more here]"
        
        REMEMBER: Users expect full, complete content. A blog post should be multiple paragraphs, not just one or two sentences.`
    };
    
    const userMessage = {
      role: 'user' as const,
      content: selectedText 
        ? `${prompt}\n\nContent to work with:\n${selectedText}`
        : prompt
    };
    
    // Debug: Log the token count being used
    const maxTokens = aiConfig.maxTokens || 4000;
    console.log('AI Request - Max Tokens:', maxTokens, 'Temperature:', aiConfig.temperature);
    console.log('AI Request - Prompt:', prompt);
    
    const result = await streamText({
      model,
      messages: [systemMessage, userMessage],
      maxTokens: maxTokens, // Ensure we use a high token count
      temperature: aiConfig.temperature || 0.7,
    });
    
    // Wait for the complete response
    const fullResponse = await result.text;
    
    // Debug: Log response length
    console.log('AI Response - Length:', fullResponse.length, 'characters');
    console.log('AI Response - Word count:', fullResponse.split(/\s+/).length, 'words');
    
    // Ensure we have content
    if (!fullResponse || fullResponse.trim().length === 0) {
      throw new Error('No content generated');
    }
    
    return fullResponse;
  } catch (error) {
    console.error('AI call failed:', error);
    throw new Error('Failed to generate AI response. Please check your API configuration.');
  }
};

// Check if AI is properly configured
export const checkAIConfiguration = (): { isConfigured: boolean; provider: string | null } => {
  const provider = getAIProvider();
  const config = getAIConfig();
  
  if (!provider || !config.isEnabled) {
    return { isConfigured: false, provider: null };
  }
  
  return { 
    isConfigured: true, 
    provider: import.meta.env.VITE_AI_PROVIDER || 'openai' 
  };
};