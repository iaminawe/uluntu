import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MembersTabProps } from './types';
import Pagination from '../../components/Pagination'; // Assuming Pagination.tsx is in src/components

const ITEMS_PER_PAGE = 8;

const MembersTab: React.FC<MembersTabProps> = ({ members, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Separate admins and regular members
  const admins = members.filter(member => member.role === 'admin');
  const regularMembers = members.filter(member => member.role !== 'admin');

  // Pagination logic for regular members
  const totalRegularMembers = regularMembers.length;
  const totalPagesRegular = Math.ceil(totalRegularMembers / ITEMS_PER_PAGE);
  const startIndexRegular = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndexRegular = startIndexRegular + ITEMS_PER_PAGE;
  const currentRegularMembers = regularMembers.slice(startIndexRegular, endIndexRegular);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optionally, scroll to top of members list
    // window.scrollTo({ top: /* ref to members list */.offsetTop, behavior: 'smooth' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Group Members</h2>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-700 h-40 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">No members in this group yet.</p>
        </div>
      ) : (
        <div>
          {/* Admins Section */}
          {admins.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Group Admins
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {admins.map(admin => (
                  <Link
                    key={admin.id}
                    to={`/directory/${admin.id}`}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
                  >
                    <img
                      src={admin.image}
                      alt={admin.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                    />
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {admin.name}
                    </h4>
                    {admin.title && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{admin.title}</p>
                    )}
                    <div className="mt-2 inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                      Admin
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Members Section */}
          {regularMembers.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Members ({regularMembers.length})
              </h3>
              {currentRegularMembers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {currentRegularMembers.map(member => (
                    <Link
                      key={member.id}
                      to={`/directory/${member.id}`}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                      />
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {member.name}
                      </h4>
                      {member.title && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{member.title}</p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Joined {new Date(member.joinedDate).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400 text-center">No members to display for this page.</p>
              )}
              {totalPagesRegular > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPagesRegular}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}
          {admins.length === 0 && regularMembers.length === 0 && !isLoading && (
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
               <p className="text-slate-600 dark:text-slate-400">No members in this group yet.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersTab;
