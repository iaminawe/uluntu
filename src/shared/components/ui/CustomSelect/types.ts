// Types for CustomSelect component

export interface Option {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}
