import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { ShoppingBag, Tag, DollarSign, User, CheckCircle, XCircle, Eye } from 'lucide-react';

const AdminMarketplacePage: React.FC = () => {
  const columns = [
    {
      key: 'title',
      label: 'Listing Title',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2 text-gray-500" />
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
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Tag className="w-3 h-3 mr-1" />
          {value}
        </span>
      ),
      sortable: true
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: number, item: any) => (
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
          {value === 0 ? 'Free' : value ? `$${value.toFixed(2)}` : 'N/A'}
          {item.is_negotiable && (
            <span className="ml-1 text-xs text-blue-600">(Negotiable)</span>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'listing_type',
      label: 'Type',
      render: (value: string) => {
        const typeConfig = {
          sell: { text: 'For Sale', color: 'bg-green-100 text-green-800' },
          buy: { text: 'Wanted', color: 'bg-blue-100 text-blue-800' },
          service: { text: 'Service', color: 'bg-purple-100 text-purple-800' },
          trade: { text: 'Trade', color: 'bg-orange-100 text-orange-800' }
        };
        const config = typeConfig[value as keyof typeof typeConfig] || { text: value, color: 'bg-gray-100 text-gray-800' };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.text}
          </span>
        );
      },
      sortable: true
    },
    {
      key: 'seller_name',
      label: 'Seller',
      render: (value: string) => (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-1 text-gray-500" />
          {value}
        </div>
      ),
      sortable: true
    },
    {
      key: 'view_count',
      label: 'Views',
      render: (value: number) => (
        <div className="flex items-center">
          <Eye className="w-4 h-4 mr-1 text-gray-500" />
          {value || 0}
        </div>
      ),
      sortable: true
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value: boolean, item: any) => {
        if (item.is_sold) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Sold
            </span>
          );
        }
        
        return (
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
        );
      },
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Listed',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  return (
    <EntityTable
      entityType="marketplace"
      entityName="Marketplace Listings"
      columns={columns}
      searchFields={['title', 'description', 'category', 'seller_name']}
      detailPath="/marketplace/:id"
      editPath="/marketplace/:id/edit"
      createPath="/marketplace/create"
    />
  );
};

export default AdminMarketplacePage;