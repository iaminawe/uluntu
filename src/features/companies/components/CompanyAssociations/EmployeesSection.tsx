import React from 'react';
import { Link } from 'react-router-dom';
import { CompanyEmployee } from '@/types';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { Users, Briefcase, Calendar, Building2 } from 'lucide-react';

interface EmployeesSectionProps {
  employees: CompanyEmployee[];
  isLoading: boolean;
  error?: Error | null;
}

export function EmployeesSection({ employees, isLoading, error }: EmployeesSectionProps) {
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Team Members
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Team Members
        </h2>
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Failed to load team members
        </div>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Team Members ({employees.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <Link
            key={`${employee.company_id}-${employee.member_id}`}
            to={`/directory/${employee.member_id}`}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-start gap-4"
          >
            {employee.member?.image ? (
              <img
                src={employee.member.image}
                alt={employee.member.name || 'Team member'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {employee.member?.name || 'Unknown Member'}
              </h3>
              {employee.role && (
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Briefcase className="w-3 h-3" />
                  {employee.role}
                </p>
              )}
              {employee.department && (
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Building2 className="w-3 h-3" />
                  {employee.department}
                </p>
              )}
              {employee.start_date && (
                <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-2">
                  <Calendar className="w-3 h-3" />
                  Since {new Date(employee.start_date).getFullYear()}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}