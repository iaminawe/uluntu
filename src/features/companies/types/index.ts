// Export company types
export interface Company {
  id: string;
  name: string;
  description: string;
  logo: string;
  slug?: string; // URL-friendly identifier
  website?: string | null;
  location: string;
  founded: string;
  size: string;
  industry: string[];
  status?: string; // Make optional to match global type
  featured?: boolean | null;
  cover_image?: string | null;
  created_at?: string | null;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    discord?: string;
    twitch?: string;
    steam?: string;
    medium?: string;
    behance?: string;
    dribbble?: string;
    vimeo?: string;
    producthunt?: string;
    [key: string]: string | undefined; // Allow additional social platforms
  } | null;
}

export interface CompanyMember {
  company_id: string;
  member_id: string;
  role?: string | null;
  joined_date?: string | null;
}

export interface CompanyEmployee {
  company_id: string;
  member_id: string;
  role?: string | null;
  joined_date?: string | null;
  member?: {
    id: string;
    name?: string;
    full_name?: string;
    bio?: string;
    location?: string;
    image?: string;
    avatar_url?: string;
  };
}