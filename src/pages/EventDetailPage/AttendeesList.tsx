import { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useEventAttendees, useUpdateAttendeeStatus } from '../../hooks/useEventQueries';
import { useUserProfile } from '../../hooks/useProfileQueries';
import { format } from 'date-fns';

interface AttendeesListProps {
  eventId: string;
  isOrganizer: boolean;
}

interface Attendee {
  event_id: string;
  member_id: string;
  registered_at: string;
  status: string;
  members: {
    id: string;
    name: string;
    image?: string;
    title?: string;
    company?: string;
  };
}

const AttendeesList: React.FC<AttendeesListProps> = ({ eventId, isOrganizer }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: attendees = [], isLoading, error } = useEventAttendees(eventId);
  const { data: userProfile } = useUserProfile();
  const updateStatusMutation = useUpdateAttendeeStatus();

  const handleStatusUpdate = async (memberId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        eventId,
        memberId,
        status: newStatus
      });
    } catch (error) {
      console.error('Failed to update attendee status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Attendees</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-slate-600 dark:text-slate-400">Loading attendees...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Attendees</h3>
        </div>
        <p className="text-red-500 dark:text-red-400">Failed to load attendees</p>
      </div>
    );
  }

  const registeredAttendees = attendees.filter((a: Attendee) => a.status === 'registered');
  const attendeeCount = registeredAttendees.length;
  const displayLimit = 3;
  const showExpanded = isExpanded || attendeeCount <= displayLimit;
  const visibleAttendees = showExpanded ? registeredAttendees : registeredAttendees.slice(0, displayLimit);

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Attendees ({attendeeCount})
          </h3>
        </div>
        {attendeeCount > displayLimit && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
          >
            {isExpanded ? (
              <>
                <span className="text-sm mr-1">Show less</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="text-sm mr-1">Show all</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      {attendeeCount === 0 ? (
        <div className="text-center py-4">
          <Users className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-slate-400">No one has registered yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Be the first to join!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleAttendees.map((attendee: Attendee) => {
            const member = attendee.members;
            const isCurrentUser = userProfile?.id === member.id;
            
            return (
              <div
                key={attendee.member_id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-orange-600 dark:text-orange-400 font-medium text-sm">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {member.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </p>
                    </div>
                    {member.title && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {member.title}
                        {member.company && ` at ${member.company}`}
                      </p>
                    )}
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Registered {format(new Date(attendee.registered_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                {isOrganizer && !isCurrentUser && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(attendee.member_id, 'confirmed')}
                      disabled={updateStatusMutation.isPending}
                      className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      title="Confirm attendance"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(attendee.member_id, 'cancelled')}
                      disabled={updateStatusMutation.isPending}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      title="Cancel registration"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendeesList;