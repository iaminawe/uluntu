import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { RegisterSidebarProps } from './types';

const RegisterSidebar: React.FC<RegisterSidebarProps> = ({ 
  event, 
  formattedDate,
  formattedTime,
  isRegistering, 
  registrationSuccess,
  isAlreadyRegistered,
  onRegister
}) => {
  return (
    <div className="space-y-6">
      {/* Registration Card */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        {registrationSuccess ? (
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-lg mb-4">
              <p className="font-medium">Registration Successful!</p>
              <p className="text-sm mt-1">You're now registered for this event.</p>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm">
              <p>We've sent the details to your email.</p>
              <p className="mt-2">See you at the event!</p>
            </div>
          </div>
        ) : isAlreadyRegistered ? (
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg mb-4">
              <p className="font-medium">You're Already Registered</p>
              <p className="text-sm mt-1">Looking forward to seeing you at the event!</p>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Calendar className="h-5 w-5 mr-3 text-orange-500" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Clock className="h-5 w-5 mr-3 text-orange-500" />
                <span>{formattedTime}</span>
              </div>
              {event.type !== 'online' && (
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <MapPin className="h-5 w-5 mr-3 text-orange-500" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.type === 'online' && event.url && (
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <ExternalLink className="h-5 w-5 mr-3 text-orange-500" />
                  <span>Online Event</span>
                </div>
              )}
            </div>
            <button
              onClick={onRegister}
              disabled={isRegistering}
              className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                isRegistering 
                  ? 'bg-red-400 cursor-wait' 
                  : 'bg-red-500 hover:bg-red-600'
                } text-white`}
            >
              {isRegistering ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Unregistering...
                </>
              ) : 'Unregister'}
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Register for This Event
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Calendar className="h-5 w-5 mr-3 text-orange-500" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center text-slate-600 dark:text-slate-300">
                <Clock className="h-5 w-5 mr-3 text-orange-500" />
                <span>{formattedTime}</span>
              </div>
              {event.type !== 'online' && (
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <MapPin className="h-5 w-5 mr-3 text-orange-500" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.type === 'online' && event.url && (
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <ExternalLink className="h-5 w-5 mr-3 text-orange-500" />
                  <span>Online Event</span>
                </div>
              )}
            </div>
            <button
              onClick={onRegister}
              disabled={isRegistering}
              className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                isRegistering 
                  ? 'bg-orange-400 cursor-wait' 
                  : 'bg-orange-500 hover:bg-orange-600'
                } text-white`}
            >
              {isRegistering ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : 'Register Now'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterSidebar;
