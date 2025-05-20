'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import slugify from 'slugify';
import { Building, Users, Calendar, X, Image as ImageIcon, Calendar as CalendarIcon, Link as LinkIcon, Eye, Save, Archive } from 'lucide-react';

interface Association {
  type: 'company' | 'group' | 'event' | 'member';
  id: number;
  name: string;
}

type ArticleStatus = 'draft' | 'published' | 'archived';

export default function CreateNewsPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [editor, setEditor] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    heroImage: '',
    heroImageAlt: '',
    publishDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'draft' as ArticleStatus,
    tags: '',
    associations: [] as Association[]
  });
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
    const loadEditor = async () => {
      const CKEditor = (await import('@ckeditor/ckeditor5-react')).CKEditor;
      const ClassicEditor = await import('@ckeditor/ckeditor5-build-classic');
      setEditor({ CKEditor, ClassicEditor: ClassicEditor.default });
    };
    loadEditor();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would submit the data to your backend
    console.log('Form submitted:', formData);
    router.push('/news');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      // Auto-generate slug from title
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: slugify(value, { lower: true, strict: true })
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditorChange = (_event: any, editor: any) => {
    const data = editor.getData();
    setFormData(prev => ({ ...prev, content: data }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreviewImage(imageUrl);
        setFormData(prev => ({ ...prev, heroImage: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Create News Article</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          {/* Hero Image Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Hero Image
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 transition-colors hover:border-orange-500 dark:hover:border-orange-400">
              {previewImage ? (
                <div className="relative w-full">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage('');
                      setFormData(prev => ({ ...prev, heroImage: '' }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="mt-4 flex text-sm text-slate-600 dark:text-slate-400">
                    <label htmlFor="hero-image" className="relative cursor-pointer rounded-md font-medium text-orange-500 hover:text-orange-400">
                      <span>Upload a file</span>
                      <input
                        id="hero-image"
                        name="heroImage"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
            <input
              type="text"
              name="heroImageAlt"
              value={formData.heroImageAlt}
              onChange={handleChange}
              placeholder="Image alt text"
              className="mt-2 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Title and URL Section */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <div className="mt-2 flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                /news/{formData.slug}
              </span>
            </div>
          </div>

          {/* Excerpt Section */}
          <div className="mb-6">
            <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Content Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Content
            </label>
            <div 
              className="prose max-w-none border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden"
              style={{ height: '500px' }}
            >
              {isClient && editor && (
                <editor.CKEditor
                  editor={editor.ClassicEditor}
                  data={formData.content}
                  onChange={handleEditorChange}
                  config={{
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'link',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'blockQuote',
                      'insertTable',
                      '|',
                      'undo',
                      'redo'
                    ],
                    height: '500px'
                  }}
                />
              )}
            </div>
            <style jsx global>{`
              .ck-editor__editable_inline {
                min-height: 500px !important;
                max-height: 500px !important;
              }
              .ck.ck-editor__main > .ck-editor__editable {
                height: 500px !important;
              }
            `}</style>
          </div>

          {/* Publication Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Publication Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Publish Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="publishDate"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., Technology, Community, Events"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {formData.status === 'draft' && (
              <button
                type="submit"
                className="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </button>
            )}
            {formData.status === 'published' && (
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </button>
            )}
            {formData.status === 'archived' && (
              <button
                type="submit"
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}