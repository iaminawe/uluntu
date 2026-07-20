import type { CoreMessage } from 'ai';
import { getAIConfig, getAIProviderName, isAIEnabled } from './provider';
import { streamAIText } from './aiClient';

// Simplified AI integration for BlockNote.
// Keys stay server-side: this calls the /api/ai proxy via streamAIText().
export const callAI = async (prompt: string, selectedText?: string) => {
  const aiConfig = getAIConfig();
  if (!aiConfig.isEnabled) {
    throw new Error('AI features are not configured');
  }

  // Enhanced system prompt for better content generation
  const systemMessage: CoreMessage = {
    role: 'system',
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

        REMEMBER: Users expect full, complete content. A blog post should be multiple paragraphs, not just one or two sentences.`,
  };

  const userMessage: CoreMessage = {
    role: 'user',
    content: selectedText
      ? `${prompt}\n\nContent to work with:\n${selectedText}`
      : prompt,
  };

  try {
    const fullResponse = await streamAIText([systemMessage, userMessage], {
      maxTokens: aiConfig.maxTokens || 4000,
      temperature: aiConfig.temperature || 0.7,
    });

    if (!fullResponse || fullResponse.trim().length === 0) {
      throw new Error('No content generated');
    }
    return fullResponse;
  } catch (error) {
    console.error('AI call failed:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to generate AI response.');
  }
};

// Check if AI is enabled (server owns the actual key/provider availability).
export const checkAIConfiguration = (): { isConfigured: boolean; provider: string | null } => {
  if (!isAIEnabled()) {
    return { isConfigured: false, provider: null };
  }
  return { isConfigured: true, provider: getAIProviderName() };
};
