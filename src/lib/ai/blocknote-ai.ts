import { 
  createAIExtension, 
  AIMenuItemProps,
  PromptBuilder,
  CustomAIMenuItem,
} from '@blocknote/xl-ai';
import { BlockNoteEditor } from '@blocknote/core';
import { CoreMessage } from 'ai';
import { getAIConfig, isAIEnabled, createSystemPrompt, formatUserPrompt } from './provider';
import { postAIMessages } from './aiClient';

// Custom AI Commands for content creation
export const customAICommands: CustomAIMenuItem[] = [
  {
    id: 'improve',
    text: '✨ Improve Writing',
    aliases: ['improve', 'enhance', 'polish'],
    prompt: 'Improve the writing quality, grammar, and clarity of this text while maintaining its original meaning and tone.',
    operations: ['update'],
  },
  {
    id: 'shorten',
    text: '📝 Make Shorter',
    aliases: ['shorten', 'summarize', 'condense'],
    prompt: 'Make this text more concise while preserving all key information.',
    operations: ['update'],
  },
  {
    id: 'expand',
    text: '📖 Make Longer',
    aliases: ['expand', 'elaborate', 'detail'],
    prompt: 'Expand this text with more details, examples, and explanations while maintaining the original context.',
    operations: ['update'],
  },
  {
    id: 'professional',
    text: '👔 Make Professional',
    aliases: ['professional', 'formal', 'business'],
    prompt: 'Rewrite this text in a professional, formal tone suitable for business communication.',
    operations: ['update'],
  },
  {
    id: 'casual',
    text: '😊 Make Casual',
    aliases: ['casual', 'friendly', 'informal'],
    prompt: 'Rewrite this text in a casual, friendly tone while keeping the main message.',
    operations: ['update'],
  },
  {
    id: 'bullet-points',
    text: '• Convert to Bullets',
    aliases: ['bullets', 'list', 'points'],
    prompt: 'Convert this text into clear, concise bullet points.',
    operations: ['update'],
  },
  {
    id: 'fix-grammar',
    text: '✅ Fix Grammar & Spelling',
    aliases: ['fix', 'correct', 'grammar'],
    prompt: 'Fix all grammar, spelling, and punctuation errors in this text.',
    operations: ['update'],
  },
  {
    id: 'translate',
    text: '🌍 Translate',
    aliases: ['translate', 'language'],
    prompt: 'Translate this text to: ',
    requiresInput: true,
    operations: ['update'],
  },
  {
    id: 'explain',
    text: '💡 Explain Simply',
    aliases: ['explain', 'simplify', 'eli5'],
    prompt: 'Explain this concept in simple terms that anyone can understand.',
    operations: ['update'],
  },
  {
    id: 'continue',
    text: '➡️ Continue Writing',
    aliases: ['continue', 'complete', 'finish'],
    prompt: 'Continue writing from where this text ends, maintaining the same style and context.',
    operations: ['add'],
  },
  {
    id: 'outline',
    text: '📋 Create Outline',
    aliases: ['outline', 'structure', 'plan'],
    prompt: 'Create a structured outline based on this topic or text.',
    operations: ['add'],
  },
  {
    id: 'ideas',
    text: '💭 Generate Ideas',
    aliases: ['ideas', 'brainstorm', 'suggest'],
    prompt: 'Generate creative ideas and suggestions related to this topic.',
    operations: ['add'],
  },
  {
    id: 'seo',
    text: '🔍 SEO Optimize',
    aliases: ['seo', 'search', 'optimize'],
    prompt: 'Optimize this text for search engines while maintaining readability. Include relevant keywords naturally.',
    operations: ['update'],
  },
  {
    id: 'technical',
    text: '⚙️ Make Technical',
    aliases: ['technical', 'detailed', 'specific'],
    prompt: 'Add technical details and specifications to make this content more comprehensive for a technical audience.',
    operations: ['update'],
  },
  {
    id: 'action-items',
    text: '✓ Extract Action Items',
    aliases: ['actions', 'tasks', 'todos'],
    prompt: 'Extract and list all action items and tasks from this text.',
    operations: ['add'],
  },
];

// Custom prompt builder for better AI responses
export const customPromptBuilder: PromptBuilder = (editor: BlockNoteEditor, details) => {
  const { prompt, selectedBlocks } = details;
  
  // Get selected text or block content
  let content = '';
  if (selectedBlocks && selectedBlocks.length > 0) {
    content = selectedBlocks
      .map((block: any) => {
        // Handle different block types
        if (block.content && Array.isArray(block.content)) {
          return block.content.map((c: any) => c.text || '').join('');
        }
        if (block.content && typeof block.content === 'string') {
          return block.content;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  
  const messages: CoreMessage[] = [
    createSystemPrompt('You are helping to edit content in a block-based editor. Format your responses as clean, well-structured content.'),
    formatUserPrompt(prompt, content),
  ];
  
  return messages;
};

// Create the AI Extension
export const createBlockNoteAI = () => {
  const aiConfig = getAIConfig();

  if (!aiConfig.isEnabled) {
    console.warn('AI features are disabled or not configured');
    return null;
  }

  return createAIExtension({
    // LLM configuration — routed through the server-side /api/ai proxy so no
    // provider key is ever present in the client bundle.
    callLLM: async (messages: CoreMessage[]) => {
      try {
        const res = await postAIMessages(messages, {
          maxTokens: aiConfig.maxTokens,
          temperature: aiConfig.temperature,
        });
        // The proxy streams plain text; hand the stream to the AI extension.
        return res.body;
      } catch (error) {
        console.error('AI call failed:', error);
        throw new Error('Failed to generate AI response. Please check your API configuration.');
      }
    },
    
    // Custom prompt builder
    promptBuilder: customPromptBuilder,
    
    // Custom menu items
    menuItems: customAICommands as any,
    
    // Data format (HTML works best with most models)
    dataFormat: 'html',
    
    // Enable streaming for better UX
    streaming: true,
  });
};

// Helper to check if AI is available (server owns actual key availability)
export const isAIAvailable = (): boolean => isAIEnabled();