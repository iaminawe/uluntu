import { filterMembers, extractUniqueSkills, getSkillColor } from '@/features/directory/components/DirectoryList/utils';
import { Member, FilterOptions } from '@/features/directory/components/DirectoryList/types';

describe('DirectoryList Utils', () => {
  const testMembers: Member[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Full Stack Developer',
      company: 'Mountain Tech Solutions',
      location: 'Nelson, BC',
      skills: ['React', 'Node.js', 'TypeScript'],
      image: 'https://example.com/image1.jpg',
      joinDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'UX Designer',
      company: 'Design Forward',
      location: 'Rossland, BC',
      skills: ['UI/UX', 'Figma', 'User Research'],
      image: 'https://example.com/image2.jpg',
      joinDate: '2023-02-20'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      title: 'Data Scientist',
      company: 'Data Insights Co',
      location: 'Cranbrook, BC',
      skills: ['Python', 'Machine Learning', 'Data Analysis'],
      image: 'https://example.com/image3.jpg',
      joinDate: '2023-03-10'
    }
  ];

  describe('filterMembers', () => {
    test('DU-001: returns all members when no filters are applied', () => {
      const filters: FilterOptions = { search: '', skills: [] };
      const result = filterMembers(testMembers, filters);
      expect(result).toEqual(testMembers);
      expect(result.length).toBe(3);
    });

    test('DU-002: filters members by search term in name', () => {
      const filters: FilterOptions = { search: 'sarah', skills: [] };
      const result = filterMembers(testMembers, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    test('DU-003: filters members by search term in title', () => {
      const filters: FilterOptions = { search: 'designer', skills: [] };
      const result = filterMembers(testMembers, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('2');
    });

    test('DU-004: filters members by search term in company', () => {
      const filters: FilterOptions = { search: 'mountain', skills: [] };
      const result = filterMembers(testMembers, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    test('DU-005: filters members by search term in location', () => {
      const filters: FilterOptions = { search: 'cranbrook', skills: [] };
      const result = filterMembers(testMembers, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('3');
    });

    test('DU-006: filters members by search term in skills', () => {
      const filters: FilterOptions = { search: 'python', skills: [] };
      const result = filterMembers(testMembers, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('3');
    });

    test('DU-007: filters members by selected skills', () => {
      const filters: FilterOptions = { search: '', skills: ['React'] };
      const result = filterMembers(testMembers, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    test('DU-008: filters members by both search term and skills', () => {
      const filters: FilterOptions = { search: 'developer', skills: ['React'] };
      const result = filterMembers(testMembers, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    test('DU-009: returns empty array when no members match filters', () => {
      const filters: FilterOptions = { search: 'nonexistent', skills: [] };
      const result = filterMembers(testMembers, filters);
      expect(result.length).toBe(0);
    });

    test('DU-010: handles case insensitive search', () => {
      const filters: FilterOptions = { search: 'DATA SCIENTIST', skills: [] };
      const result = filterMembers(testMembers, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('extractUniqueSkills', () => {
    test('DU-011: extracts all unique skills from members', () => {
      const skills = extractUniqueSkills(testMembers);
      const expectedSkills = [
        'Data Analysis',
        'Figma',
        'Machine Learning',
        'Node.js',
        'Python',
        'React',
        'TypeScript',
        'UI/UX',
        'User Research'
      ];
      expect(skills).toEqual(expectedSkills);
      expect(skills.length).toBe(9); // No duplicates
    });

    test('DU-012: returns empty array when no members have skills', () => {
      const membersWithoutSkills = [
        { ...testMembers[0], skills: undefined },
        { ...testMembers[1], skills: undefined },
        { ...testMembers[2], skills: undefined }
      ];
      const skills = extractUniqueSkills(membersWithoutSkills);
      expect(skills).toEqual([]);
    });

    test('DU-013: handles empty members array', () => {
      const skills = extractUniqueSkills([]);
      expect(skills).toEqual([]);
    });

    test('DU-014: returns skills in alphabetical order', () => {
      const members: Member[] = [
        {
          id: '1',
          name: 'Test User',
          title: 'Developer',
          skills: ['Z', 'A', 'M'],
          image: 'https://example.com/image.jpg',
          joinDate: '2023-01-01'
        }
      ];
      const skills = extractUniqueSkills(members);
      expect(skills).toEqual(['A', 'M', 'Z']);
    });
  });

  describe('getSkillColor', () => {
    test('DU-015: returns consistent color for the same skill', () => {
      const color1 = getSkillColor('React');
      const color2 = getSkillColor('React');
      expect(color1).toBe(color2);
    });

    test('DU-016: returns different colors for different skills', () => {
      const reactColor = getSkillColor('React');
      const pythonColor = getSkillColor('Python');
      
      // This test might occasionally fail if the hash function happens to map
      // two different skills to the same color index, but it's unlikely
      expect(reactColor).not.toBe(pythonColor);
    });

    test('DU-017: returns a valid color class string', () => {
      const color = getSkillColor('JavaScript');
      expect(color).toMatch(/bg-[a-z]+-\d+\s+text-[a-z]+-\d+/);
    });
  });
});
