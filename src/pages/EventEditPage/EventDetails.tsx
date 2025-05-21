import { Calendar, MapPin } from 'lucide-react';
import { EventDetailsProps } from './types';

const EventDetails: React.FC<EventDetailsProps> = ({ 
  formData, 
  handleChange, 
  errors 
}) => {
  return (
    <>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg 
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                    focus:ring-2 focus:ring-orange-500`}
          placeholder="Enter event title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Start Date & Time *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full pl-10 px-4 py-2 border ${errors.date ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg 
                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                        focus:ring-2 focus:ring-orange-500`}
            />
          </div>
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            End Date & Time
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full pl-10 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                        bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                        focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Location *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MapPin className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full pl-10 px-4 py-2 border ${errors.location ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg 
                      bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                      focus:ring-2 focus:ring-orange-500`}
            placeholder="Enter location or 'Online'"
          />
        </div>
        {errors.location && (
          <p className="mt-1 text-sm text-red-500">{errors.location}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Event Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                    focus:ring-2 focus:ring-orange-500"
        >
          <option value="in-person">In-Person</option>
          <option value="online">Online</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>
      
      {(formData.type === 'online' || formData.type === 'hybrid') && (
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Event URL {formData.type === 'online' && '*'}
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.url ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg 
                      bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                      focus:ring-2 focus:ring-orange-500`}
            placeholder="https://zoom.us/meeting/..."
          />
          {errors.url && (
            <p className="mt-1 text-sm text-red-500">{errors.url}</p>
          )}
        </div>
      )}
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Event Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-lg 
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
                    focus:ring-2 focus:ring-orange-500`}
          placeholder="Describe your event..."
        ></textarea>
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>
    </>
  );
};

export default EventDetails;
