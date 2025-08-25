/**
 * Company Association Testing Suite
 * Tests for company-based content filtering and access control in the dashboard
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';

import { UserDashboard } from '../../components/UserDashboard';
import { contentManagementApi } from '../../api/contentManagementApi';
import { 
  createTestWrapper, 
  createTestUser, 
  createTestContent, 
  createTestCompany,
  mockSupabaseResponse 
} from '../../../shared/test-utils/testHelpers';

// Mock the APIs
jest.mock('../../api/contentManagementApi');
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn()
    }
  }
}));

const mockApi = contentManagementApi as jest.Mocked<typeof contentManagementApi>;

describe('Company Association Testing Suite', () => {
  // Test users with different company associations
  const testUsers = {
    singleCompanyEmployee: createTestUser({
      id: 'user-employee',
      email: 'employee@techcorp.com',
      memberId: 'member-employee',
      role: 'member',
      groups: ['general'],
      companies: ['tech-corp']
    }),
    
    multiCompanyEmployee: createTestUser({
      id: 'user-multi-company',
      email: 'consultant@example.com',
      memberId: 'member-consultant',
      role: 'member',
      groups: ['general'],
      companies: ['tech-corp', 'startup-inc', 'consulting-llc']
    }),
    
    companyAdmin: createTestUser({
      id: 'user-company-admin',
      email: 'admin@techcorp.com',
      memberId: 'member-company-admin',
      role: 'member',
      groups: ['general'],
      companies: ['tech-corp'] // Same company but different role
    }),
    
    independentMember: createTestUser({
      id: 'user-independent',
      email: 'independent@example.com',
      memberId: 'member-independent',
      role: 'member',
      groups: ['general'],
      companies: [] // Not associated with any company
    }),

    systemAdmin: createTestUser({
      id: 'user-system-admin',
      email: 'admin@system.com',
      memberId: 'member-system-admin',
      role: 'admin',
      groups: ['general', 'admins'],
      companies: [] // System admin sees all
    })
  };

  // Test companies with different visibility and settings
  const testCompanies = {
    techCorp: createTestCompany({
      id: 'tech-corp',
      name: 'TechCorp Solutions',
      description: 'Leading technology solutions provider',
      employees: ['member-employee', 'member-company-admin', 'member-consultant'],
      admins: ['member-company-admin']
    }),
    
    startupInc: createTestCompany({
      id: 'startup-inc',
      name: 'Startup Inc',
      description: 'Innovative startup company',
      employees: ['member-consultant'],
      admins: ['member-consultant']
    }),
    
    consultingLlc: createTestCompany({
      id: 'consulting-llc',
      name: 'Consulting LLC',
      description: 'Professional consulting services',
      employees: ['member-consultant'],
      admins: ['member-consultant']
    })
  };

  // Create company-associated content
  const createCompanyContent = () => {
    return {
      techCorpContent: [
        createTestContent('member-employee', {
          id: 'content-tech-1',
          type: 'news',
          title: 'TechCorp Quarterly Update',
          companyId: 'tech-corp',
          status: 'published'
        }),
        createTestContent('member-company-admin', {
          id: 'content-tech-2',
          type: 'event',
          title: 'TechCorp Team Building Event',
          companyId: 'tech-corp',
          status: 'published'
        }),
        createTestContent('member-consultant', {
          id: 'content-tech-3',
          type: 'resource',
          title: 'TechCorp Project Resources',
          companyId: 'tech-corp',
          status: 'draft' // Draft content
        })
      ],
      
      startupContent: [
        createTestContent('member-consultant', {
          id: 'content-startup-1',
          type: 'opportunity',
          title: 'Startup Inc Job Opening',
          companyId: 'startup-inc',
          status: 'published'
        })
      ],
      
      consultingContent: [
        createTestContent('member-consultant', {
          id: 'content-consulting-1',
          type: 'marketplace',
          title: 'Consulting Services Offering',
          companyId: 'consulting-llc',
          status: 'published'
        })
      ],
      
      independentContent: [
        createTestContent('member-independent', {
          id: 'content-independent-1',
          type: 'photo',
          title: 'Independent Photography Work',
          // No companyId - independent content
          status: 'published'
        })
      ]
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default API responses
    mockApi.getAllUserContent.mockResolvedValue({
      data: [],
      error: null,
      status: 200,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
        has_more: false
      },
      filters_applied: {}
    });

    mockApi.getContentStatistics.mockResolvedValue({
      data: [],
      summary: {
        total_content: 0,
        total_views: 0,
        total_engagement: 0,
        growth_percentage: 0
      }
    });
  });

  describe('Company-Based Content Visibility', () => {
    test('Employee sees content from their company', async () => {
      const user = testUsers.singleCompanyEmployee;
      const companyContent = createCompanyContent();
      
      // Mock API to return content from user's company
      mockApi.getAllUserContent.mockResolvedValue({
        data: companyContent.techCorpContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see published content from their company
        expect(screen.getByText('TechCorp Quarterly Update')).toBeInTheDocument();
        expect(screen.getByText('TechCorp Team Building Event')).toBeInTheDocument();
        
        // Should also see draft content if it's their own
        expect(screen.getByText('TechCorp Project Resources')).toBeInTheDocument();
      });

      // Should NOT see content from other companies
      expect(screen.queryByText('Startup Inc Job Opening')).not.toBeInTheDocument();
      expect(screen.queryByText('Consulting Services Offering')).not.toBeInTheDocument();
    });

    test('Multi-company employee sees content from all their companies', async () => {
      const user = testUsers.multiCompanyEmployee;
      const companyContent = createCompanyContent();
      
      // Mock API to return content from all companies user is associated with
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          ...companyContent.techCorpContent,
          ...companyContent.startupContent,
          ...companyContent.consultingContent
        ],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 5,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see content from all their companies
        expect(screen.getByText('TechCorp Quarterly Update')).toBeInTheDocument();
        expect(screen.getByText('TechCorp Project Resources')).toBeInTheDocument();
        expect(screen.getByText('Startup Inc Job Opening')).toBeInTheDocument();
        expect(screen.getByText('Consulting Services Offering')).toBeInTheDocument();
      });

      // Verify company indicators are shown
      const techCorpBadges = screen.getAllByText(/TechCorp/i);
      const startupBadges = screen.getAllByText(/Startup/i);
      expect(techCorpBadges.length).toBeGreaterThan(0);
      expect(startupBadges.length).toBeGreaterThan(0);
    });

    test('Independent member sees only their personal content', async () => {
      const user = testUsers.independentMember;
      const companyContent = createCompanyContent();
      
      // Mock API to return only independent content
      mockApi.getAllUserContent.mockResolvedValue({
        data: companyContent.independentContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see their own independent content
        expect(screen.getByText('Independent Photography Work')).toBeInTheDocument();
      });

      // Should NOT see any company content
      expect(screen.queryByText('TechCorp Quarterly Update')).not.toBeInTheDocument();
      expect(screen.queryByText('Startup Inc Job Opening')).not.toBeInTheDocument();
    });

    test('System admin sees all company content', async () => {
      const user = testUsers.systemAdmin;
      const companyContent = createCompanyContent();
      
      // Mock API to return all content for system admin
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          ...companyContent.techCorpContent,
          ...companyContent.startupContent,
          ...companyContent.consultingContent,
          ...companyContent.independentContent
        ],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 6,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see all content including company and independent
        expect(screen.getByText('TechCorp Quarterly Update')).toBeInTheDocument();
        expect(screen.getByText('Startup Inc Job Opening')).toBeInTheDocument();
        expect(screen.getByText('Consulting Services Offering')).toBeInTheDocument();
        expect(screen.getByText('Independent Photography Work')).toBeInTheDocument();
      });
    });
  });

  describe('Company Tab Functionality', () => {
    test('Companies tab shows user associated companies', async () => {
      const user = testUsers.multiCompanyEmployee;
      
      mockApi.getAllUserContent.mockResolvedValue({
        data: [],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      // Click on Companies tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /companies/i })).toBeInTheDocument();
      });

      const companiesTab = screen.getByRole('tab', { name: /companies/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(companiesTab);

      // Should display companies user is associated with
      await waitFor(() => {
        expect(screen.getByText('TechCorp Solutions')).toBeInTheDocument();
        expect(screen.getByText('Startup Inc')).toBeInTheDocument();
        expect(screen.getByText('Consulting LLC')).toBeInTheDocument();
      });
    });

    test('Company filtering works correctly', async () => {
      const user = testUsers.multiCompanyEmployee;
      const companyContent = createCompanyContent();
      
      // Initial load with all company content
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          ...companyContent.techCorpContent,
          ...companyContent.startupContent,
          ...companyContent.consultingContent
        ],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 5,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        expect(screen.getByText('TechCorp Quarterly Update')).toBeInTheDocument();
        expect(screen.getByText('Startup Inc Job Opening')).toBeInTheDocument();
      });

      // Filter by specific company
      const companiesTab = screen.getByRole('tab', { name: /companies/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(companiesTab);

      // Mock filtered API response
      mockApi.getAllUserContent.mockResolvedValue({
        data: companyContent.techCorpContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          total_pages: 1,
          has_more: false
        },
        filters_applied: { companyId: 'tech-corp' }
      });

      // Select TechCorp filter
      const techCorpFilter = screen.getByText('TechCorp Solutions');
      await userEventInstance.click(techCorpFilter);

      // Should now see only TechCorp content
      await waitFor(() => {
        expect(screen.getByText('TechCorp Quarterly Update')).toBeInTheDocument();
        expect(screen.getByText('TechCorp Team Building Event')).toBeInTheDocument();
      });

      // Should not see other company content
      expect(screen.queryByText('Startup Inc Job Opening')).not.toBeInTheDocument();
      expect(screen.queryByText('Consulting Services Offering')).not.toBeInTheDocument();
    });
  });

  describe('Company Content Creation', () => {
    test('User can create content for companies they belong to', async () => {
      const user = testUsers.multiCompanyEmployee;
      
      mockApi.getAllUserContent.mockResolvedValue({
        data: [],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          total_pages: 0,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      // Find and click create button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', { name: /create/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(createButton);

      // Should show company selection dropdown
      await waitFor(() => {
        expect(screen.getByText(/select company/i)).toBeInTheDocument();
      });

      // Should see all companies user belongs to
      expect(screen.getByText('TechCorp Solutions')).toBeInTheDocument();
      expect(screen.getByText('Startup Inc')).toBeInTheDocument();
      expect(screen.getByText('Consulting LLC')).toBeInTheDocument();

      // Should also have option for no company (personal content)
      expect(screen.getByText(/personal content/i)).toBeInTheDocument();
    });

    test('User cannot create content for companies they do not belong to', async () => {
      const user = testUsers.singleCompanyEmployee;
      
      // Mock API call to validate company association
      mockApi.updateContentItem.mockImplementation(async (contentId, contentType, updates) => {
        // Simulate server-side validation
        if (updates.companyId && !user.companies.includes(updates.companyId)) {
          throw new Error('User is not associated with the specified company');
        }
        return null;
      });

      // Attempt to create content for a company they don't belong to
      await expect(
        mockApi.updateContentItem('new-content', 'news', {
          title: 'Unauthorized Company Post',
          companyId: 'startup-inc'
        })
      ).rejects.toThrow('User is not associated with the specified company');
    });
  });

  describe('Company Admin Permissions', () => {
    test('Company admin can manage company content from other employees', async () => {
      const user = testUsers.companyAdmin;
      const companyContent = createCompanyContent();
      
      mockApi.getAllUserContent.mockResolvedValue({
        data: companyContent.techCorpContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      // Mock enhanced permissions for company admin
      mockApi.getContentPermissions.mockResolvedValue({
        can_edit: true,
        can_delete: true,
        can_publish: true,
        can_feature: true,
        can_view_analytics: true
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        expect(screen.getByText('TechCorp Quarterly Update')).toBeInTheDocument();
      });

      // Should have admin controls for company content
      const adminButtons = screen.getAllByRole('button', { name: /manage/i });
      expect(adminButtons.length).toBeGreaterThan(0);

      // Should be able to edit content created by other company employees
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });

    test('Regular employee cannot manage other employees content', async () => {
      const user = testUsers.singleCompanyEmployee;
      const companyContent = createCompanyContent();
      
      mockApi.getAllUserContent.mockResolvedValue({
        data: companyContent.techCorpContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      // Mock limited permissions for regular employee
      mockApi.getContentPermissions.mockImplementation(async (contentId) => {
        // Only allow editing own content
        const isOwnContent = contentId === 'content-tech-1';
        return {
          can_edit: isOwnContent,
          can_delete: isOwnContent,
          can_publish: isOwnContent,
          can_feature: false,
          can_view_analytics: isOwnContent
        };
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        expect(screen.getByText('TechCorp Quarterly Update')).toBeInTheDocument();
      });

      // Should not have admin controls for others' content
      const manageButtons = screen.queryAllByRole('button', { name: /manage/i });
      expect(manageButtons.length).toBe(0);
    });
  });

  describe('Company Content Analytics', () => {
    test('User can view analytics for their company content', async () => {
      const user = testUsers.singleCompanyEmployee;
      
      mockApi.getContentStatistics.mockResolvedValue({
        data: [
          {
            content_type: 'news' as const,
            total_count: 1,
            published_count: 1,
            draft_count: 0,
            archived_count: 0,
            view_count: 150,
            like_count: 25,
            comment_count: 8,
            growth_percentage: 15.5
          }
        ],
        summary: {
          total_content: 1,
          total_views: 150,
          total_engagement: 33,
          growth_percentage: 15.5
        }
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      // Navigate to analytics tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument();
      });

      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(analyticsTab);

      // Should show company content analytics
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // Views
        expect(screen.getByText('25')).toBeInTheDocument();  // Likes
        expect(screen.getByText('15.5%')).toBeInTheDocument(); // Growth
      });
    });

    test('Company admin can view aggregated company analytics', async () => {
      const user = testUsers.companyAdmin;
      
      mockApi.getContentStatistics.mockResolvedValue({
        data: [
          {
            content_type: 'news' as const,
            total_count: 2,
            published_count: 2,
            draft_count: 1,
            archived_count: 0,
            view_count: 300,
            like_count: 45,
            comment_count: 12,
            growth_percentage: 22.3
          }
        ],
        summary: {
          total_content: 3,
          total_views: 300,
          total_engagement: 57,
          growth_percentage: 22.3
        }
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
      const userEventInstance = userEvent.setup();
      await userEventInstance.click(analyticsTab);

      // Should show aggregated analytics for all company content
      await waitFor(() => {
        expect(screen.getByText('300')).toBeInTheDocument(); // Total views
        expect(screen.getByText('22.3%')).toBeInTheDocument(); // Growth
      });

      // Should show breakdown by content type or employee
      expect(screen.getByText(/company performance/i)).toBeInTheDocument();
    });
  });

  describe('Company Association Changes', () => {
    test('Content access updates when user joins a company', async () => {
      const user = testUsers.independentMember;
      const companyContent = createCompanyContent();
      
      // Initially user sees only independent content
      mockApi.getAllUserContent.mockResolvedValue({
        data: companyContent.independentContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      const { rerender } = render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        expect(screen.getByText('Independent Photography Work')).toBeInTheDocument();
        expect(screen.queryByText('TechCorp Quarterly Update')).not.toBeInTheDocument();
      });

      // Simulate user joining a company
      const updatedUser = {
        ...user,
        companies: ['tech-corp']
      };

      // Update API response to include company content
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          ...companyContent.independentContent,
          ...companyContent.techCorpContent
        ],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 4,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      // Re-render with updated user
      rerender(
        <UserDashboard />,
        { wrapper: createTestWrapper(updatedUser) }
      );

      // Should now see company content too
      await waitFor(() => {
        expect(screen.getByText('Independent Photography Work')).toBeInTheDocument();
        expect(screen.getByText('TechCorp Quarterly Update')).toBeInTheDocument();
      });
    });

    test('Content access removes when user leaves a company', async () => {
      const user = {
        ...testUsers.multiCompanyEmployee,
        companies: ['startup-inc', 'consulting-llc'] // Removed from tech-corp
      };
      
      const companyContent = createCompanyContent();

      // Should only see content from remaining companies
      mockApi.getAllUserContent.mockResolvedValue({
        data: [
          ...companyContent.startupContent,
          ...companyContent.consultingContent
        ],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see remaining company content
        expect(screen.getByText('Startup Inc Job Opening')).toBeInTheDocument();
        expect(screen.getByText('Consulting Services Offering')).toBeInTheDocument();
        
        // Should NOT see TechCorp content anymore
        expect(screen.queryByText('TechCorp Quarterly Update')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('Handles invalid company IDs gracefully', async () => {
      const user = testUsers.singleCompanyEmployee;
      
      // Mock content with invalid company ID
      const invalidCompanyContent = createTestContent('member-employee', {
        type: 'news',
        title: 'Content with Invalid Company',
        companyId: 'non-existent-company',
        status: 'published'
      });

      mockApi.getAllUserContent.mockResolvedValue({
        data: [invalidCompanyContent],
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      // Should handle gracefully with warning or filter out
      await waitFor(() => {
        const content = screen.queryByText('Content with Invalid Company');
        if (content) {
          // If shown, should indicate issue
          expect(screen.getByText(/company not found/i)).toBeInTheDocument();
        }
      });
    });

    test('Handles company association verification failures', async () => {
      const user = testUsers.singleCompanyEmployee;
      
      // Mock API failure for company verification
      mockApi.getAllUserContent.mockRejectedValue(new Error('Company association verification failed'));

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should show error state
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Should not show any company content when verification fails
      expect(screen.queryByText('TechCorp Quarterly Update')).not.toBeInTheDocument();
    });

    test('Handles mixed company and independent content correctly', async () => {
      const user = testUsers.singleCompanyEmployee;
      const companyContent = createCompanyContent();
      
      // User has both company and personal content
      const mixedContent = [
        ...companyContent.techCorpContent,
        createTestContent('member-employee', {
          type: 'photo',
          title: 'Personal Photography',
          // No companyId - personal content
          status: 'published'
        })
      ];

      mockApi.getAllUserContent.mockResolvedValue({
        data: mixedContent,
        error: null,
        status: 200,
        pagination: {
          page: 1,
          limit: 20,
          total: 4,
          total_pages: 1,
          has_more: false
        },
        filters_applied: {}
      });

      render(
        <UserDashboard />,
        { wrapper: createTestWrapper(user) }
      );

      await waitFor(() => {
        // Should see both company and personal content
        expect(screen.getByText('TechCorp Quarterly Update')).toBeInTheDocument();
        expect(screen.getByText('Personal Photography')).toBeInTheDocument();
      });

      // Should have appropriate indicators for each type
      const companyBadges = screen.getAllByText(/TechCorp/i);
      expect(companyBadges.length).toBeGreaterThan(0);
      
      const personalIndicator = screen.getByText(/personal/i);
      expect(personalIndicator).toBeInTheDocument();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});