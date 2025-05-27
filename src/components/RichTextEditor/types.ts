// Types for RichTextEditor component

// Define the heading option types for CKEditor
export type HeadingModelType = `heading${string}` | 'paragraph';

export interface HeadingParagraphOption {
  model: 'paragraph';
  title: string;
  class: string;
}

export interface HeadingCustomElementOption {
  model: `heading${string}`;
  view: string;
  title: string;
  class: string;
}

export type HeadingOption = HeadingParagraphOption | HeadingCustomElementOption;

export interface RichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  height?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
}
