/**
 * Type definitions for Form components
 */
import { ReactNode } from 'react';
export type { FormInputProps } from './FormInput';
export type { FormTextareaProps } from './FormTextarea';
export type { FormSelectProps } from './FormSelect';
export type { FormCheckboxProps } from './FormCheckbox';
export type { FormRadioCardGroupProps, RadioOption } from './FormRadioCardGroup';
export type { FormImageUploadProps } from './FormImageUpload';
export type { FormDatePickerProps } from './FormDatePicker';

export interface FormHeaderProps {
  /**
   * Title of the form/page
   */
  title: string;
  /**
   * Subtitle or description (optional)
   */
  subtitle?: string;
  /**
   * URL to navigate back to
   */
  backUrl: string;
  /**
   * Text for the back link (default: "Back")
   */
  backText?: string;
  /**
   * Additional actions to display in the header
   */
  actions?: ReactNode;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}

export interface FormSectionProps {
  /**
   * Title of the section
   */
  title?: string;
  /**
   * Description of the section
   */
  description?: string;
  /**
   * Whether the section has a lighter background
   */
  highlighted?: boolean;
  /**
   * Content of the section
   */
  children: ReactNode;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}

export interface FormActionsProps {
  /**
   * Handler for form submission
   */
  onSubmit?: () => void;
  /**
   * Handler for form cancellation
   */
  onCancel?: () => void;
  /**
   * Handler for form deletion
   */
  onDelete?: () => void;
  /**
   * Text for the submit button
   */
  submitText?: string;
  /**
   * Text for the cancel button
   */
  cancelText?: string;
  /**
   * Text for the delete button
   */
  deleteText?: string;
  /**
   * Whether the form is currently submitting
   */
  isSubmitting?: boolean;
  /**
   * Whether the form is for a new entity (hides delete button)
   */
  isNew?: boolean;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
  /**
   * Alignment of the action buttons
   */
  align?: 'left' | 'center' | 'right' | 'between';
}

// FormImageUploadProps is now imported from './FormImageUpload'

export interface TagsInputProps {
  /**
   * Current tags
   */
  tags: string[];
  /**
   * Handler for tag changes
   */
  onChange: (tags: string[]) => void;
  /**
   * Label for the component
   */
  label?: string;
  /**
   * Helper text to display
   */
  helperText?: string;
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  /**
   * Whether the component is required
   */
  required?: boolean;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  /**
   * Maximum number of tags allowed
   */
  maxTags?: number;
  /**
   * CSS class name(s) to apply to the component
   */
  className?: string;
}
