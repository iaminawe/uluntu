import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminEventsPage: React.FC = () => {
  const columns = [
    {
      key: 'title',
      label: 'Event Title',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            {value}
          </div>
          {item.event_type && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {item.event_type}
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'start_date',
      label: 'Date & Time',
      render: (value: string, item: any) => (
        <div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-gray-500" />
            {new Date(value).toLocaleDateString()}
          </div>
          {item.start_time && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {item.start_time}
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: string, item: any) => (
        <div>
          {value && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-gray-500" />
              {value}
            </div>
          )}
          {item.is_virtual && (
            <div className="text-sm text-blue-600">Virtual Event</div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'max_attendees',
      label: 'Capacity',
      render: (value: number, item: any) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-500" />
          {item.current_attendees || 0} / {value || 'Unlimited'}
        </div>
      ),
      sortable: true
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (value: boolean, item: any) => {
        const now = new Date();
        const eventDate = new Date(item.start_date);
        const isPast = eventDate < now;
        
        if (isPast) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <Clock className="w-3 h-3 mr-1" />
              Past
            </span>
          );
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {value ? (
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
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  return (
    <EntityTable
      entityType="events"
      entityName="Events"
      columns={columns}
      searchFields={['title', 'description', 'location', 'event_type']}
      detailPath="/events/:id"
      editPath="/events/:id/edit"
      createPath="/events/create"
    />
  );
};

export default AdminEventsPage;