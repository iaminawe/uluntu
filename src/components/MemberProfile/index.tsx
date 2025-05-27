import { useState } from 'react';
import { Member } from './types';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';
import ContactModal from './ContactModal';
import EditProfileModal from './EditProfileModal';
import { useMember } from '../../hooks/useQueries';
import { useMemberContributions } from '../../hooks/useMemberContributions';
import { mapMemberToProfileMember } from '../../adapters/memberAdapter';

interface MemberProfileProps {
  memberId: string;
}

const MemberProfile = ({ memberId }: MemberProfileProps) => {
  // Use memberId as string directly without parsing to number
  const { data: member, isLoading: isMemberLoading, error: memberError } = useMember(memberId);
  const { data: contributions, isLoading: isContributionsLoading } = useMemberContributions(memberId);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleProfileUpdate = (data: Partial<Member>) => {
    // In a real app, this would make an API call to update the member
    console.log('Profile updated:', data);
    // Optionally invalidate queries to refetch data
    // queryClient.invalidateQueries(['members', parseInt(memberId)]);
  };

  // Loading state
  if (isMemberLoading || isContributionsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (memberError || !member) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Error Loading Profile</h2>
          <p className="text-red-600 dark:text-red-300 mt-2">
            {memberError instanceof Error ? memberError.message : "Member not found"}
          </p>
        </div>
      </div>
    );
  }
  
  // Convert the mock data Member to the ProfileMember type
  const profileMember = mapMemberToProfileMember(member);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProfileHeader 
        member={profileMember}
        onContactClick={() => setShowContactModal(true)}
        onEditClick={() => setShowEditModal(true)}
      />
      
      <ProfileContent 
        member={profileMember} 
        contributions={contributions}
      />
      
      {showContactModal && (
        <ContactModal
          member={profileMember}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          member={profileMember}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default MemberProfile;
