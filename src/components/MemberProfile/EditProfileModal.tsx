import { useState } from 'react';
import { X } from 'lucide-react';
import { Member } from './types';

interface EditProfileModalProps {
  member: Member;
  onClose: () => void;
  onSave: (data: Partial<Member>) => void;
}

const EditProfileModal = ({ member, onClose, onSave }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    name: member.name,
    title: member.title,
    bio: member.bio,
    location: member.location,
    website: member.website || '',
    skills: member.skills.join(', '),
    employmentStatus: member.employmentStatus,
    openToVolunteering: member.openToVolunteering
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim())
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full p-6 shadow-xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Professional Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Skills (comma separated)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="employmentStatus"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Employment Status
              </label>
              <select
                id="employmentStatus"
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="full-time">Full-time</option>
                <option value="freelance">Freelance</option>
                <option value="looking">Looking for work</option>
                <option value="not-looking">Not looking</option>
              </select>
            </div>

            <div className="flex items-center h-full">
              <input
                type="checkbox"
                id="openToVolunteering"
                name="openToVolunteering"
                checked={formData.openToVolunteering}
                onChange={handleChange}
                className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-slate-300 rounded"
              />
              <label
                htmlFor="openToVolunteering"
                className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
              >
                Available for volunteer opportunities
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
