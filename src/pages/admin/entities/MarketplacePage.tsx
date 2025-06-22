import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { ShoppingBag, Tag, DollarSign, User, CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AdminMarketplacePage: React.FC = () => {
  // Custom query to join with members table for seller names
  const customQuery = async ({ searchTerm, currentPage, pageSize, sortBy }: { searchTerm: string; currentPage: number; pageSize: number; sortBy: { column: string; direction: 'asc' | 'desc' } }) => {
    let query = supabase
      .from('marketplace_listings')
      .select(`
        *,
        seller_name:members(name)
      `, { count: 'exact' });

    // Apply search
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
    }

    // Apply sorting (avoid sorting by seller_name since it's a joined field)
    if (sortBy.column === 'seller_name') {
      // Sort by seller_id instead if trying to sort by seller_name
      query = query.order('seller_id', { ascending: sortBy.direction === 'asc' });
    } else {
      query = query.order(sortBy.column, { ascending: sortBy.direction === 'asc' });
    }

    // Apply pagination
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    // Transform the data to flatten seller_name
    const transformedData = (data || []).map(item => ({
      ...item,
      seller_name: item.seller_name?.name || 'Unknown'
    }));

    return { items: transformedData, total: count || 0 };
  };

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
              {item.description.substring(0, 60)}...
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => {
        const typeConfig = {
          product: { text: 'Product', color: 'bg-green-100 text-green-800' },
          service: { text: 'Service', color: 'bg-blue-100 text-blue-800' },
          other: { text: 'Other', color: 'bg-purple-100 text-purple-800' }
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
      key: 'price',
      label: 'Price',
      render: (value: number) => (
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
          {value === 0 ? 'Free' : value ? `$${value.toFixed(2)}` : 'N/A'}
        </div>
      ),
      sortable: true
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (value: string) => value ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {value}
        </span>
      ) : 'N/A',
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
      key: 'location',
      label: 'Location',
      render: (value: string) => value || 'Not specified',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const isActive = value === 'published';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Published
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Draft
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
      entityType="marketplace_listings"
      entityName="Marketplace Listings"
      columns={columns}
      searchFields={['title', 'description', 'type', 'location']}
      detailPath="/marketplace/:id"
      editPath="/marketplace/:id/edit"
      createPath="/marketplace/create"
      customQuery={customQuery}
    />
  );
};

export default AdminMarketplacePage;