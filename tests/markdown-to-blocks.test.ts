import { markdownToBlocks } from '../src/lib/ai/markdown-to-blocks';

// Test markdown-to-blocks conversion
const testMarkdown = `# Main Heading

This is a paragraph with some text.

## Section Heading

Here's another paragraph with more content.

- Bullet point 1
- Bullet point 2
- Bullet point 3

### Subsection

1. Numbered item 1
2. Numbered item 2

> This is a blockquote

\`\`\`javascript
const code = "example";
console.log(code);
\`\`\`

Final paragraph.`;

console.log('Testing markdown-to-blocks conversion...\n');
const blocks = markdownToBlocks(testMarkdown);
console.log('Generated blocks:', JSON.stringify(blocks, null, 2));

// Verify block types
const blockTypes = blocks.map(b => b.type);
console.log('\nBlock types found:', blockTypes);

// Check for expected block types
const expectedTypes = ['heading', 'paragraph', 'bulletListItem', 'numberedListItem', 'codeBlock'];
const hasAllTypes = expectedTypes.every(type => blockTypes.includes(type));
console.log('\nHas all expected block types:', hasAllTypes);

console.log('\n✅ Markdown-to-blocks conversion test complete');