import { Member, FilterOptions } from './types';

// Filter members based on search term and selected skills
export const filterMembers = (
  members: Member[],
  filterOptions: FilterOptions,
  companyId?: number
): Member[] => {
  return members.filter(member => {
    // Filter by company if companyId is provided
    if (companyId && member.company && !member.company.includes(`${companyId}`)) {
      return false;
    }
    
    // Filter by search term (name, title, company)
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      const nameMatches = member.name.toLowerCase().includes(searchLower);
      const titleMatches = member.title.toLowerCase().includes(searchLower);
      const companyMatches = member.company ? member.company.toLowerCase().includes(searchLower) : false;
      const locationMatches = member.location ? member.location.toLowerCase().includes(searchLower) : false;
      
      if (!nameMatches && !titleMatches && !companyMatches && !locationMatches) {
        return false;
      }
    }
    
    // Filter by skills
    if (filterOptions.skills && filterOptions.skills.length > 0) {
      if (!member.skills || member.skills.length === 0) {
        return false;
      }
      
      // Check if member has any of the selected skills
      const hasSelectedSkill = filterOptions.skills.some(skill => 
        member.skills!.includes(skill)
      );
      
      if (!hasSelectedSkill) {
        return false;
      }
    }
    
    return true;
  });
};

// Sort members by name
export const sortMembersByName = (members: Member[]): Member[] => {
  return [...members].sort((a, b) => a.name.localeCompare(b.name));
};

// Sort members by most recent join date
export const sortMembersByJoinDate = (members: Member[]): Member[] => {
  return [...members].sort(
    (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
  );
};

// Get a formatted date string from a date string
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
