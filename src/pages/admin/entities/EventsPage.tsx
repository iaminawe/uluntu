import React from 'react';
import EntityTable from '@/components/admin/EntityTable';
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock, Lock } from 'lucide-react';
import { useEnabledFeatures } from '@/hooks/useSettings';

const AdminEventsPage: React.FC = () => {
  // Check if events feature is enabled
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const eventsEnabled = isFeatureEnabled('events_system');

  // Show loading while checking features
  if (featuresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show disabled message if feature is not enabled
  if (!eventsEnabled) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start">
            <Lock className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Events Feature Disabled
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                The events system feature is currently disabled. Enable it in System Management → Features to access events management.
              </p>
              <a
                href="/admin/system/features"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700 transition-colors"
              >
                Go to Feature Management
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
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
      detailPath="/events/:slug"
      editPath="/events/:slug/edit"
      createPath="/events/create"
    />
  );
};

export default AdminEventsPage;