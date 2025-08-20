import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMemberByUserId } from '@/features/directory/hooks/useMemberByUserId';
import LoadingState from '../DirectoryDetailPage/LoadingState';
import ErrorState from '../DirectoryDetailPage/ErrorState';

export default function CurrentUserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { member, isLoading, error } = useMemberByUserId(user?.id);

  useEffect(() => {
    // If member is loaded and has a slug, redirect to their profile page
    if (member?.slug) {
      navigate(`/directory/${member.slug}`, { replace: true });
    }
  }, [member, navigate]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !member) {
    return <ErrorState />;
  }

  // This should not render as we redirect above, but just in case
  return <LoadingState />;
}