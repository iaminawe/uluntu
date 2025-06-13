import { Member, FilterOptions } from '@/features/directory/components/DirectoryList/types';

// Filter members based on search term and selected skills
export const filterMembers = (
  members: Member[],
  filters: FilterOptions
): Member[] => {
  return members.filter(member => {
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatches = member.name.toLowerCase().includes(searchLower);
      const titleMatches = member.title.toLowerCase().includes(searchLower);
      const companyMatches = member.company.toLowerCase().includes(searchLower);
      const locationMatches = member.location.toLowerCase().includes(searchLower);
      
      if (!nameMatches && !titleMatches && !companyMatches && !locationMatches) {
        return false;
      }
    }
    
    // Filter by skills
    if (filters.skills.length > 0) {
      const hasMatchingSkill = filters.skills.some(skill => 
        member.skills.includes(skill)
      );
      
      if (!hasMatchingSkill) {
        return false;
      }
    }
    
    return true;
  });
};

// Extract all unique skills from member list
export const extractUniqueSkills = (members: Member[]): string[] => {
  return Array.from(
    new Set(members.flatMap(member => member.skills))
  ).sort();
};

// Get appropriate color for skill tags based on category (for visual variety)
export const getSkillColor = (skill: string): string => {
  // Map skills to color categories based on type
  const techSkills = ['React', 'Node.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Java', 'Python', 'Tailwind'];
  const designSkills = ['UI/UX', 'Figma', 'User Research', 'Design', 'Photoshop', 'Illustrator'];
  const dataSkills = ['Data Analysis', 'Machine Learning', 'SQL', 'PostgreSQL', 'MongoDB', 'Data Science'];
  
  if (techSkills.includes(skill)) {
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
  } else if (designSkills.includes(skill)) {
    return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
  } else if (dataSkills.includes(skill)) {
    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
  }
  
  // Default color
  return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
};
