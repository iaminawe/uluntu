import { Member, FilterOptions } from '@/features/directory/components/DirectoryList/types';

// Filter members based on search term and selected skills
export const filterMembers = (members: Member[], filters: FilterOptions): Member[] => {
  return members.filter(member => {
    // Filter by search term
    if (filters.search && !matchesSearch(member, filters.search)) {
      return false;
    }
    
    // Filter by skills
    if (filters.skills.length > 0 && !hasAnySkill(member.skills || [], filters.skills)) {
      return false;
    }
    
    return true;
  });
};

// Extract all unique skills from members
export const extractUniqueSkills = (members: Member[]): string[] => {
  const skillsSet = new Set<string>();
  
  members.forEach(member => {
    member.skills?.forEach(skill => {
      skillsSet.add(skill);
    });
  });
  
  return Array.from(skillsSet).sort();
};

// Get a color class for a skill based on its name
export const getSkillColor = (skill: string): string => {
  // Generate a consistent color based on the skill name
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
  ];
  
  // Use a hash function to get a consistent index
  const index = Math.abs(hashString(skill)) % colors.length;
  return colors[index];
};

// Helper function to check if member matches search term
const matchesSearch = (member: Member, search: string): boolean => {
  const searchLower = search.toLowerCase();
  return (
    member.name.toLowerCase().includes(searchLower) ||
    member.title.toLowerCase().includes(searchLower) ||
    (member.company?.toLowerCase().includes(searchLower) ?? false) ||
    (member.location?.toLowerCase().includes(searchLower) ?? false) ||
    (member.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ?? false)
  );
};

// Helper function to check if member has any of the selected skills
const hasAnySkill = (memberSkills: string[], selectedSkills: string[]): boolean => {
  return selectedSkills.some(skill => memberSkills.includes(skill));
};

// Simple string hash function
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};
