import { useState } from 'react';
import { Group, SAMPLE_GROUP } from './types';
import GroupHeader from './GroupHeader';
import GroupContent from './GroupContent';

interface GroupDetailsProps {
  groupId: string;
}

const GroupDetails = ({ groupId: _groupId }: GroupDetailsProps) => {
  const [group, _setGroup] = useState<Group>(SAMPLE_GROUP); // In a real app, fetch by ID

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <GroupHeader group={group} />
      <GroupContent group={group} />
    </div>
  );
};

export default GroupDetails;
