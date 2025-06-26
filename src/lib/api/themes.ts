import { supabase } from '@/lib/supabase';
import type { 
  Theme, 
  ThemeConfiguration, 
  ThemeAsset, 
  ThemeMetadata,
  CompleteTheme,
  ThemeFormData,
  ThemeConfigFormData,
  ThemeMetadataFormData,
  AssetUploadData,
  ConfigType
} from '@/types/theme';

// Transform raw database response to CompleteTheme
function transformThemeData(rawTheme: any): CompleteTheme | null {
  if (!rawTheme) return null;
  
  return {
    ...rawTheme,
    configurations: (rawTheme.configurations || []).map((config: any) => ({
      ...config,
      config_type: config.config_type as ConfigType
    })),
    assets: rawTheme.assets || [],
    metadata: Array.isArray(rawTheme.metadata) ? rawTheme.metadata[0] : rawTheme.metadata
  };
}

export const themesApi = {
  // Theme CRUD operations
  async getThemes() {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getActiveTheme(): Promise<{ data: CompleteTheme | null; error: any }> {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        configurations:theme_configurations(*),
        assets:theme_assets(*),
        metadata:theme_metadata(*)
      `)
      .eq('is_active', true)
      .single();

    return { data: transformThemeData(data), error };
  },

  async getThemeBySlug(slug: string): Promise<{ data: CompleteTheme | null; error: any }> {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        configurations:theme_configurations(*),
        assets:theme_assets(*),
        metadata:theme_metadata(*)
      `)
      .eq('slug', slug)
      .single();

    return { data: transformThemeData(data), error };
  },

  async getThemeById(id: string): Promise<{ data: CompleteTheme | null; error: any }> {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        configurations:theme_configurations(*),
        assets:theme_assets(*),
        metadata:theme_metadata(*)
      `)
      .eq('id', id)
      .single();

    return { data: transformThemeData(data), error };
  },

  async createTheme(data: ThemeFormData) {
    const { data: theme, error } = await supabase
      .from('themes')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        is_active: data.is_active || false,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    return { data: theme, error };
  },

  async updateTheme(id: string, data: Partial<ThemeFormData>) {
    const { data: theme, error } = await supabase
      .from('themes')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { data: theme, error };
  },

  async deleteTheme(id: string) {
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id)
      .eq('is_preset', false); // Prevent deletion of preset themes

    return { error };
  },

  async activateTheme(id: string) {
    const { data, error } = await supabase
      .from('themes')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Theme configuration operations
  async getThemeConfiguration(themeId: string, configType: ConfigType) {
    const { data, error } = await supabase
      .from('theme_configurations')
      .select('*')
      .eq('theme_id', themeId)
      .eq('config_type', configType)
      .single();

    return { data, error };
  },

  async updateThemeConfiguration(
    themeId: string, 
    configType: ConfigType, 
    configData: Record<string, any>
  ) {
    const { data, error } = await supabase
      .from('theme_configurations')
      .upsert({
        theme_id: themeId,
        config_type: configType,
        config_data: configData
      })
      .select()
      .single();

    return { data, error };
  },

  async updateAllThemeConfigurations(themeId: string, configurations: ThemeConfigFormData) {
    const updates = [];
    
    for (const [configType, configData] of Object.entries(configurations)) {
      if (configData && Object.keys(configData).length > 0) {
        updates.push(
          this.updateThemeConfiguration(themeId, configType as ConfigType, configData)
        );
      }
    }

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error).map(r => r.error);
    
    return { 
      success: errors.length === 0, 
      errors: errors.length > 0 ? errors : null 
    };
  },

  // Theme asset operations
  async uploadThemeAsset(themeId: string, uploadData: AssetUploadData) {
    const fileName = `${themeId}/${uploadData.asset_type}_${Date.now()}.${uploadData.file.name.split('.').pop()}`;
    
    // Upload file to storage
    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from('theme-assets')
      .upload(fileName, uploadData.file, {
        upsert: true
      });

    if (uploadError) {
      return { error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('theme-assets')
      .getPublicUrl(fileName);

    // Get image dimensions if it's an image
    let width, height;
    if (uploadData.file.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(uploadData.file);
      width = dimensions.width;
      height = dimensions.height;
    }

    // Save asset record
    const { data: asset, error: assetError } = await supabase
      .from('theme_assets')
      .upsert({
        theme_id: themeId,
        asset_type: uploadData.asset_type,
        file_path: fileName,
        file_url: publicUrl,
        file_size: uploadData.file.size,
        mime_type: uploadData.file.type,
        width,
        height,
        alt_text: uploadData.alt_text
      })
      .select()
      .single();

    return { data: asset, error: assetError };
  },

  async deleteThemeAsset(assetId: string) {
    // Get asset details first
    const { data: asset, error: fetchError } = await supabase
      .from('theme_assets')
      .select('file_path')
      .eq('id', assetId)
      .single();

    if (fetchError) {
      return { error: fetchError };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('theme-assets')
      .remove([asset.file_path]);

    if (storageError) {
      return { error: storageError };
    }

    // Delete record
    const { error } = await supabase
      .from('theme_assets')
      .delete()
      .eq('id', assetId);

    return { error };
  },

  // Theme metadata operations
  async updateThemeMetadata(themeId: string, metadata: ThemeMetadataFormData) {
    const { data, error } = await supabase
      .from('theme_metadata')
      .upsert({
        theme_id: themeId,
        ...metadata
      })
      .select()
      .single();

    return { data, error };
  },

  // Duplicate theme
  async duplicateTheme(sourceThemeId: string, newName: string, newSlug: string) {
    // Get source theme with all data
    const { data: sourceTheme, error: fetchError } = await this.getThemeById(sourceThemeId);
    
    if (fetchError || !sourceTheme) {
      return { error: fetchError || 'Theme not found' };
    }

    // Create new theme
    const { data: newTheme, error: createError } = await this.createTheme({
      name: newName,
      slug: newSlug,
      description: `Duplicated from ${sourceTheme.name}`
    });

    if (createError || !newTheme) {
      return { error: createError };
    }

    // Copy configurations
    if (sourceTheme.configurations) {
      for (const config of sourceTheme.configurations) {
        await supabase
          .from('theme_configurations')
          .insert({
            theme_id: newTheme.id,
            config_type: config.config_type,
            config_data: config.config_data
          });
      }
    }

    // Copy metadata
    if (sourceTheme.metadata) {
      const { id, theme_id, created_at, updated_at, ...metadataFields } = sourceTheme.metadata;
      await supabase
        .from('theme_metadata')
        .insert({
          theme_id: newTheme.id,
          ...metadataFields
        });
    }

    // Note: Assets are not copied as they would need to be duplicated in storage

    return { data: newTheme, error: null };
  },

  // Export theme configuration
  async exportTheme(themeId: string) {
    const { data: theme, error } = await this.getThemeById(themeId);
    
    if (error || !theme) {
      return { error: error || 'Theme not found' };
    }

    // Remove system fields and IDs for export
    const exportData = {
      name: theme.name,
      slug: theme.slug,
      description: theme.description,
      configurations: theme.configurations.reduce((acc, config) => {
        acc[config.config_type] = config.config_data;
        return acc;
      }, {} as Record<string, any>),
      metadata: theme.metadata ? {
        site_name: theme.metadata.site_name,
        site_tagline: theme.metadata.site_tagline,
        site_description: theme.metadata.site_description,
        contact_email: theme.metadata.contact_email,
        social_links: theme.metadata.social_links,
        custom_css: theme.metadata.custom_css,
        custom_head_html: theme.metadata.custom_head_html,
        custom_body_html: theme.metadata.custom_body_html,
        meta_tags: theme.metadata.meta_tags
      } : null
    };

    return { data: exportData, error: null };
  },

  // Import theme configuration
  async importTheme(themeData: any, activate = false) {
    // Create theme
    const { data: theme, error: createError } = await this.createTheme({
      name: themeData.name,
      slug: themeData.slug,
      description: themeData.description,
      is_active: activate
    });

    if (createError || !theme) {
      return { error: createError };
    }

    // Import configurations
    if (themeData.configurations) {
      await this.updateAllThemeConfigurations(theme.id, themeData.configurations);
    }

    // Import metadata
    if (themeData.metadata) {
      await this.updateThemeMetadata(theme.id, themeData.metadata);
    }

    return { data: theme, error: null };
  }
};

// Helper function to get image dimensions
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = URL.createObjectURL(file);
  });
}