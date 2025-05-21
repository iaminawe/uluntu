// Types for JoinModal component
import { Group } from '../../data/mock/mockData';

export interface JoinModalProps {
  group: Group;
  onClose: () => void;
}

export interface JoinRequestFormProps {
  group: Group;
  onSubmit: (message: string) => void;
  onCancel: () => void;
}

export interface SuccessMessageProps {
  group: Group;
  isOpenGroup: boolean;
}
