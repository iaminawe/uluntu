// Export company types
export interface Company {
  id: string;
  name: string;
  description: string;
  logo: string;
  website?: string | null;
  location: string;
  founded: string;
  size: string;
  industry: string[];
  status?: string; // Make optional to match global type
  featured?: boolean | null;
  cover_image?: string | null;
  created_at?: string | null;
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