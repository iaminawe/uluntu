import React, { useState } from 'react';
import { PlusCircle, X, Clock, Video, Link, User, Trash2, Plus } from 'lucide-react';
import { EventSession, EventPresenter, EventSessionResource } from '../../types';

interface SessionsManagerProps {
  sessions: EventSession[];
  onSessionsChange: (sessions: EventSession[]) => void;
}

const emptyPresenter: EventPresenter = {
  id: 0, // Will be replaced with a proper ID when saved
  name: '',
  image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', // Default image
  bio: '',
  title: '',
  company: ''
};

const emptyResource: EventSessionResource = {
  id: 0, // Will be replaced with a proper ID when saved
  title: '',
  url: '',
  type: 'slides'
};

const emptySession: EventSession = {
  id: 0, // Will be replaced with a proper ID when saved
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  presenters: [],
  videoUrl: '',
  resources: []
};

const SessionsManager: React.FC<SessionsManagerProps> = ({ sessions, onSessionsChange }) => {
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
  const [expandedPresenterIndex, setExpandedPresenterIndex] = useState<{ sessionIndex: number, presenterIndex: number } | null>(null);
  const [expandedResourceIndex, setExpandedResourceIndex] = useState<{ sessionIndex: number, resourceIndex: number } | null>(null);

  const addSession = () => {
    const newSession = {
      ...emptySession,
      id: Date.now(), // Use timestamp as temporary ID
      startTime: new Date().toISOString(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
    };
    onSessionsChange([...sessions, newSession]);
    setExpandedSessionId(newSession.id);
  };

  const updateSession = (index: number, updatedSession: EventSession) => {
    const updatedSessions = [...sessions];
    updatedSessions[index] = updatedSession;
    onSessionsChange(updatedSessions);
  };

  const removeSession = (index: number) => {
    const updatedSessions = [...sessions];
    updatedSessions.splice(index, 1);
    onSessionsChange(updatedSessions);
    setExpandedSessionId(null);
  };

  const addPresenter = (sessionIndex: number) => {
    const session = sessions[sessionIndex];
    const newPresenter = {
      ...emptyPresenter,
      id: Date.now(), // Use timestamp as temporary ID
    };
    
    const updatedSession = {
      ...session,
      presenters: [...session.presenters, newPresenter]
    };
    
    updateSession(sessionIndex, updatedSession);
    setExpandedPresenterIndex({ 
      sessionIndex, 
      presenterIndex: updatedSession.presenters.length - 1 
    });
  };

  const updatePresenter = (sessionIndex: number, presenterIndex: number, updatedPresenter: EventPresenter) => {
    const session = sessions[sessionIndex];
    const updatedPresenters = [...session.presenters];
    updatedPresenters[presenterIndex] = updatedPresenter;
    
    const updatedSession = {
      ...session,
      presenters: updatedPresenters
    };
    
    updateSession(sessionIndex, updatedSession);
  };

  const removePresenter = (sessionIndex: number, presenterIndex: number) => {
    const session = sessions[sessionIndex];
    const updatedPresenters = [...session.presenters];
    updatedPresenters.splice(presenterIndex, 1);
    
    const updatedSession = {
      ...session,
      presenters: updatedPresenters
    };
    
    updateSession(sessionIndex, updatedSession);
    setExpandedPresenterIndex(null);
  };

  const addResource = (sessionIndex: number) => {
    const session = sessions[sessionIndex];
    const newResource = {
      ...emptyResource,
      id: Date.now(), // Use timestamp as temporary ID
    };
    
    const updatedSession = {
      ...session,
      resources: [...(session.resources || []), newResource]
    };
    
    updateSession(sessionIndex, updatedSession);
    setExpandedResourceIndex({ 
      sessionIndex, 
      resourceIndex: (updatedSession.resources?.length || 0) - 1 
    });
  };

  const updateResource = (sessionIndex: number, resourceIndex: number, updatedResource: EventSessionResource) => {
    const session = sessions[sessionIndex];
    const updatedResources = [...(session.resources || [])];
    updatedResources[resourceIndex] = updatedResource;
    
    const updatedSession = {
      ...session,
      resources: updatedResources
    };
    
    updateSession(sessionIndex, updatedSession);
  };

  const removeResource = (sessionIndex: number, resourceIndex: number) => {
    const session = sessions[sessionIndex];
    const updatedResources = [...(session.resources || [])];
    updatedResources.splice(resourceIndex, 1);
    
    const updatedSession = {
      ...session,
      resources: updatedResources
    };
    
    updateSession(sessionIndex, updatedSession);
    setExpandedResourceIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Sessions & Presenters
        </h3>
        <button
          type="button"
          onClick={addSession}
          className="flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/20 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">
            No sessions added yet. Add a session to provide more details about your event.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, sessionIndex) => (
            <div 
              key={session.id} 
              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Session Header */}
              <div 
                className="bg-slate-50 dark:bg-slate-800 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
              >
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {session.title || 'Untitled Session'}
                  </h4>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {session.startTime ? (
                        <>
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : (
                        'Time not set'
                      )}
                    </span>
                    {session.videoUrl && (
                      <>
                        <span className="mx-2">•</span>
                        <Video className="h-3.5 w-3.5 mr-1" />
                        <span>Has video</span>
                      </>
                    )}
                    {session.resources && session.resources.length > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <Link className="h-3.5 w-3.5 mr-1" />
                        <span>{session.resources.length} {session.resources.length === 1 ? 'resource' : 'resources'}</span>
                      </>
                    )}
                    {session.presenters.length > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <User className="h-3.5 w-3.5 mr-1" />
                        <span>{session.presenters.length} {session.presenters.length === 1 ? 'presenter' : 'presenters'}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSession(sessionIndex);
                  }}
                  className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Session Details */}
              {expandedSessionId === session.id && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-4">
                    {/* Session Title */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Session Title
                      </label>
                      <input
                        type="text"
                        value={session.title}
                        onChange={(e) => updateSession(sessionIndex, { ...session, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                        placeholder="e.g., Opening Keynote"
                      />
                    </div>

                    {/* Session Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={session.startTime ? session.startTime.slice(0, 16) : ''}
                          onChange={(e) => updateSession(sessionIndex, { 
                            ...session, 
                            startTime: e.target.value ? new Date(e.target.value).toISOString() : '' 
                          })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={session.endTime ? session.endTime.slice(0, 16) : ''}
                          onChange={(e) => updateSession(sessionIndex, { 
                            ...session, 
                            endTime: e.target.value ? new Date(e.target.value).toISOString() : '' 
                          })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Video URL */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Video URL (YouTube or Vimeo)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Video className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={session.videoUrl || ''}
                          onChange={(e) => updateSession(sessionIndex, { ...session, videoUrl: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                          placeholder="e.g., https://www.youtube.com/watch?v=..."
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Add a YouTube or Vimeo URL for session recording or presentation
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={session.description}
                        onChange={(e) => updateSession(sessionIndex, { ...session, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                        placeholder="Describe what this session is about..."
                      />
                    </div>

                    {/* Resources */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Resources (Slides, Documents, Links)
                        </label>
                        <button
                          type="button"
                          onClick={() => addResource(sessionIndex)}
                          className="flex items-center text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Resource
                        </button>
                      </div>

                      {!session.resources || session.resources.length === 0 ? (
                        <div className="text-center py-4 bg-slate-50 dark:bg-slate-700/20 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            No resources added yet. Add slides, documents, or other links.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {session.resources.map((resource, resourceIndex) => (
                            <div 
                              key={resource.id} 
                              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                            >
                              {/* Resource Header */}
                              <div 
                                className="bg-slate-50 dark:bg-slate-800 p-3 flex justify-between items-center cursor-pointer"
                                onClick={() => setExpandedResourceIndex(
                                  expandedResourceIndex?.sessionIndex === sessionIndex && 
                                  expandedResourceIndex?.resourceIndex === resourceIndex 
                                    ? null 
                                    : { sessionIndex, resourceIndex }
                                )}
                              >
                                <div>
                                  <h5 className="font-medium text-slate-900 dark:text-white">
                                    {resource.title || 'Untitled Resource'}
                                  </h5>
                                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    <Link className="h-3.5 w-3.5 mr-1" />
                                    <span>{resource.type}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeResource(sessionIndex, resourceIndex);
                                  }}
                                  className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Resource Details */}
                              {expandedResourceIndex?.sessionIndex === sessionIndex && 
                               expandedResourceIndex?.resourceIndex === resourceIndex && (
                                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                                  <div className="space-y-3">
                                    {/* Resource Title */}
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Title
                                      </label>
                                      <input
                                        type="text"
                                        value={resource.title}
                                        onChange={(e) => updateResource(
                                          sessionIndex, 
                                          resourceIndex, 
                                          { ...resource, title: e.target.value }
                                        )}
                                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="e.g., Presentation Slides"
                                      />
                                    </div>

                                    {/* Resource Type */}
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Type
                                      </label>
                                      <select
                                        value={resource.type}
                                        onChange={(e) => updateResource(
                                          sessionIndex, 
                                          resourceIndex, 
                                          { ...resource, type: e.target.value as 'slides' | 'document' | 'code' | 'website' | 'other' }
                                        )}
                                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                      >
                                        <option value="slides">Slides</option>
                                        <option value="document">Document</option>
                                        <option value="code">Code</option>
                                        <option value="website">Website</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>

                                    {/* Resource URL */}
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        URL
                                      </label>
                                      <input
                                        type="text"
                                        value={resource.url}
                                        onChange={(e) => updateResource(
                                          sessionIndex, 
                                          resourceIndex, 
                                          { ...resource, url: e.target.value }
                                        )}
                                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="https://..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Presenters */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Presenters
                        </label>
                        <button
                          type="button"
                          onClick={() => addPresenter(sessionIndex)}
                          className="flex items-center text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          Add Presenter
                        </button>
                      </div>

                      {session.presenters.length === 0 ? (
                        <div className="text-center py-4 bg-slate-50 dark:bg-slate-700/20 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            No presenters added yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {session.presenters.map((presenter, presenterIndex) => (
                            <div 
                              key={presenter.id} 
                              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                            >
                              {/* Presenter Header */}
                              <div 
                                className="bg-slate-50 dark:bg-slate-800 p-3 flex justify-between items-center cursor-pointer"
                                onClick={() => setExpandedPresenterIndex(
                                  expandedPresenterIndex?.sessionIndex === sessionIndex && 
                                  expandedPresenterIndex?.presenterIndex === presenterIndex 
                                    ? null 
                                    : { sessionIndex, presenterIndex }
                                )}
                              >
                                <div className="flex items-center">
                                  <img 
                                    src={presenter.image} 
                                    alt={presenter.name} 
                                    className="w-8 h-8 rounded-full mr-3 object-cover"
                                  />
                                  <div>
                                    <h5 className="font-medium text-slate-900 dark:text-white">
                                      {presenter.name || 'Unnamed Presenter'}
                                    </h5>
                                    {(presenter.title || presenter.company) && (
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {presenter.title}
                                        {presenter.title && presenter.company && ' at '}
                                        {presenter.company}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePresenter(sessionIndex, presenterIndex);
                                  }}
                                  className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Presenter Details */}
                              {expandedPresenterIndex?.sessionIndex === sessionIndex && 
                               expandedPresenterIndex?.presenterIndex === presenterIndex && (
                                <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                                  <div className="space-y-3">
                                    {/* Name */}
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Name
                                      </label>
                                      <input
                                        type="text"
                                        value={presenter.name}
                                        onChange={(e) => updatePresenter(
                                          sessionIndex, 
                                          presenterIndex, 
                                          { ...presenter, name: e.target.value }
                                        )}
                                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="Full name"
                                      />
                                    </div>

                                    {/* Title & Company */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                          Title
                                        </label>
                                        <input
                                          type="text"
                                          value={presenter.title || ''}
                                          onChange={(e) => updatePresenter(
                                            sessionIndex, 
                                            presenterIndex, 
                                            { ...presenter, title: e.target.value }
                                          )}
                                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                          placeholder="e.g., Software Engineer"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                          Company
                                        </label>
                                        <input
                                          type="text"
                                          value={presenter.company || ''}
                                          onChange={(e) => updatePresenter(
                                            sessionIndex, 
                                            presenterIndex, 
                                            { ...presenter, company: e.target.value }
                                          )}
                                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                          placeholder="e.g., Tech Company"
                                        />
                                      </div>
                                    </div>

                                    {/* Image URL */}
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Profile Image URL
                                      </label>
                                      <input
                                        type="text"
                                        value={presenter.image}
                                        onChange={(e) => updatePresenter(
                                          sessionIndex, 
                                          presenterIndex, 
                                          { ...presenter, image: e.target.value }
                                        )}
                                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="https://example.com/image.jpg"
                                      />
                                    </div>

                                    {/* Bio */}
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Bio
                                      </label>
                                      <textarea
                                        value={presenter.bio || ''}
                                        onChange={(e) => updatePresenter(
                                          sessionIndex, 
                                          presenterIndex, 
                                          { ...presenter, bio: e.target.value }
                                        )}
                                        rows={2}
                                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="Brief biography of the presenter..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsManager;
