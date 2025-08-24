import { useState } from 'react';
import { EventDetailsProps } from './types';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormDatePicker
} from '@/shared/components/ui/Form';
import { EnhancedContentAIEditor } from '@/components/content/EnhancedContentAIEditor';
import { Button } from '@/components/ui/Button';

const EventDetails: React.FC<EventDetailsProps> = ({ 
  formData, 
  handleChange, 
  errors: _errors 
}) => {
  const [useAIEditor, setUseAIEditor] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);

  const handleDescriptionChange = (value: string) => {
    // Create a synthetic event to maintain compatibility with existing handleChange
    const syntheticEvent = {
      target: {
        name: 'description',
        value: value
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleChange(syntheticEvent);
  };
  return (
    <>
      <FormInput
        id="title"
        name="title"
        label="Event Title"
        required
        value={formData.title}
        onChange={handleChange}
        error={_errors.title}
        placeholder="Enter event title"
      />
      
      <FormInput
        id="slug"
        name="slug"
        label="URL Slug"
        required
        value={formData.slug}
        onChange={handleChange}
        error={_errors.slug}
        placeholder="event-url-slug"
        helperText={`This will be used in the URL: /events/${formData.slug || 'your-slug'}`}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormDatePicker
          id="date"
          name="date"
          label="Start Date & Time"
          required
          dateType="datetime-local"
          value={formData.date}
          onChange={handleChange}
          error={_errors.date}
          containerClassName="flex-1"
        />
        
        <FormDatePicker
          id="endDate"
          name="endDate"
          label="End Date & Time"
          dateType="datetime-local"
          value={formData.endDate}
          onChange={handleChange}
          containerClassName="flex-1"
        />
      </div>
      
      <FormInput
        id="location"
        name="location"
        label="Location"
        required
        value={formData.location}
        onChange={handleChange}
        error={_errors.location}
        placeholder="Enter location or 'Online'"
      />
      
      <FormSelect
        id="type"
        name="type"
        label="Event Type"
        value={formData.type}
        onChange={handleChange}
        options={[
          { value: 'in-person', label: 'In-Person' },
          { value: 'online', label: 'Online' },
          { value: 'hybrid', label: 'Hybrid' }
        ]}
      />
      
      {(formData.type === 'online' || formData.type === 'hybrid') && (
        <FormInput
          id="url"
          name="url"
          label={`Event URL ${formData.type === 'online' ? '*' : ''}`}
          required={formData.type === 'online'}
          value={formData.url}
          onChange={handleChange}
          error={_errors.url}
          placeholder="https://zoom.us/meeting/..."
        />
      )}
      
      {/* Description Editor Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Event Description *
          </label>
          <div className="flex items-center gap-4">
            {useAIEditor && (
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                Enable image insertion
              </label>
            )}
            <Button
              type="button"
              variant={useAIEditor ? "primary" : "secondary"}
              size="sm"
              onClick={() => setUseAIEditor(!useAIEditor)}
            >
              {useAIEditor ? "🤖 AI Editor" : "📝 Basic Editor"}
            </Button>
          </div>
        </div>
        
        {useAIEditor ? (
          <EnhancedContentAIEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Describe your event... Use the AI tools to help create engaging content!"
            contentType="events"
            includeImages={includeImages}
            height="500px"
            className={_errors.description ? "border-red-500" : ""}
          />
        ) : (
          <FormTextarea
            id="description"
            name="description"
            label=""
            required
            value={formData.description}
            onChange={handleChange}
            error={_errors.description}
            placeholder="Describe your event..."
            rows={6}
          />
        )}
        
        {_errors.description && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {_errors.description}
          </p>
        )}
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {useAIEditor 
            ? "Use the AI assistant to generate compelling event descriptions, create agendas, or improve your writing."
            : "Describe your event in detail. Include what attendees can expect, agenda items, and any important information."
          }
        </p>
      </div>
    </>
  );
};

export default EventDetails;
