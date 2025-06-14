import { renderHook } from '@testing-library/react';
import { useProfileCompletion, getFieldDisplayName, shouldShowOnboarding } from '../useProfileCompletion';
import { Member } from '../../types';

describe('useProfileCompletion', () => {
  const createMockMember = (overrides: Partial<Member> = {}): Member => ({
    id: '1',
    name: '', // Empty name for testing
    title: '',
    image: '/placeholder-avatar.png',
    bio: '',
    intro: '',
    skills: [],
    joinDate: '2025-01-01',
    status: 'draft',
    ...overrides,
  });

  describe('profile completion calculation', () => {
    it('should calculate 0% completion for empty profile', () => {
      const member = createMockMember();
      const { result } = renderHook(() => useProfileCompletion(member));

      expect(result.current.isComplete).toBe(false);
      expect(result.current.completionPercentage).toBe(0);
      expect(result.current.requiredFields).toEqual(['name', 'bio', 'image']);
      expect(result.current.suggestedFields).toEqual(['title', 'location', 'intro', 'skills']);
    });

    it('should calculate partial completion', () => {
      const member = createMockMember({
        name: 'John Doe',
        bio: 'Software developer',
        image: 'profile.jpg',
        title: 'Developer',
      });
      
      const { result } = renderHook(() => useProfileCompletion(member));

      expect(result.current.isComplete).toBe(true); // All required fields filled
      expect(result.current.completionPercentage).toBeGreaterThan(50);
      expect(result.current.requiredFields).toEqual([]);
    });

    it('should handle null member', () => {
      const { result } = renderHook(() => useProfileCompletion(null));

      expect(result.current.isComplete).toBe(false);
      expect(result.current.completionPercentage).toBe(0);
      expect(result.current.missingFields.length).toBeGreaterThan(0);
    });

    it('should detect placeholder images as incomplete', () => {
      const member = createMockMember({
        name: 'John Doe',
        bio: 'Developer',
        image: '/placeholder-avatar.png', // Should be considered incomplete
      });
      
      const { result } = renderHook(() => useProfileCompletion(member));

      expect(result.current.requiredFields).toContain('image');
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('getFieldDisplayName', () => {
    it('should return user-friendly field names', () => {
      expect(getFieldDisplayName('name')).toBe('Full Name');
      expect(getFieldDisplayName('bio')).toBe('Bio/About');
      expect(getFieldDisplayName('image')).toBe('Profile Photo');
      expect(getFieldDisplayName('title')).toBe('Job Title');
    });

    it('should return original field name for unknown fields', () => {
      expect(getFieldDisplayName('unknown_field')).toBe('unknown_field');
    });
  });

  describe('shouldShowOnboarding', () => {
    it('should show onboarding for null member', () => {
      expect(shouldShowOnboarding(null)).toBe(true);
    });

    it('should show onboarding for incomplete profile', () => {
      const member = createMockMember(); // Empty profile
      expect(shouldShowOnboarding(member)).toBe(true);
    });

    it('should not show onboarding for complete profile', () => {
      const member = createMockMember({
        name: 'John Doe',
        bio: 'Experienced developer',
        image: 'profile.jpg',
        title: 'Senior Developer',
        location: 'Nelson, BC',
        intro: 'Hello!',
        skills: ['JavaScript', 'React'],
      });
      expect(shouldShowOnboarding(member)).toBe(false);
    });
  });
});