import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useEffect } from 'react';
import { RichTextEditorProps, HeadingOption } from '@/shared/components/ui/RichTextEditor/types';
import { addCKEditorStyles } from '@/shared/components/ui/RichTextEditor/utils';

// Default toolbar configuration
const DEFAULT_TOOLBAR = [
  'heading', '|', 
  'bold', 'italic', 'link', '|', 
  'bulletedList', 'numberedList', '|', 
  'outdent', 'indent', '|', 
  'blockQuote', 'insertTable', '|', 
  'undo', 'redo'
];

// Default heading options
const DEFAULT_HEADING_OPTIONS: HeadingOption[] = [
  { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
  { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
  { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
  { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
];

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Enter content here...',
  height = '200px',
  disabled = false,
  label,
  required = false,
  id,
  // name is passed to the editor but not directly used
  className = ''
}: RichTextEditorProps) => {
  // Add the CKEditor styles when the component mounts
  useEffect(() => {
    addCKEditorStyles();
  }, []);

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div 
        className={`border border-slate-300 dark:border-slate-600 rounded-md 
                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500
                 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        style={{ height, display: 'flex', flexDirection: 'column' }}
      >
        <CKEditor
          // @ts-expect-error - ClassicEditor has a different type structure than expected by CKEditor component
          editor={ClassicEditor}
          data={value}
          config={{
            placeholder,
            toolbar: DEFAULT_TOOLBAR,
            heading: {
              options: DEFAULT_HEADING_OPTIONS
            }
          }}
          onReady={(editor) => {
            // You can customize the editor further here if needed
            if (id) {
              editor.editing.view.change(writer => {
                writer.setAttribute('id', id, editor.editing.view.document.getRoot()!);
              });
            }
          }}
          onChange={(_, editor) => {
            const data = editor.getData();
            onChange(data);
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
