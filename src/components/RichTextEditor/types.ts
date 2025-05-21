// Types for RichTextEditor component

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
