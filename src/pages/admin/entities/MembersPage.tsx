import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { CheckCircle, XCircle, User } from 'lucide-react';

const AdminMembersPage: React.FC = () => {
  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            {item.name}
          </div>
          <div className="text-sm text-gray-500">
            {item.user_id ? 'Registered User' : 'Profile Only'}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true
    },
    {
      key: 'title',
      label: 'Job Title',
      sortable: true
    },
    {
      key: 'company',
      label: 'Company',
      render: (value: string) => value || '-',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'published' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === 'published' ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Published
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              {value || 'Draft'}
            </>
          )}
        </span>
      ),
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  return (
    <EntityTable
      entityType="members"
      entityName="Members"
      columns={columns}
      searchFields={['name', 'title', 'location', 'company']}
      detailPath="/directory/:id"
      editPath="/directory/:id/edit"
      createPath="/directory/create"
    />
  );
};

export default AdminMembersPage;