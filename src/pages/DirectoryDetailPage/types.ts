// Types for DirectoryDetailPage components

export interface Member {
  id: number;
  name: string;
  title: string;
  company?: string;
  location?: string;
  image: string;
  bio?: string;
  skills?: string[];
  joinDate: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export interface ProfileHeaderProps {
  id: string;
  member: Member;
}

export interface ProfileInfoProps {
  member: Member;
}

export interface ContactSidebarProps {
  member: Member;
}

export interface LoadingStateProps {
  // Can include any customization props in the future
}

export interface ErrorStateProps {
  // Can include props like errorMessage in the future
}
