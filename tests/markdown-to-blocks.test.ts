import { describe, test, expect } from '@jest/globals';
import { markdownToBlocks } from '@/lib/ai/markdown-to-blocks';

describe('markdownToBlocks', () => {
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

  test('should convert markdown to blocks correctly', () => {
    const blocks = markdownToBlocks(testMarkdown);
    
    expect(blocks).toBeDefined();
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBeGreaterThan(0);
  });

  test('should contain expected block types', () => {
    const blocks = markdownToBlocks(testMarkdown);
    const blockTypes = blocks.map(b => b.type);
    
    const expectedTypes = ['heading', 'paragraph', 'bulletListItem', 'numberedListItem', 'codeBlock'];
    const hasAllTypes = expectedTypes.every(type => blockTypes.includes(type));
    
    expect(hasAllTypes).toBe(true);
  });

  test('should handle heading levels correctly', () => {
    const blocks = markdownToBlocks(testMarkdown);
    const headings = blocks.filter(b => b.type === 'heading');
    
    expect(headings).toHaveLength(3);
    expect(headings[0].props?.level).toBe(1);
    expect(headings[1].props?.level).toBe(2);
    expect(headings[2].props?.level).toBe(3);
  });

  test('should handle empty input gracefully', () => {
    const blocks = markdownToBlocks('');
    
    expect(blocks).toBeDefined();
    expect(Array.isArray(blocks)).toBe(true);
  });

  test('should handle code blocks correctly', () => {
    const blocks = markdownToBlocks(testMarkdown);
    const codeBlocks = blocks.filter(b => b.type === 'codeBlock');
    
    expect(codeBlocks).toHaveLength(1);
    expect(codeBlocks[0].props?.language).toBe('javascript');
    expect(codeBlocks[0].content).toContain('const code = "example";');
  });
});