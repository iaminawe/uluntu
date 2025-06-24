// Export all public APIs from the groups feature
// Selective exports to avoid conflicts
export { GroupCard, adaptMainGroupToLocalGroup } from './components';
export { useGroupsHybrid } from './hooks';
export { groupsApi, type GroupInput as ApiGroupInput } from './api';
export { groupsStore } from './store';
export { type Group, type GroupMember, type GroupInput } from './types';
