import React from 'react';
import { Upload } from 'lucide-react';

export interface ImportUsersModalProps {
  importPreview: any[];
  isImporting: boolean;
  onClose: () => void;
  onImport: () => Promise<void>;
}

/**
 * ImportUsersModal - CSV import preview and confirmation modal
 * Features:
 * - Preview first 5 rows of CSV data
 * - Important notes and warnings
 * - Import confirmation
 */
export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({
  importPreview,
  isImporting,
  onClose,
  onImport
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Import Users from CSV</h2>
          <p className="text-green-100 text-sm mt-1">Preview and confirm import data</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Import Preview (First 5 rows)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Review the data below before proceeding with the import. Only users with valid user_id will be updated.
            </p>

            {importPreview.length > 0 && (
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {Object.keys(importPreview[0]).map(header => (
                        <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {importPreview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                            {String(value).slice(0, 50)}{String(value).length > 50 ? '...' : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-2">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Only rows with valid user_id will update existing users</li>
                <li>Role assignments require admin permissions</li>
                <li>Multiple roles should be separated by semicolons (;)</li>
                <li>Featured field accepts "Yes" or "No" values</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onImport}
              disabled={isImporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
