import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { CoreMessage } from 'ai';

// AI Provider Configuration
export const getAIProvider = () => {
  const provider = import.meta.env.VITE_AI_PROVIDER || 'openai';
  
  if (provider === 'anthropic') {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('Anthropic API key not configured');
      return null;
    }
    
    const anthropic = createAnthropic({
      apiKey,
    });
    
    return {
      provider: anthropic,
      model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      getModel: () => anthropic(import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-haiku-20240307'),
    };
  }
  
  // Default to OpenAI
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OpenAI API key not configured');
    return null;
  }
  
  const openai = createOpenAI({
    apiKey,
  });
  
  return {
    provider: openai,
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
    getModel: () => openai(import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'),
  };
};

// AI Configuration
export const getAIConfig = () => ({
  maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '2000'),
  temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.7'),
  isEnabled: import.meta.env.ENABLE_AI_EDITOR !== 'false',
});

// Helper to create system prompts
export const createSystemPrompt = (context?: string): CoreMessage => ({
  role: 'system',
  content: `You are an AI assistant helping with content creation in a block-based editor. 
    ${context ? `Context: ${context}` : ''}
    Please provide helpful, accurate, and well-formatted content.
    Keep responses concise and relevant to the user's request.`,
});

// Helper to format user prompts
export const formatUserPrompt = (prompt: string, selectedText?: string): CoreMessage => ({
  role: 'user',
  content: selectedText 
    ? `${prompt}\n\nSelected text:\n${selectedText}`
    : prompt,
});