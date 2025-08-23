import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { callAI, checkAIConfiguration } from '@/lib/ai/blocknote-ai-simplified';
import { unsplashService } from '@/lib/ai/unsplash-service';

export default function WorkingAIEditor() {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);
  
  const aiConfig = checkAIConfiguration();
  const unsplashConfigured = unsplashService.isConfigured();

  const generateBlogPost = async () => {
    const topic = prompt('Enter a topic for your blog post:');
    if (!topic) return;

    setIsProcessing(true);
    try {
      // Generate content
      const prompt = `Write a comprehensive, engaging blog post of 1000-1500 words (8-12 paragraphs) with introduction, main body sections, and conclusion about: ${topic}`;
      const result = await callAI(prompt, '');
      
      let finalContent = result;
      
      // Add images if configured
      if (includeImages && unsplashConfigured) {
        console.log('Fetching images for:', topic);
        const photos = await unsplashService.findRelevantPhotos(
          result.substring(0, 500),
          topic,
          3
        );
        
        if (photos.length > 0) {
          // Add hero image after title
          const lines = result.split('\n');
          const processedLines = [];
          let addedHero = false;
          
          for (let i = 0; i < lines.length; i++) {
            processedLines.push(lines[i]);
            
            // Add hero image after first heading
            if (!addedHero && lines[i].startsWith('#') && photos[0]) {
              processedLines.push('');
              processedLines.push(`![${photos[0].photo.alt_description || topic}](${unsplashService.getOptimalImageUrl(photos[0].photo)})`);
              processedLines.push(`*${unsplashService.formatAttribution(photos[0].photo)}*`);
              processedLines.push('');
              addedHero = true;
            }
            
            // Add section images
            if (i > lines.length / 2 && photos[1] && !processedLines.some(l => l.includes(photos[1].photo.urls.regular))) {
              processedLines.push('');
              processedLines.push(`![${photos[1].photo.alt_description || 'Section image'}](${unsplashService.getOptimalImageUrl(photos[1].photo)})`);
              processedLines.push(`*${unsplashService.formatAttribution(photos[1].photo)}*`);
              processedLines.push('');
            }
          }
          
          finalContent = processedLines.join('\n');
        }
      }
      
      setContent(finalContent);
    } catch (error) {
      console.error('Failed to generate content:', error);
      alert('Failed to generate content. Please check your API configuration.');
    } finally {
      setIsProcessing(false);
    }
  };

  const improveSelected = async () => {
    const selection = window.getSelection()?.toString();
    if (!selection) {
      alert('Please select some text first');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await callAI('Improve the writing quality, grammar, and clarity', selection);
      // Replace selected text with improved version
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + result + content.substring(end);
        setContent(newContent);
      }
    } catch (error) {
      console.error('Failed to improve text:', error);
      alert('Failed to improve text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Working AI Editor</h1>
        
        {/* Status */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              {aiConfig.isConfigured ? (
                <span className="text-green-600">✨ AI Ready ({aiConfig.provider})</span>
              ) : (
                <span className="text-red-600">⚠️ Configure API keys in .env.local</span>
              )}
              {unsplashConfigured && (
                <span className="ml-4 text-blue-600">📷 Images Available</span>
              )}
            </div>
            {unsplashConfigured && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="mr-2"
                />
                Include Images
              </label>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={generateBlogPost}
              disabled={isProcessing || !aiConfig.isConfigured}
              variant="primary"
            >
              📄 Generate Blog Post
            </Button>
            <Button
              onClick={improveSelected}
              disabled={isProcessing || !aiConfig.isConfigured}
              variant="secondary"
            >
              ✨ Improve Selected
            </Button>
            <Button
              onClick={() => {
                const topic = prompt('Enter topic for introduction:');
                if (topic) {
                  setIsProcessing(true);
                  callAI(`Write an engaging introduction of 200-300 words (2-3 substantial paragraphs) that hooks the reader for an article about: ${topic}`, '')
                    .then(result => setContent(content + '\n\n' + result))
                    .finally(() => setIsProcessing(false));
                }
              }}
              disabled={isProcessing || !aiConfig.isConfigured}
              variant="secondary"
            >
              🎯 Add Introduction
            </Button>
            <Button
              onClick={() => {
                const topic = prompt('Enter topic for conclusion:');
                if (topic) {
                  setIsProcessing(true);
                  callAI(`Write a compelling conclusion of 200-300 words (2-3 substantial paragraphs) that summarizes key points and provides a call to action for: ${topic}`, '')
                    .then(result => setContent(content + '\n\n' + result))
                    .finally(() => setIsProcessing(false));
                }
              }}
              disabled={isProcessing || !aiConfig.isConfigured}
              variant="secondary"
            >
              🏁 Add Conclusion
            </Button>
          </div>
          {isProcessing && (
            <div className="mt-2 text-sm text-gray-600">⏳ AI is processing...</div>
          )}
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow p-6">
          <textarea
            className="w-full p-4 border rounded-lg font-mono text-sm"
            rows={30}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing or use AI commands to generate content..."
            disabled={isProcessing}
          />
          <div className="mt-4 text-sm text-gray-600">
            <p>Word count: {content.split(/\s+/).filter(w => w).length} | Character count: {content.length}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">How to Use</h2>
          <ul className="space-y-2 text-sm">
            <li>• Click "Generate Blog Post" to create a full 1000-1500 word article with images</li>
            <li>• Select any text and click "Improve Selected" to enhance it</li>
            <li>• Use "Add Introduction" or "Add Conclusion" to add specific sections</li>
            <li>• Toggle "Include Images" to control whether Unsplash images are added</li>
            <li>• Images are automatically placed at optimal positions in your content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}