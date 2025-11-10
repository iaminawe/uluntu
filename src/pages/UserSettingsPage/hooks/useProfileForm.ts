import { useState } from 'react';
import { ProfileFormData } from '../types';

/**
 * Hook for managing profile form state
 */
export const useProfileForm = (initialData?: Partial<ProfileFormData>) => {
  const [displayName, setDisplayName] = useState(initialData?.displayName || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [employmentStatus, setEmploymentStatus] = useState(initialData?.employmentStatus || '');
  const [arrivedInNelson, setArrivedInNelson] = useState(initialData?.arrivedInNelson || '');
  const [interests, setInterests] = useState<string[]>(initialData?.interests || []);
  const [newInterest, setNewInterest] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
    }
  };

  const getFormData = (): ProfileFormData & { imageFile: File | null } => ({
    displayName,
    title,
    company,
    bio,
    location,
    imageUrl,
    skills,
    website,
    employmentStatus,
    arrivedInNelson,
    interests,
    imageFile
  });

  const setFormData = (data: Partial<ProfileFormData>) => {
    if (data.displayName !== undefined) setDisplayName(data.displayName);
    if (data.title !== undefined) setTitle(data.title);
    if (data.company !== undefined) setCompany(data.company);
    if (data.bio !== undefined) setBio(data.bio);
    if (data.location !== undefined) setLocation(data.location);
    if (data.imageUrl !== undefined) setImageUrl(data.imageUrl);
    if (data.skills !== undefined) setSkills(data.skills);
    if (data.website !== undefined) setWebsite(data.website);
    if (data.employmentStatus !== undefined) setEmploymentStatus(data.employmentStatus);
    if (data.arrivedInNelson !== undefined) setArrivedInNelson(data.arrivedInNelson);
    if (data.interests !== undefined) setInterests(data.interests);
  };

  return {
    // State
    displayName,
    title,
    company,
    bio,
    location,
    imageFile,
    imageUrl,
    skills,
    newSkill,
    website,
    employmentStatus,
    arrivedInNelson,
    interests,
    newInterest,
    // Setters
    setDisplayName,
    setTitle,
    setCompany,
    setBio,
    setLocation,
    setImageUrl,
    setSkills,
    setNewSkill,
    setWebsite,
    setEmploymentStatus,
    setArrivedInNelson,
    setInterests,
    setNewInterest,
    // Handlers
    handleAddSkill,
    handleRemoveSkill,
    handleAddInterest,
    handleRemoveInterest,
    handleImageChange,
    // Helpers
    getFormData,
    setFormData
  };
};
