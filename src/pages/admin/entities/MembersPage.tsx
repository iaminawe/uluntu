import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminMembersPage: React.FC = () => {
  const columns = [
    {
      key: 'first_name',
      label: 'Name',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium">{`${item.first_name} ${item.last_name}`}</div>
          <div className="text-sm text-gray-500">{item.email}</div>
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
      key: 'job_title',
      label: 'Job Title',
      sortable: true
    },
    {
      key: 'company_name',
      label: 'Company',
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
      searchFields={['first_name', 'last_name', 'email', 'location', 'job_title']}
      detailPath="/directory/:id"
      editPath="/directory/:id/edit"
      createPath="/directory/create"
    />
  );
};

export default AdminMembersPage;