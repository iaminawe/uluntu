// Types for JoinModal component
import { Group } from '../../types';

export interface JoinModalProps {
  group: Group;
  onClose: () => void;
}

export interface JoinRequestFormProps {
  group: Group;
  onSubmit: (message: string) => void;
  onCancel: () => void;
  joining?: boolean;
}

export interface SuccessMessageProps {
  group: Group;
  isOpenGroup: boolean;
}
