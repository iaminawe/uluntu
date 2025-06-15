import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { Building, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';

const AdminCompaniesPage: React.FC = () => {
  const columns = [
    {
      key: 'name',
      label: 'Company Name',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <Building className="w-4 h-4 mr-2 text-gray-500" />
            {value}
          </div>
          {item.website && (
            <div className="text-sm text-blue-600 hover:text-blue-800">
              <a href={item.website} target="_blank" rel="noopener noreferrer">
                {item.website}
              </a>
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'industry',
      label: 'Industry',
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: string) => (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-gray-500" />
          {value}
        </div>
      ),
      sortable: true
    },
    {
      key: 'size',
      label: 'Company Size',
      render: (value: string) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-500" />
          {value}
        </div>
      ),
      sortable: true
    },
    {
      key: 'is_verified',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Pending
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
      entityType="companies"
      entityName="Companies"
      columns={columns}
      searchFields={['name', 'industry', 'location', 'description']}
      detailPath="/companies/:id"
      editPath="/companies/:id/edit"
      createPath="/companies/create"
    />
  );
};

export default AdminCompaniesPage;