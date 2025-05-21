import { useState } from 'react';
import { Member, SAMPLE_MEMBER } from './types';
import ProfileHeader from './ProfileHeader';
import ProfileContent from './ProfileContent';
import ContactModal from './ContactModal';
import EditProfileModal from './EditProfileModal';

interface MemberProfileProps {
  memberId: string;
}

const MemberProfile = ({ memberId }: MemberProfileProps) => {
  const [member, setMember] = useState<Member>(SAMPLE_MEMBER); // In a real app, fetch by ID
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleProfileUpdate = (data: Partial<Member>) => {
    setMember(prev => ({ ...prev, ...data }));
    console.log('Profile updated:', data);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProfileHeader 
        member={member}
        onContactClick={() => setShowContactModal(true)}
        onEditClick={() => setShowEditModal(true)}
      />
      
      <ProfileContent member={member} />
      
      {showContactModal && (
        <ContactModal
          member={member}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          member={member}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default MemberProfile;
