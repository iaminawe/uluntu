import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { themesApi } from '@/lib/api/themes';
import type { 
  ThemeFormData, 
  ThemeConfigFormData, 
  ThemeMetadataFormData,
  AssetUploadData,
  ConfigType 
} from '@/types/theme';

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const { data, error } = await themesApi.getThemes();
      if (error) throw error;
      return data;
    }
  });
}

export function useActiveTheme() {
  return useQuery({
    queryKey: ['themes', 'active'],
    queryFn: async () => {
      const { data, error } = await themesApi.getActiveTheme();
      if (error) throw error;
      return data;
    }
  });
}

export function useTheme(id: string) {
  return useQuery({
    queryKey: ['themes', id],
    queryFn: async () => {
      const { data, error } = await themesApi.getThemeById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useThemeBySlug(slug: string) {
  return useQuery({
    queryKey: ['themes', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await themesApi.getThemeBySlug(slug);
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });
}

export function useCreateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ThemeFormData) => themesApi.createTheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });
}

export function useUpdateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ThemeFormData> }) =>
      themesApi.updateTheme(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['themes', variables.id] });
    }
  });
}

export function useDeleteTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.deleteTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });
}

export function useActivateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.activateTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['themes', 'active'] });
    }
  });
}

export function useUpdateThemeConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      themeId, 
      configType, 
      configData 
    }: { 
      themeId: string; 
      configType: ConfigType; 
      configData: Record<string, any> 
    }) => themesApi.updateThemeConfiguration(themeId, configType, configData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['themes', variables.themeId] });
    }
  });
}

export function useUpdateAllThemeConfigurations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      themeId, 
      configurations 
    }: { 
      themeId: string; 
      configurations: ThemeConfigFormData 
    }) => themesApi.updateAllThemeConfigurations(themeId, configurations),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['themes', variables.themeId] });
    }
  });
}

export function useUploadThemeAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      themeId, 
      uploadData 
    }: { 
      themeId: string; 
      uploadData: AssetUploadData 
    }) => themesApi.uploadThemeAsset(themeId, uploadData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['themes', variables.themeId] });
    }
  });
}

export function useDeleteThemeAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => themesApi.deleteThemeAsset(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });
}

export function useUpdateThemeMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      themeId, 
      metadata 
    }: { 
      themeId: string; 
      metadata: ThemeMetadataFormData 
    }) => themesApi.updateThemeMetadata(themeId, metadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['themes', variables.themeId] });
    }
  });
}

export function useDuplicateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      sourceThemeId, 
      newName, 
      newSlug 
    }: { 
      sourceThemeId: string; 
      newName: string; 
      newSlug: string 
    }) => themesApi.duplicateTheme(sourceThemeId, newName, newSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });
}

export function useExportTheme() {
  return useMutation({
    mutationFn: (themeId: string) => themesApi.exportTheme(themeId)
  });
}

export function useImportTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      themeData, 
      activate 
    }: { 
      themeData: any; 
      activate?: boolean 
    }) => themesApi.importTheme(themeData, activate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });
}