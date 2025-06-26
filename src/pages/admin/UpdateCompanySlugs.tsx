import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api';
import { generateSlug, isValidSlug, makeSlugUnique } from '@/features/companies/utils/slugUtils';
import { CheckCircle, AlertCircle, Loader2, Building } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/Alert';
import Button from '@/shared/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card';
const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-slate-600 dark:text-slate-400 ${className}`}>{children}</p>
);

interface CompanyData {
  id: string;
  name: string;
  slug: string | null;
}

interface SlugUpdate {
  id: string;
  oldSlug: string | null;
  newSlug: string;
  name: string;
}

export default function UpdateCompanySlugs() {
  const [dryRun, setDryRun] = useState(true);
  const [updates, setUpdates] = useState<SlugUpdate[]>([]);
  const [completedUpdates, setCompletedUpdates] = useState<SlugUpdate[]>([]);
  const queryClient = useQueryClient();

  // Fetch companies without slugs or with invalid slugs
  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['companies', 'missing-slugs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, slug')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as CompanyData[];
    },
  });

  // Generate slug updates
  const generateSlugUpdates = () => {
    if (!companies) return;

    const existingSlugs = companies
      .filter(c => c.slug && isValidSlug(c.slug))
      .map(c => c.slug!);

    const updatesNeeded: SlugUpdate[] = [];

    companies.forEach(company => {
      // Skip if already has a valid slug
      if (company.slug && isValidSlug(company.slug)) {
        return;
      }

      const baseSlug = generateSlug(company.name);
      const uniqueSlug = makeSlugUnique(baseSlug, [...existingSlugs, ...updatesNeeded.map(u => u.newSlug)]);

      updatesNeeded.push({
        id: company.id,
        oldSlug: company.slug,
        newSlug: uniqueSlug,
        name: company.name,
      });
    });

    setUpdates(updatesNeeded);
  };

  // Update slugs mutation
  const updateSlugsMutation = useMutation({
    mutationFn: async (updates: SlugUpdate[]) => {
      const results: SlugUpdate[] = [];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('companies')
          .update({ slug: update.newSlug })
          .eq('id', update.id);

        if (error) {
          console.error(`Failed to update company ${update.id}:`, error);
          throw error;
        }
        
        results.push(update);
      }
      
      return results;
    },
    onSuccess: (data) => {
      setCompletedUpdates(data);
      setUpdates([]);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const handleGenerateSlugs = () => {
    generateSlugUpdates();
  };

  const handleUpdateSlugs = () => {
    if (updates.length > 0) {
      updateSlugsMutation.mutate(updates);
    }
  };

  const companiesNeedingUpdate = companies?.filter(c => !c.slug || !isValidSlug(c.slug)) || [];
  const companiesWithValidSlugs = companies?.filter(c => c.slug && isValidSlug(c.slug)) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            Update Company Slugs
          </CardTitle>
          <CardDescription>
            Generate URL-friendly slugs for companies that don't have them or have invalid slugs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{companies?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Total Companies</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{companiesWithValidSlugs.length}</div>
                <p className="text-sm text-muted-foreground">With Valid Slugs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{companiesNeedingUpdate.length}</div>
                <p className="text-sm text-muted-foreground">Need Update</p>
              </CardContent>
            </Card>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load companies: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Companies needing update */}
          {!isLoading && companiesNeedingUpdate.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Companies Needing Slug Updates</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {companiesNeedingUpdate.map(company => (
                  <div key={company.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-muted-foreground">
                      {company.slug ? `Invalid: ${company.slug}` : 'No slug'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGenerateSlugs}
                  disabled={updateSlugsMutation.isPending}
                >
                  Generate Slugs
                </Button>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Dry run (preview only)</span>
                </label>
              </div>
            </div>
          )}

          {/* Generated updates preview */}
          {updates.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {dryRun ? 'Preview' : 'Ready to Update'} ({updates.length} companies)
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {updates.map(update => (
                  <div key={update.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{update.name}</span>
                    <span className="text-green-600 font-mono">→ {update.newSlug}</span>
                  </div>
                ))}
              </div>

              {!dryRun && (
                <Button
                  onClick={handleUpdateSlugs}
                  disabled={updateSlugsMutation.isPending}
                  className="w-full"
                >
                  {updateSlugsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update All Slugs'
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Success message */}
          {completedUpdates.length > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Successfully updated {completedUpdates.length} company slug{completedUpdates.length !== 1 ? 's' : ''}.
              </AlertDescription>
            </Alert>
          )}

          {/* All companies have valid slugs */}
          {!isLoading && companiesNeedingUpdate.length === 0 && completedUpdates.length === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>All Good!</AlertTitle>
              <AlertDescription>
                All companies already have valid URL slugs.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}