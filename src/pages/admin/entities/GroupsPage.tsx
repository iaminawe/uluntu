import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { Users, Lock, Globe, Crown, CheckCircle, XCircle } from 'lucide-react';

const AdminGroupsPage: React.FC = () => {
  const columns = [
    {
      key: 'name',
      label: 'Group Name',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            {value}
          </div>
          {item.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {item.description}
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true
    },
    {
      key: 'privacy_level',
      label: 'Privacy',
      render: (value: string) => {
        const privacyConfig = {
          public: { icon: Globe, text: 'Public', color: 'bg-green-100 text-green-800' },
          private: { icon: Lock, text: 'Private', color: 'bg-red-100 text-red-800' },
          invite_only: { icon: Crown, text: 'Invite Only', color: 'bg-purple-100 text-purple-800' }
        };
        const config = privacyConfig[value as keyof typeof privacyConfig] || privacyConfig.public;
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.text}
          </span>
        );
      },
      sortable: true
    },
    {
      key: 'member_count',
      label: 'Members',
      render: (value: number) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-500" />
          {value || 0}
        </div>
      ),
      sortable: true
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </span>
      ),
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  return (
    <EntityTable
      entityType="groups"
      entityName="Groups"
      columns={columns}
      searchFields={['name', 'description', 'category']}
      detailPath="/groups/:id"
      editPath="/groups/:id/edit"
      createPath="/groups/create"
    />
  );
};

export default AdminGroupsPage;