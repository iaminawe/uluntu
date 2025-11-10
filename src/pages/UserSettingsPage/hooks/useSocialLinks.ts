import { useState } from 'react';
import { SocialLinks } from '../types';

/**
 * Hook for managing social media links
 */
export const useSocialLinks = (initialData?: Partial<SocialLinks>) => {
  const [website, setWebsite] = useState(initialData?.website || '');
  const [linkedin, setLinkedin] = useState(initialData?.linkedin || '');
  const [twitter, setTwitter] = useState(initialData?.twitter || '');
  const [github, setGithub] = useState(initialData?.github || '');

  const getFormData = (): SocialLinks => ({
    website,
    linkedin,
    twitter,
    github
  });

  const setFormData = (data: Partial<SocialLinks>) => {
    if (data.website !== undefined) setWebsite(data.website);
    if (data.linkedin !== undefined) setLinkedin(data.linkedin);
    if (data.twitter !== undefined) setTwitter(data.twitter);
    if (data.github !== undefined) setGithub(data.github);
  };

  return {
    website,
    linkedin,
    twitter,
    github,
    setWebsite,
    setLinkedin,
    setTwitter,
    setGithub,
    getFormData,
    setFormData
  };
};
