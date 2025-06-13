import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, UserPlus, LogIn, Edit } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:text-orange-100 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user ? (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="mr-2">Account</span>
            <User className="h-5 w-5" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50 border border-slate-200 dark:border-slate-700">
          {user ? (
            <>
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.email}
                </p>
              </div>
              <a
                href="http://localhost:5174/profile"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Your Profile
                </div>
              </a>
              <Link
                to="/profile/edit"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </div>
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </div>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </div>
                </Link>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <div className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </div>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </div>
              </Link>
              <Link
                to="/signup"
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign up
                </div>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}