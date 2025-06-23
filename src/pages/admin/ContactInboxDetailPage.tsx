import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3,
  UserCheck,
  Edit3,
  Send,
  Plus,
  X,
  Save,
  Trash2,
  Eye
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ContactSubmission } from '@/features/contact/api/contactSubmissionsApi';

interface SubmissionNote {
  id: string;
  note_text: string;
  note_type: string;
  is_internal: boolean;
  is_important: boolean;
  created_at: string;
  created_by: string;
  creator?: { email: string };
}

interface SubmissionTag {
  id: string;
  tag_name: string;
  tag_color: string;
  created_at: string;
}

const ContactInboxDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState({ name: '', color: '#6B7280' });
  const [showAddTag, setShowAddTag] = useState(false);
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Fetch submission details
  const { data: submission, isLoading } = useQuery({
    queryKey: ['contact-submission', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select(`
          *,
          assigned_user:assigned_to(email),
          member:member_id(name, image)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ContactSubmission;
    },
    enabled: !!id
  });

  // Fetch submission notes
  const { data: notes } = useQuery({
    queryKey: ['contact-submission-notes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submission_notes')
        .select(`
          *,
          creator:created_by(email)
        `)
        .eq('submission_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SubmissionNote[];
    },
    enabled: !!id
  });

  // Fetch submission tags
  const { data: tags } = useQuery({
    queryKey: ['contact-submission-tags', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submission_tags')
        .select('*')
        .eq('submission_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SubmissionTag[];
    },
    enabled: !!id
  });

  // Fetch admin users for assignment
  const { data: adminUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          users:user_id(email)
        `)
        .in('role', ['admin', 'superadmin']);
      
      if (error) throw error;
      return data?.map(item => ({
        id: item.user_id,
        email: item.users?.email
      })) || [];
    }
  });

  // Update submission mutation
  const updateSubmissionMutation = useMutation({
    mutationFn: async (updates: Partial<ContactSubmission>) => {
      const { error } = await supabase
        .from('contact_submissions')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submission', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-contact-submissions'] });
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (noteText: string) => {
      const { error } = await supabase
        .from('contact_submission_notes')
        .insert({
          submission_id: id,
          note_text: noteText,
          note_type: 'internal',
          is_internal: true
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submission-notes', id] });
      setNewNote('');
    }
  });

  // Add tag mutation
  const addTagMutation = useMutation({
    mutationFn: async (tag: { name: string; color: string }) => {
      const { error } = await supabase
        .from('contact_submission_tags')
        .insert({
          submission_id: id,
          tag_name: tag.name,
          tag_color: tag.color
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submission-tags', id] });
      setNewTag({ name: '', color: '#6B7280' });
      setShowAddTag(false);
    }
  });

  // Remove tag mutation
  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('contact_submission_tags')
        .delete()
        .eq('id', tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submission-tags', id] });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'in_progress': return <Clock3 className="h-5 w-5 text-blue-500" />;
      case 'closed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'spam': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (status: string) => {
    updateSubmissionMutation.mutate({ status: status as ContactSubmission['status'] });
  };

  const handlePriorityChange = (priority: string) => {
    updateSubmissionMutation.mutate({ priority: priority as ContactSubmission['priority'] });
  };

  const handleAssignmentSave = () => {
    updateSubmissionMutation.mutate({ 
      assigned_to: selectedAssignee || null 
    });
    setIsEditingAssignment(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote);
    }
  };

  const handleAddTag = () => {
    if (newTag.name.trim()) {
      addTagMutation.mutate(newTag);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/inbox')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Submission</h1>
            <p className="text-gray-600">#{submission.id.slice(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {submission.member_id && (
            <Link
              to={`/directory/${submission.member_id}`}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Details */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {submission.is_member ? (
                    <UserCheck className="h-6 w-6 text-green-500" />
                  ) : (
                    <User className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{submission.name}</h2>
                  <p className="text-gray-600">{submission.email}</p>
                  {submission.phone && (
                    <p className="text-gray-600 text-sm">{submission.phone}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(submission.created_at).toLocaleDateString()}
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(submission.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{submission.subject}</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{submission.message}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Tags</h4>
                <button
                  onClick={() => setShowAddTag(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tag
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags?.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                    style={{ backgroundColor: tag.tag_color + '20', color: tag.tag_color, borderColor: tag.tag_color + '40' }}
                  >
                    {tag.tag_name}
                    <button
                      onClick={() => removeTagMutation.mutate(tag.id)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                
                {showAddTag && (
                  <div className="inline-flex items-center space-x-2 bg-gray-50 rounded-lg px-2 py-1">
                    <input
                      type="text"
                      placeholder="Tag name"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                      className="w-20 px-2 py-1 text-xs border-0 bg-transparent focus:ring-0"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <input
                      type="color"
                      value={newTag.color}
                      onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                      className="w-6 h-6 rounded border-0"
                    />
                    <button
                      onClick={handleAddTag}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Save className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setShowAddTag(false)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes and Comments */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Internal Notes</h3>
            
            {/* Add Note Form */}
            <div className="mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {notes?.map(note => (
                <div key={note.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {note.creator?.email || 'System'}
                      </span>
                      {note.is_important && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.note_text}</p>
                  {note.note_type !== 'internal' && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {note.note_type.replace('_', ' ')}
                    </span>
                  )}
                </div>
              ))}
              
              {(!notes || notes.length === 0) && (
                <p className="text-gray-500 text-sm italic">No notes yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Priority</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(submission.status)}
                  <select
                    value={submission.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={submission.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Assignment</h3>
              <button
                onClick={() => {
                  setIsEditingAssignment(true);
                  setSelectedAssignee(submission.assigned_to || '');
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            
            {isEditingAssignment ? (
              <div className="space-y-3">
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {adminUsers?.map(user => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAssignmentSave}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingAssignment(false)}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {submission.assigned_user?.email ? (
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-900">{submission.assigned_user.email}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">Unassigned</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submission Info */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submission Info</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="text-gray-900 capitalize">{submission.submission_type}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Source:</span>
                <span className="text-gray-900 capitalize">{submission.source}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Member:</span>
                <span className="text-gray-900">{submission.is_member ? 'Yes' : 'No'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Responses:</span>
                <span className="text-gray-900">{submission.response_count}</span>
              </div>
              
              {submission.first_response_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">First Response:</span>
                  <span className="text-gray-900">
                    {new Date(submission.first_response_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {submission.ip_address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="text-gray-900 font-mono text-xs">{submission.ip_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInboxDetailPage;