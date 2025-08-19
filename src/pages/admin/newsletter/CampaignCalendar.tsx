import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  Send,
  Eye,
  Filter,
  List,
  Grid,
  Download,
  Mail,
  Users,
  BarChart3
} from 'lucide-react';
import { newsletterCampaignApi } from '@/features/newsletter/api/campaigns';
import { NewsletterCampaign } from '@/types/newsletter';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'campaign' | 'recurring' | 'draft';
  status: 'scheduled' | 'sent' | 'draft' | 'sending';
  scheduledAt: Date;
  estimatedRecipients: number;
  color: string;
}

const CampaignCalendar: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock calendar events data
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Weekly Tech Digest',
      type: 'campaign',
      status: 'scheduled',
      scheduledAt: new Date(2024, 7, 20, 10, 0),
      estimatedRecipients: 1240,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Event Announcement: TechMeetup',
      type: 'campaign',
      status: 'scheduled',
      scheduledAt: new Date(2024, 7, 22, 14, 0),
      estimatedRecipients: 890,
      color: 'bg-green-500'
    },
    {
      id: '3',
      title: 'Job Opportunities Newsletter',
      type: 'campaign',
      status: 'draft',
      scheduledAt: new Date(2024, 7, 25, 9, 0),
      estimatedRecipients: 2100,
      color: 'bg-purple-500'
    },
    {
      id: '4',
      title: 'Monthly Community Update',
      type: 'recurring',
      status: 'scheduled',
      scheduledAt: new Date(2024, 7, 28, 11, 0),
      estimatedRecipients: 1560,
      color: 'bg-orange-500'
    }
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => {
      const eventDate = event.scheduledAt;
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const EventCard = ({ event }: { event: CalendarEvent }) => (
    <div 
      className={`${event.color} text-white text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={() => {
        setSelectedEvent(event);
        setShowEventModal(true);
      }}
    >
      <div className="truncate font-medium">{event.title}</div>
      <div className="text-xs opacity-90">
        {event.scheduledAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );

  const MonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <div 
          key={day} 
          className={`h-32 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-blue-50 border-blue-300' : ''
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-20">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {/* Header row */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 bg-gray-100 border-b border-gray-200 text-center font-medium text-gray-700">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const WeekView = () => {
    const weekDates = getWeekDates(currentDate);
    
    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {/* Header row */}
        {weekDates.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div key={index} className="p-3 bg-gray-100 border-b border-gray-200 text-center">
              <div className="text-sm text-gray-600">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
        
        {/* Event rows */}
        {weekDates.map((date, index) => {
          const events = getEventsForDate(date);
          return (
            <div key={index} className="h-96 border-r border-gray-200 p-2 overflow-y-auto">
              {events.map(event => (
                <div key={event.id} className="mb-2">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const ListView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipients
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockEvents
              .filter(event => filterStatus === 'all' || event.status === filterStatus)
              .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
              .map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${event.color} mr-3`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500 capitalize">{event.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'sent' ? 'bg-green-100 text-green-800' :
                      event.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {event.scheduledAt.toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.scheduledAt.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      {event.estimatedRecipients.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-gray-400 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-green-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      {event.status === 'scheduled' && (
                        <button className="text-gray-400 hover:text-orange-600">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Campaign Calendar</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Schedule and manage your newsletter campaigns
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <Link
            to="/admin/newsletter/campaigns/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Campaign</span>
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                {viewMode === 'week' 
                  ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : getMonthName(currentDate)
                }
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Filter */}
            {viewMode === 'list' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="sending">Sending</option>
              </select>
            )}

            {/* View Toggle */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('month')}
                className={`p-2 rounded-l-lg ${viewMode === 'month' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`p-2 ${viewMode === 'week' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {viewMode === 'month' && <MonthView />}
        {viewMode === 'week' && <WeekView />}
        {viewMode === 'list' && <ListView />}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Campaign Details</h3>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${selectedEvent.color}`}></div>
                  <h4 className="font-medium text-gray-900">{selectedEvent.title}</h4>
                </div>
                <p className="text-sm text-gray-600 capitalize">{selectedEvent.type} campaign</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedEvent.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.status === 'sent' ? 'bg-green-100 text-green-800' :
                    selectedEvent.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Recipients</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <Users className="w-4 h-4 mr-1" />
                    {selectedEvent.estimatedRecipients.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Scheduled Time</label>
                <div className="flex items-center text-sm text-gray-900">
                  <Clock className="w-4 h-4 mr-2" />
                  {selectedEvent.scheduledAt.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })} at {selectedEvent.scheduledAt.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Scheduled This Month</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {mockEvents.filter(e => e.status === 'scheduled').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Sent This Month</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {mockEvents.filter(e => e.status === 'sent').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Recipients</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {mockEvents.reduce((sum, e) => sum + e.estimatedRecipients, 0).toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg. Open Rate</dt>
                <dd className="text-lg font-medium text-gray-900">24.3%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCalendar;