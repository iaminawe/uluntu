import { useEffect } from 'react';
import { useGroupsRedux } from '../../hooks/useGroupsRedux';

export default function TestGroups() {
  const { groups, loadGroups, isLoading, isError, error } = useGroupsRedux();
  
  // Load groups on component mount
  useEffect(() => {
    console.log('Loading groups...');
    loadGroups();
  }, [loadGroups]);
  
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Groups Test Component</h2>
      
      <div className="mb-4">
        <p><strong>Status:</strong> {isLoading ? 'Loading...' : isError ? 'Error' : 'Ready'}</p>
        {isError && <p className="text-red-500"><strong>Error:</strong> {error}</p>}
        <p><strong>Group Count:</strong> {groups.length}</p>
      </div>
      
      {groups.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">Groups List:</h3>
          <ul className="list-disc pl-5">
            {groups.map(group => (
              <li key={group.id} className="mb-1">
                {group.name} ({group.visibility})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No groups found.</p>
      )}
    </div>
  );
}
