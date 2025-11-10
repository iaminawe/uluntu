/**
 * Type definitions for SimpleUnifiedUsersPage
 */

export interface AdminUser {
  user_id: string;
  email: string;
  name?: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  member_profile?: {
    id: string;
    location?: string;
    title?: string;
    company?: string;
    bio?: string;
    status?: string;
    featured?: boolean;
  };
}

export interface DeleteOptions {
  deleteContent: boolean;
  reassignTo: string;
  makeAnonymous: boolean;
}

export interface UserFormData {
  email: string;
  name: string;
  location: string;
  title: string;
  company: string;
  bio: string;
  status: string;
  featured: boolean;
}
