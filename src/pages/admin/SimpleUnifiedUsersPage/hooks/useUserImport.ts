import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

/**
 * useUserImport - Hook for CSV import/export functionality
 * Handles:
 * - CSV file upload and parsing
 * - Import preview
 * - CSV export
 * - Import processing with error handling
 */
export const useUserImport = (canEditRoles: boolean) => {
  const queryClient = useQueryClient();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // CSV Export functionality
  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      // Get all users (not just current page)
      const { data: allUsersData } = await supabase.rpc('get_admin_users');

      if (!allUsersData) {
        toast.error('No data to export');
        return;
      }

      // Get all member profiles
      const userIds = allUsersData.map(u => u.user_id);
      const { data: memberProfiles } = await supabase
        .from('members')
        .select('*')
        .in('user_id', userIds);

      // Prepare CSV data
      const csvData = allUsersData.map(user => {
        const profile = memberProfiles?.find(p => p.user_id === user.user_id);
        return {
          user_id: user.user_id,
          email: user.email,
          name: user.name || '',
          title: profile?.title || '',
          company: profile?.company || '',
          location: profile?.location || '',
          bio: profile?.bio || '',
          status: profile?.status || 'draft',
          featured: profile?.featured ? 'Yes' : 'No',
          roles: (user.roles || []).join(';'),
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at || ''
        };
      });

      // Convert to CSV
      const headers = Object.keys(csvData[0]).join(',');
      const csvContent = [
        headers,
        ...csvData.map(row =>
          Object.values(row).map(value =>
            typeof value === 'string' && value.includes(',')
              ? `"${value}"`
              : value
          ).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${csvData.length} users to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    } finally {
      setIsExporting(false);
    }
  };

  // CSV Import functionality
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        toast.error('CSV file must contain headers and at least one row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setImportPreview(preview);
      setShowImportModal(true);
    };
    reader.readAsText(file);
  };

  const processImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());

        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            // Skip if no email
            if (!row.email) continue;

            // Update/create member profile
            const memberData = {
              user_id: row.user_id || null,
              name: row.name || null,
              email: row.email,
              title: row.title || null,
              company: row.company || null,
              location: row.location || null,
              bio: row.bio || null,
              status: row.status || 'draft',
              featured: row.featured === 'Yes',
              updated_at: new Date().toISOString()
            };

            if (row.user_id) {
              // Update existing member
              const { error } = await supabase
                .from('members')
                .upsert(memberData, { onConflict: 'user_id' });

              if (error) throw error;

              // Handle roles if provided
              if (row.roles && canEditRoles) {
                const rolesToAssign = row.roles.split(';').filter(r => r.trim());
                if (rolesToAssign.length > 0) {
                  // Remove existing roles
                  await supabase
                    .from('user_roles')
                    .delete()
                    .eq('user_id', row.user_id);

                  // Add new roles
                  const roleInserts = rolesToAssign.map(role => ({
                    user_id: row.user_id,
                    role: role.trim(),
                    created_at: new Date().toISOString()
                  }));

                  await supabase
                    .from('user_roles')
                    .insert(roleInserts);
                }
              }
            }

            successCount++;
          } catch (error) {
            console.error(`Error processing row ${i}:`, error);
            errorCount++;
          }
        }

        toast.success(`Import completed: ${successCount} successful, ${errorCount} errors`);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
      };
      reader.readAsText(importFile);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to process import');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    // State
    showImportModal,
    importFile,
    importPreview,
    isExporting,
    isImporting,

    // Setters
    setShowImportModal,
    setImportFile,
    setImportPreview,

    // Actions
    exportToCSV,
    handleFileUpload,
    processImport
  };
};
