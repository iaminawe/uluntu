// Convert markdown text to BlockNote blocks
export function markdownToBlocks(markdown: string, images?: Array<{ url: string; caption: string; placement: string }>): any[] {
  const blocks: any[] = [];
  const lines = markdown.split('\n');
  let currentParagraph = '';
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';
  let inList = false;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      blocks.push({
        type: 'paragraph',
        content: currentParagraph.trim()
      });
      currentParagraph = '';
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      listItems.forEach(item => {
        blocks.push({
          type: 'bulletListItem',
          content: item
        });
      });
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push({
          type: 'codeBlock',
          props: { language: codeLanguage || 'text' },
          content: codeContent.trim()
        });
        codeContent = '';
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        // Start code block
        flushParagraph();
        flushList();
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        props: { level: 1 },
        content: line.slice(2).trim()
      });
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        props: { level: 2 },
        content: line.slice(3).trim()
      });
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        props: { level: 3 },
        content: line.slice(4).trim()
      });
      continue;
    }

    // Lists
    if (line.match(/^[\*\-\+]\s+/) || line.match(/^\d+\.\s+/)) {
      flushParagraph();
      
      const isNumbered = line.match(/^\d+\.\s+/);
      const content = line.replace(/^[\*\-\+]\s+/, '').replace(/^\d+\.\s+/, '');
      
      if (!inList) {
        inList = true;
      }
      
      blocks.push({
        type: isNumbered ? 'numberedListItem' : 'bulletListItem',
        content: processInlineMarkdown(content)
      });
      continue;
    } else if (inList && line.trim() === '') {
      // End of list
      inList = false;
      continue;
    } else if (inList && !line.match(/^\s/)) {
      // End of list if next line doesn't start with space
      inList = false;
    }

    // Blockquotes
    if (line.startsWith('>')) {
      flushParagraph();
      flushList();
      const quoteContent = line.slice(1).trim();
      // Collect multi-line quotes
      let fullQuote = quoteContent;
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) {
        i++;
        fullQuote += ' ' + lines[i].slice(1).trim();
      }
      blocks.push({
        type: 'paragraph',
        props: { backgroundColor: 'gray' },
        content: processInlineMarkdown(fullQuote)
      });
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/) || line.match(/^___+$/)) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'paragraph',
        content: '---'
      });
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      flushParagraph();
      continue;
    }

    // Regular paragraph
    currentParagraph += (currentParagraph ? ' ' : '') + processInlineMarkdown(line);
  }

  // Flush any remaining content
  flushParagraph();
  flushList();

  // Insert images at appropriate positions if provided
  if (images && images.length > 0) {
    const finalBlocks: any[] = [];
    let imageIndex = 0;
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Add hero image after first heading or at the beginning
      if (imageIndex === 0 && images[imageIndex]?.placement === 'hero') {
        if (block.type === 'heading' && block.props?.level === 1) {
          finalBlocks.push(block);
          finalBlocks.push(createImageBlock(images[imageIndex]));
          imageIndex++;
        } else if (i === 0) {
          finalBlocks.push(createImageBlock(images[imageIndex]));
          imageIndex++;
          finalBlocks.push(block);
        } else {
          finalBlocks.push(block);
        }
      }
      // Add section images after h2 headings
      else if (
        imageIndex < images.length && 
        images[imageIndex]?.placement === 'section' &&
        block.type === 'heading' && 
        block.props?.level === 2
      ) {
        finalBlocks.push(block);
        finalBlocks.push(createImageBlock(images[imageIndex]));
        imageIndex++;
      }
      // Add conclusion image before last few blocks
      else if (
        imageIndex < images.length &&
        images[imageIndex]?.placement === 'conclusion' &&
        i === blocks.length - 3
      ) {
        finalBlocks.push(createImageBlock(images[imageIndex]));
        imageIndex++;
        finalBlocks.push(block);
      }
      else {
        finalBlocks.push(block);
      }
    }
    
    // Add any remaining images at the end
    while (imageIndex < images.length) {
      finalBlocks.push(createImageBlock(images[imageIndex]));
      imageIndex++;
    }
    
    return finalBlocks.length > 0 ? finalBlocks : [{ type: 'paragraph', content: markdown }];
  }

  return blocks.length > 0 ? blocks : [{ type: 'paragraph', content: markdown }];
}

// Create an image block for BlockNote
function createImageBlock(imageData: { url: string; caption: string; placement: string }): any {
  return {
    type: 'image',
    props: {
      url: imageData.url,
      caption: imageData.caption,
      width: 'auto',
      previewWidth: 1200
    }
  };
}

// Process inline markdown (bold, italic, code, links)
function processInlineMarkdown(text: string): string {
  // For now, strip markdown formatting
  // In a full implementation, you'd convert to BlockNote inline content format
  
  // Remove bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  
  // Remove italic
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // Convert links to text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  return text;
}