// Removing unused imports
import { EventDetailsProps } from './types';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormDatePicker
} from '../../components/ui/Form';

const EventDetails: React.FC<EventDetailsProps> = ({ 
  formData, 
  handleChange, 
  errors 
}) => {
  return (
    <>
      <FormInput
        id="title"
        name="title"
        label="Event Title"
        required
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter event title"
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
          error={errors.date}
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
        error={errors.location}
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
          error={errors.url}
          placeholder="https://zoom.us/meeting/..."
        />
      )}
      
      <FormTextarea
        id="description"
        name="description"
        label="Event Description"
        required
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Describe your event..."
        rows={6}
      />
    </>
  );
};

export default EventDetails;
