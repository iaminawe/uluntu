import { useState } from 'react';
// Main type not needed since we're using the local Group type
import { SAMPLE_GROUP, Group } from '@/features/groups/components/GroupDetails/types';
import GroupHeader from '@/features/groups/components/GroupDetails/GroupHeader';
import GroupContent from '@/features/groups/components/GroupDetails/GroupContent';

interface GroupDetailsProps {
  groupId: string;
}

const GroupDetails = ({ groupId: _groupId }: GroupDetailsProps) => {
  // Use the local Group type instead of the main Group type
  // Prefix variables with underscore to indicate they are intentionally unused
  const [group, _setGroup] = useState<Group>(SAMPLE_GROUP); // In a real app, fetch by ID and adapt

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <GroupHeader group={group} />
      <GroupContent group={group} />
    </div>
  );
};

export default GroupDetails;
