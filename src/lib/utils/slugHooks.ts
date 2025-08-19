import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  generateSlug, 
  generateUniqueSlug, 
  validateSlug, 
  lookupByIdOrSlug,
  parseIdentifier,
  ContentType,
  SlugOptions,
  slugCacheUtils
} from './slugUtils';
import { 
  validateSlugSEO, 
  autoFixSlug, 
  generateSlugSuggestions,
  SlugValidationResult 
} from './slugValidation';
import { logger } from '@/utils/logger';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Hook for managing slug generation and validation in forms
 */
export function useSlugGeneration(
  sourceText: string,
  contentType: ContentType,
  options: {
    autoGenerate?: boolean;
    debounceMs?: number;
    excludeId?: string;
    slugOptions?: SlugOptions;
    validationEnabled?: boolean;
  } = {}
) {
  const {
    autoGenerate = true,
    debounceMs = 500,
    excludeId,
    slugOptions = {},
    validationEnabled = true
  } = options;

  const [slug, setSlug] = useState('');
  const [manuallyEdited, setManuallyEdited] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validation, setValidation] = useState<SlugValidationResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const debouncedSourceText = useDebounce(sourceText, debounceMs);
  const debouncedSlug = useDebounce(slug, debounceMs);

  // Generate slug from source text
  const generateSlugFromSource = useCallback(async (text: string) => {
    if (!text || manuallyEdited) return;
    
    setIsGenerating(true);
    try {
      const uniqueSlug = await generateUniqueSlug(
        text, 
        contentType, 
        excludeId, 
        slugOptions
      );
      setSlug(uniqueSlug);
      
      // Generate suggestions
      const slugSuggestions = generateSlugSuggestions(text, 3, slugOptions);
      setSuggestions(slugSuggestions.filter(s => s !== uniqueSlug));
      
    } catch (error) {
      logger.error('Error generating slug', 'SLUG_HOOK', { text, error });
    } finally {
      setIsGenerating(false);
    }
  }, [contentType, excludeId, slugOptions, manuallyEdited]);

  // Validate current slug
  const validateCurrentSlug = useCallback(async (currentSlug: string) => {
    if (!validationEnabled || !currentSlug) {
      setValidation(null);
      return;
    }

    try {
      const seoValidation = validateSlugSEO(currentSlug);
      setValidation(seoValidation);
    } catch (error) {
      logger.error('Error validating slug', 'SLUG_HOOK', { slug: currentSlug, error });
      setValidation({
        isValid: false,
        errors: ['Validation failed'],
        warnings: [],
        suggestions: [],
        score: 0
      });
    }
  }, [validationEnabled]);

  // Auto-generate slug when source text changes
  useEffect(() => {
    if (autoGenerate && debouncedSourceText) {
      generateSlugFromSource(debouncedSourceText);
    }
  }, [debouncedSourceText, autoGenerate, generateSlugFromSource]);

  // Validate slug when it changes
  useEffect(() => {
    if (debouncedSlug) {
      validateCurrentSlug(debouncedSlug);
    }
  }, [debouncedSlug, validateCurrentSlug]);

  // Handle manual slug change
  const handleSlugChange = useCallback((newSlug: string) => {
    setSlug(newSlug);
    setManuallyEdited(true);
  }, []);

  // Reset to auto-generation mode
  const resetToAutoGeneration = useCallback(() => {
    setManuallyEdited(false);
    if (sourceText) {
      generateSlugFromSource(sourceText);
    }
  }, [sourceText, generateSlugFromSource]);

  // Apply a suggestion
  const applySuggestion = useCallback((suggestedSlug: string) => {
    setSlug(suggestedSlug);
    setManuallyEdited(true);
  }, []);

  // Auto-fix current slug
  const autoFix = useCallback(() => {
    if (!slug) return;
    
    const { fixedSlug, changesApplied } = autoFixSlug(slug);
    if (fixedSlug !== slug) {
      setSlug(fixedSlug);
      logger.info('Auto-fixed slug', 'SLUG_HOOK', { 
        original: slug, 
        fixed: fixedSlug, 
        changes: changesApplied 
      });
    }
  }, [slug]);

  return {
    slug,
    setSlug: handleSlugChange,
    isGenerating,
    validation,
    suggestions,
    manuallyEdited,
    resetToAutoGeneration,
    applySuggestion,
    autoFix,
    isValid: validation?.isValid ?? false,
    hasWarnings: (validation?.warnings.length ?? 0) > 0,
    hasErrors: (validation?.errors.length ?? 0) > 0
  };
}

/**
 * Hook for looking up content by ID or slug
 */
export function useSlugLookup<T = any>(
  identifier: string | undefined,
  contentType: ContentType,
  selectFields?: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundBy, setFoundBy] = useState<'id' | 'slug' | null>(null);

  const debouncedIdentifier = useDebounce(identifier, 300);

  useEffect(() => {
    if (!debouncedIdentifier) {
      setData(null);
      setError(null);
      setFoundBy(null);
      return;
    }

    const performLookup = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await lookupByIdOrSlug<T>(
          debouncedIdentifier,
          contentType,
          selectFields
        );

        setData(result.data);
        setFoundBy(result.foundBy);
        setError(result.error || null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lookup failed';
        setError(errorMessage);
        setData(null);
        setFoundBy(null);
        logger.error('Slug lookup failed', 'SLUG_HOOK', {
          identifier: debouncedIdentifier,
          contentType,
          error: err
        });
      } finally {
        setLoading(false);
      }
    };

    performLookup();
  }, [debouncedIdentifier, contentType, selectFields]);

  const refetch = useCallback(() => {
    if (debouncedIdentifier) {
      slugCacheUtils.clearForContentType(contentType);
      // Re-trigger the lookup by updating a dependency
      setLoading(true);
    }
  }, [debouncedIdentifier, contentType]);

  return {
    data,
    loading,
    error,
    foundBy,
    refetch,
    isFound: data !== null,
    isEmpty: !loading && !data && !error
  };
}

/**
 * Hook for batch slug operations
 */
export function useBatchSlugOperations(
  contentType: ContentType
) {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Array<{
    originalText: string;
    slug: string;
    id?: string;
    status: 'success' | 'error';
    error?: string;
  }>>([]);

  const generateBatch = useCallback(async (
    items: Array<{ text: string; id?: string }>,
    options: SlugOptions = {}
  ) => {
    setProcessing(true);
    setResults([]);

    try {
      const { generateMultipleSlugs } = await import('./slugUtils');
      const slugResults = await generateMultipleSlugs(items, contentType, options);
      
      const processedResults = slugResults.map(result => ({
        ...result,
        status: 'success' as const
      }));
      
      setResults(processedResults);
      return processedResults;
    } catch (error) {
      logger.error('Batch slug generation failed', 'SLUG_HOOK', { error });
      const errorResults = items.map(item => ({
        originalText: item.text,
        slug: '',
        id: item.id,
        status: 'error' as const,
        error: 'Failed to generate slug'
      }));
      setResults(errorResults);
      return errorResults;
    } finally {
      setProcessing(false);
    }
  }, [contentType]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    generateBatch,
    processing,
    results,
    clearResults,
    hasResults: results.length > 0,
    successCount: results.filter(r => r.status === 'success').length,
    errorCount: results.filter(r => r.status === 'error').length
  };
}

/**
 * Hook for slug cache management
 */
export function useSlugCache() {
  const [stats, setStats] = useState({ size: 0, types: [] as ContentType[] });

  const refreshStats = useCallback(() => {
    const currentStats = slugCacheUtils.getStats();
    setStats(currentStats);
  }, []);

  useEffect(() => {
    refreshStats();
    
    // Refresh stats periodically
    const interval = setInterval(refreshStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  const clearAll = useCallback(() => {
    slugCacheUtils.clearAll();
    refreshStats();
  }, [refreshStats]);

  const clearForType = useCallback((contentType: ContentType) => {
    slugCacheUtils.clearForContentType(contentType);
    refreshStats();
  }, [refreshStats]);

  const preloadSlugs = useCallback(async (
    contentType: ContentType, 
    limit = 100
  ) => {
    await slugCacheUtils.preloadSlugs(contentType, limit);
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    clearAll,
    clearForType,
    preloadSlugs,
    refreshStats
  };
}

/**
 * Hook for real-time slug availability checking
 */
export function useSlugAvailability(
  slug: string,
  contentType: ContentType,
  excludeId?: string
) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  
  const debouncedSlug = useDebounce(slug, 500);

  useEffect(() => {
    if (!debouncedSlug) {
      setIsAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setChecking(true);
      
      try {
        const { checkSlugExists } = await import('./slugUtils');
        const exists = await checkSlugExists(debouncedSlug, contentType, excludeId);
        setIsAvailable(!exists);
      } catch (error) {
        logger.error('Error checking slug availability', 'SLUG_HOOK', {
          slug: debouncedSlug,
          contentType,
          error
        });
        setIsAvailable(null);
      } finally {
        setChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedSlug, contentType, excludeId]);

  return {
    isAvailable,
    checking,
    hasChecked: isAvailable !== null
  };
}

/**
 * Hook for parsing and validating route parameters
 */
export function useRouteSlugParam(param: string | undefined) {
  const parsed = useMemo(() => {
    if (!param) return null;
    return parseIdentifier(param);
  }, [param]);

  return {
    parsed,
    isId: parsed?.type === 'id',
    isSlug: parsed?.type === 'slug',
    value: parsed?.value,
    confidence: parsed?.confidence,
    isValid: !!parsed && parsed.confidence !== 'low'
  };
}