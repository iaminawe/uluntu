import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, Video, Link, ExternalLink, FileText, Code, Globe } from 'lucide-react';
import { Event, EventSession, EventPresenter, EventSessionResource } from '../../types';
import './video-embed.css';

// Function to convert YouTube or Vimeo URLs to embed URLs
const getEmbedUrl = (url: string): string => {
  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo URL patterns
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|)(\d+)(?:|\/\?))/;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // If no match, return the original URL
  return url;
};

interface EventSessionsProps {
  event: Event;
}

const EventSessions: React.FC<EventSessionsProps> = ({ event }) => {
  if (!event.sessions || event.sessions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
        Event Schedule
      </h2>
      
      <div className="space-y-6">
        {event.sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
};

const SessionCard: React.FC<{ session: EventSession }> = ({ session }) => {
  const startTime = parseISO(session.startTime);
  const endTime = parseISO(session.endTime);
  
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="bg-slate-100 dark:bg-slate-700 px-6 py-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          {session.title}
        </h3>
        
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-orange-500" />
            <span>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </span>
          </div>
          
          {session.videoUrl && (
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-1 text-orange-500" />
              <span>Video Available</span>
            </div>
          )}
          {session.resources && session.resources.length > 0 && (
            <div className="flex items-center">
              <Link className="h-4 w-4 mr-1 text-orange-500" />
              <span>{session.resources.length} {session.resources.length === 1 ? 'Resource' : 'Resources'}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          {session.description}
        </p>

        {/* Video Embedding */}
        {session.videoUrl && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Session Video
            </h4>
            <div className="aspect-w-16 aspect-h-9 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
              <iframe
                src={getEmbedUrl(session.videoUrl)}
                title={session.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        )}

        {/* Resources */}
        {session.resources && session.resources.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Session Resources
            </h4>
            <div className="space-y-2">
              {session.resources.map((resource) => (
                <ResourceLink key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        )}
        
        {/* Presenters */}
        {session.presenters && session.presenters.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              {session.presenters.length === 1 ? 'Presenter' : 'Presenters'}
            </h4>
            
            <div className="space-y-4">
              {session.presenters.map((presenter) => (
                <PresenterCard key={presenter.id} presenter={presenter} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResourceLink: React.FC<{ resource: EventSessionResource }> = ({ resource }) => {
  // Choose icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'slides':
        return <FileText className="h-4 w-4 mr-2 text-orange-500" />;
      case 'document':
        return <FileText className="h-4 w-4 mr-2 text-orange-500" />;
      case 'code':
        return <Code className="h-4 w-4 mr-2 text-orange-500" />;
      case 'website':
        return <Globe className="h-4 w-4 mr-2 text-orange-500" />;
      default:
        return <ExternalLink className="h-4 w-4 mr-2 text-orange-500" />;
    }
  };

  return (
    <a 
      href={resource.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
      {getResourceIcon(resource.type)}
      <span className="font-medium text-slate-900 dark:text-white">
        {resource.title}
      </span>
    </a>
  );
};

const PresenterCard: React.FC<{ presenter: EventPresenter }> = ({ presenter }) => {
  return (
    <div className="flex items-start">
      <img 
        src={presenter.image} 
        alt={presenter.name} 
        className="w-12 h-12 rounded-full mr-4 object-cover"
      />
      <div>
        <h5 className="font-medium text-slate-900 dark:text-white">
          {presenter.name}
        </h5>
        
        {(presenter.title || presenter.company) && (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            {presenter.title}
            {presenter.title && presenter.company && ' at '}
            {presenter.company}
          </p>
        )}
        
        {presenter.bio && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {presenter.bio}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventSessions;
