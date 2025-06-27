import { supabase } from '@/lib/supabase';
import type { OnboardingProgress } from '../types';

export const onboardingApi = {
  /**
   * Get user's onboarding progress
   */
  async getProgress(userId: string): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('onboarding_completed_at, onboarding_current_step, onboarding_skipped_steps, profile_completion_percentage')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        currentStep: (data as any).onboarding_current_step || 1,
        completedSteps: [], // Will be calculated based on current step
        skippedSteps: (data as any).onboarding_skipped_steps || [],
        completionPercentage: (data as any).profile_completion_percentage || 0,
        isCompleted: !!(data as any).onboarding_completed_at,
        lastUpdated: (data as any).onboarding_completed_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get onboarding progress:', error);
      return null;
    }
  },

  /**
   * Update onboarding progress
   */
  async updateProgress(userId: string, progress: Partial<OnboardingProgress>): Promise<boolean> {
    try {
      const updateData: any = {};

      if (progress.currentStep !== undefined) {
        updateData.onboarding_current_step = progress.currentStep;
      }

      if (progress.skippedSteps !== undefined) {
        updateData.onboarding_skipped_steps = progress.skippedSteps;
      }

      if (progress.completionPercentage !== undefined) {
        updateData.profile_completion_percentage = progress.completionPercentage;
      }

      if (progress.isCompleted) {
        updateData.onboarding_completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('members')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to update onboarding progress:', error);
      return false;
    }
  },

  /**
   * Publish member profile (make it visible in directory)
   */
  async publishProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('members')
        .update({ 
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to publish profile:', error);
      return false;
    }
  },

  /**
   * Unpublish member profile (make it private)
   */
  async unpublishProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('members')
        .update({ 
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to unpublish profile:', error);
      return false;
    }
  },

  /**
   * Get member's current profile status
   */
  async getProfileStatus(userId: string): Promise<{ status: string; isPublished: boolean } | null> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('status')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        status: data.status,
        isPublished: data.status === 'published'
      };
    } catch (error) {
      console.error('Failed to get profile status:', error);
      return null;
    }
  },

  /**
   * Check if user needs onboarding
   */
  async needsOnboarding(userId: string): Promise<boolean> {
    try {
      // Get current progress to check if completed
      const progress = await this.getProgress(userId);
      return !progress?.isCompleted;
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // If we can't determine, assume they need onboarding
      return true;
    }
  },

  /**
   * Reset onboarding progress (admin function)
   */
  async resetOnboarding(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('members')
        .update({
          // @ts-expect-error - Onboarding fields exist in database but not in types yet
          onboarding_completed_at: null,
          onboarding_current_step: 1,
          onboarding_skipped_steps: [],
          profile_completion_percentage: 0,
        })
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
      return false;
    }
  },

  /**
   * Get onboarding statistics (admin function)
   */
  async getOnboardingStats(): Promise<{
    totalUsers: number;
    completedOnboarding: number;
    averageCompletionTime: number;
    completionRate: number;
  } | null> {
    try {
      // Get total users
      const { count: totalUsers, error: totalError } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get completed onboarding count
      const { count: completedOnboarding, error: completedError } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .not('onboarding_completed_at', 'is', null);

      if (completedError) throw completedError;

      // Calculate completion rate
      const completionRate = totalUsers ? (completedOnboarding || 0) / totalUsers * 100 : 0;

      return {
        totalUsers: totalUsers || 0,
        completedOnboarding: completedOnboarding || 0,
        averageCompletionTime: 0, // TODO: Calculate from timestamps
        completionRate,
      };
    } catch (error) {
      console.error('Failed to get onboarding stats:', error);
      return null;
    }
  }
};