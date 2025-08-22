import React, { useState } from 'react';
import { EventsTabProps } from '../../types';
import ContentCard from '../ContentCard';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton/SkeletonCard';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay/ErrorDisplay';

/**
 * Events Tab Component
 * Displays user's events with management capabilities
 */
const EventsTab: React.FC<EventsTabProps> = ({
  contentType,
  data,
  loading = false,
  error = null,
  onRefresh,
  onCreateEvent,
  onManageEvent,
  onRSVP,
  className = '',
}) => {
  const [activeSection, setActiveSection] = useState<'upcoming' | 'organized' | 'attending' | 'past'>('upcoming');

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load events"
        message={error}
        retry={onRefresh}
      />
    );
  }

  const statistics = data.statistics || {
    totalOrganized: 0,
    totalAttending: 0,
    upcomingCount: 0,
    pastCount: 0,
  };

  const getSectionData = () => {
    switch (activeSection) {
      case 'upcoming':
        return data.upcomingEvents || [];
      case 'organized':
        return data.organizedEvents || [];
      case 'attending':
        return data.attendingEvents || [];
      case 'past':
        return data.pastEvents || [];
      default:
        return [];
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'upcoming':
        return 'Upcoming Events';
      case 'organized':
        return 'Events You Organize';
      case 'attending':
        return 'Events You\'re Attending';
      case 'past':
        return 'Past Events';
      default:
        return 'Events';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'upcoming':
        return 'Events happening soon that you might be interested in';
      case 'organized':
        return 'Events you\'ve created and are managing';
      case 'attending':
        return 'Events you\'ve RSVP\'d to attend';
      case 'past':
        return 'Previously held events for reference';
      default:
        return '';
    }
  };

  const sectionData = getSectionData();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Upcoming Events</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.upcomingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">You're Organizing</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.totalOrganized}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">You're Attending</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.totalAttending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Past Events</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{statistics.pastCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Section Navigation */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {getSectionTitle()}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getSectionDescription()}
              </p>
            </div>
            {onCreateEvent && (
              <Button
                variant="default"
                size="sm"
                onClick={onCreateEvent}
                className="inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Event
              </Button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="px-6 py-4">
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {[
              { id: 'upcoming', label: 'Upcoming', count: statistics.upcomingCount },
              { id: 'organized', label: 'Organizing', count: statistics.totalOrganized },
              { id: 'attending', label: 'Attending', count: statistics.totalAttending },
              { id: 'past', label: 'Past', count: statistics.pastCount },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{section.label}</span>
                {section.count > 0 && (
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full ${
                    activeSection === section.id
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>
                    {section.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} hasImage={true} lines={3} />
          ))}
        </div>
      )}

      {/* Events List */}
      {!loading && sectionData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionData.map((event) => (
            <ContentCard
              key={event.id}
              item={event}
              type="event"
              size="md"
              layout="card"
              showActions={true}
              actions={[
                ...(activeSection === 'organized' && onManageEvent ? [{
                  id: 'manage',
                  label: 'Manage',
                  icon: 'settings',
                  variant: 'outline' as const,
                  onClick: () => onManageEvent(event.id),
                }] : []),
                ...(activeSection === 'upcoming' && onRSVP ? [{
                  id: 'rsvp',
                  label: 'RSVP',
                  icon: 'check',
                  variant: 'default' as const,
                  onClick: () => onRSVP(event.id, 'attending'),
                }] : []),
                {
                  id: 'view',
                  label: 'View Details',
                  icon: 'eye',
                  variant: 'outline' as const,
                  onClick: () => console.log('View event', event.id),
                },
              ]}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && sectionData.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                {activeSection === 'upcoming' && 'No Upcoming Events'}
                {activeSection === 'organized' && 'No Events Organized'}
                {activeSection === 'attending' && 'No Events You\'re Attending'}
                {activeSection === 'past' && 'No Past Events'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                {activeSection === 'upcoming' && 'There are no upcoming events at the moment. Check back later or create your own!'}
                {activeSection === 'organized' && 'You haven\'t organized any events yet. Create your first event to bring the community together.'}
                {activeSection === 'attending' && 'You haven\'t RSVP\'d to any events yet. Browse upcoming events to find something interesting.'}
                {activeSection === 'past' && 'No past events to display.'}
              </p>
              <div className="space-x-3">
                {onCreateEvent && activeSection !== 'past' && (
                  <Button onClick={onCreateEvent}>
                    {activeSection === 'organized' ? 'Create Your First Event' : 'Create Event'}
                  </Button>
                )}
                {activeSection === 'attending' && (
                  <Button variant="outline" onClick={() => setActiveSection('upcoming')}>
                    Browse Upcoming Events
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EventsTab;