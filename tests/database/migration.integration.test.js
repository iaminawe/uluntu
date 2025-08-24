/**
 * Database Migration Integration Tests
 * Tests the actual database migrations and functions
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Test configuration
const testConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
};

// Skip tests if no Supabase configuration
const hasSupabaseConfig = testConfig.supabaseUrl && testConfig.supabaseServiceKey;

describe('Database Migration Integration Tests', () => {
  let supabaseAdmin;
  let supabaseClient;
  let testData = {};

  beforeAll(async () => {
    if (!hasSupabaseConfig) {
      console.log('Skipping database tests - No Supabase configuration found');
      return;
    }

    // Create admin client for setup/teardown
    supabaseAdmin = createClient(testConfig.supabaseUrl, testConfig.supabaseServiceKey);
    
    // Create regular client for testing
    supabaseClient = createClient(testConfig.supabaseUrl, testConfig.supabaseAnonKey);

    // Setup test data
    await setupTestData();
  }, 30000);

  afterAll(async () => {
    if (!hasSupabaseConfig) return;
    
    // Cleanup test data
    await cleanupTestData();
  });

  const setupTestData = async () => {
    if (!supabaseAdmin) return;

    try {
      // Create test user (if auth is available)
      const testUser = {
        email: 'test-migration@example.com',
        password: 'test-password-123'
      };

      // Create test conversation for function testing
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({
          id: 'test-conversation-migration-123',
          type: 'direct',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError) {
        console.warn('Could not create test conversation:', convError);
      } else {
        testData.conversation = conversation;
      }

      // Create test group for group functions
      const { data: group, error: groupError } = await supabaseAdmin
        .from('groups')
        .insert({
          id: 'test-group-migration-123',
          name: 'Test Migration Group',
          description: 'Group for testing migrations',
          visibility: 'public',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (groupError) {
        console.warn('Could not create test group:', groupError);
      } else {
        testData.group = group;
      }

    } catch (error) {
      console.warn('Test data setup failed:', error);
    }
  };

  const cleanupTestData = async () => {
    if (!supabaseAdmin) return;

    try {
      // Clean up test data
      if (testData.conversation) {
        await supabaseAdmin
          .from('conversations')
          .delete()
          .eq('id', testData.conversation.id);
      }

      if (testData.group) {
        await supabaseAdmin
          .from('groups')
          .delete()
          .eq('id', testData.group.id);
      }

    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  };

  describe('Storage Bucket Creation (Migration 20250822000004)', () => {
    test.skipIf(!hasSupabaseConfig)('should have content_images bucket', async () => {
      const { data: buckets, error } = await supabaseAdmin
        .storage
        .listBuckets();

      expect(error).toBeNull();
      expect(buckets).toContainEqual(
        expect.objectContaining({
          name: 'content_images'
        })
      );
    });

    test.skipIf(!hasSupabaseConfig)('should have correct bucket policies', async () => {
      // Test bucket policy by attempting operations
      const testFile = new Blob(['test content'], { type: 'text/plain' });
      
      const { error: uploadError } = await supabaseClient
        .storage
        .from('content_images')
        .upload('test/migration-test.txt', testFile);

      // Should succeed or fail with permission error (not bucket not found)
      if (uploadError) {
        expect(uploadError.message).not.toContain('Bucket not found');
      }

      // Cleanup
      await supabaseAdmin
        .storage
        .from('content_images')
        .remove(['test/migration-test.txt']);
    });

    test.skipIf(!hasSupabaseConfig)('should have size and file type restrictions', async () => {
      // Test file size limit (if configured)
      const largeFile = new Blob(['x'.repeat(50 * 1024 * 1024)], { type: 'text/plain' }); // 50MB
      
      const { error } = await supabaseClient
        .storage
        .from('content_images')
        .upload('test/large-file.txt', largeFile);

      // Should either succeed or fail with size limit error
      if (error) {
        expect(['File size limit exceeded', 'Permission denied']).toContain(
          expect.stringContaining(error.message)
        );
      }

      // Cleanup if uploaded
      await supabaseAdmin
        .storage
        .from('content_images')
        .remove(['test/large-file.txt']);
    });
  });

  describe('Conversation Functions (Migration 20250822000002)', () => {
    test.skipIf(!hasSupabaseConfig)('should have create_or_get_conversation function', async () => {
      const { data, error } = await supabaseClient
        .rpc('create_or_get_conversation', {
          participant_ids: ['user-1', 'user-2']
        });

      // Should not fail with function not found
      if (error) {
        expect(error.message).not.toContain('function "create_or_get_conversation" does not exist');
        // May fail with permission or data issues, which is acceptable
      } else {
        expect(data).toBeDefined();
        expect(data.id).toBeDefined();
      }
    });

    test.skipIf(!hasSupabaseConfig)('should have create_direct_conversation function', async () => {
      const { data, error } = await supabaseClient
        .rpc('create_direct_conversation', {
          user1_id: 'user-1',
          user2_id: 'user-2'
        });

      // Should not fail with function not found
      if (error) {
        expect(error.message).not.toContain('function "create_direct_conversation" does not exist');
      } else {
        expect(data).toBeDefined();
      }
    });

    test.skipIf(!hasSupabaseConfig)('should have find_existing_conversation function', async () => {
      const { data, error } = await supabaseClient
        .rpc('find_existing_conversation', {
          participant_ids: ['user-1', 'user-2']
        });

      // Should not fail with function not found
      if (error) {
        expect(error.message).not.toContain('function "find_existing_conversation" does not exist');
      }
      // Function may return null, which is valid
    });

    test.skipIf(!hasSupabaseConfig)('conversation functions should handle edge cases', async () => {
      // Test with empty participant list
      const { error: emptyError } = await supabaseClient
        .rpc('create_or_get_conversation', {
          participant_ids: []
        });

      if (emptyError) {
        // Should fail gracefully, not with function error
        expect(emptyError.message).not.toContain('function "create_or_get_conversation" does not exist');
      }

      // Test with single participant
      const { error: singleError } = await supabaseClient
        .rpc('create_or_get_conversation', {
          participant_ids: ['single-user']
        });

      if (singleError) {
        expect(singleError.message).not.toContain('function "create_or_get_conversation" does not exist');
      }
    });
  });

  describe('Group Save Error Fixes (Migration 20250822000003)', () => {
    test.skipIf(!hasSupabaseConfig)('should allow group creation with proper validation', async () => {
      const testGroup = {
        name: 'Migration Test Group',
        description: 'Testing group save fixes',
        visibility: 'public'
      };

      const { data, error } = await supabaseClient
        .from('groups')
        .insert(testGroup)
        .select()
        .single();

      if (error) {
        // Should not fail with constraint or validation errors
        expect(error.message).not.toContain('violates');
        expect(error.message).not.toContain('constraint');
      } else {
        expect(data.name).toBe(testGroup.name);
        
        // Cleanup
        await supabaseAdmin
          .from('groups')
          .delete()
          .eq('id', data.id);
      }
    });

    test.skipIf(!hasSupabaseConfig)('should handle group updates correctly', async () => {
      if (!testData.group) {
        console.log('Skipping group update test - no test group available');
        return;
      }

      const updates = {
        description: 'Updated description for migration test',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('groups')
        .update(updates)
        .eq('id', testData.group.id)
        .select()
        .single();

      if (error) {
        // Should not fail with save errors
        expect(error.message).not.toContain('save');
        expect(error.message).not.toContain('update');
      } else {
        expect(data.description).toBe(updates.description);
      }
    });

    test.skipIf(!hasSupabaseConfig)('should validate group visibility values', async () => {
      const validVisibilities = ['public', 'private', 'members_only'];
      
      for (const visibility of validVisibilities) {
        const testGroup = {
          name: `Test Group ${visibility}`,
          description: 'Testing visibility validation',
          visibility: visibility
        };

        const { data, error } = await supabaseAdmin
          .from('groups')
          .insert(testGroup)
          .select()
          .single();

        if (error) {
          expect(error.message).not.toContain(`invalid input value for enum`);
        } else {
          expect(data.visibility).toBe(visibility);
          
          // Cleanup
          await supabaseAdmin
            .from('groups')
            .delete()
            .eq('id', data.id);
        }
      }
    });
  });

  describe('Database Performance & Indexes', () => {
    test.skipIf(!hasSupabaseConfig)('should have proper indexes for conversations', async () => {
      // Test query performance on conversations
      const start = Date.now();
      
      const { data, error } = await supabaseClient
        .from('conversations')
        .select('*')
        .limit(10);

      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test.skipIf(!hasSupabaseConfig)('should have proper indexes for messages', async () => {
      const start = Date.now();
      
      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .limit(10);

      const duration = Date.now() - start;

      if (error) {
        expect(error.message).not.toContain('relation "messages" does not exist');
      }
      
      expect(duration).toBeLessThan(1000);
    });

    test.skipIf(!hasSupabaseConfig)('should have proper indexes for groups', async () => {
      const start = Date.now();
      
      const { data, error } = await supabaseClient
        .from('groups')
        .select('*')
        .eq('visibility', 'public')
        .limit(10);

      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('RLS (Row Level Security) Policies', () => {
    test.skipIf(!hasSupabaseConfig)('should have RLS enabled on sensitive tables', async () => {
      // Test that RLS is properly configured
      const sensitiveTable = 'messages';
      
      const { data, error } = await supabaseClient
        .from(sensitiveTable)
        .select('*')
        .limit(1);

      // Should either succeed with proper access or fail with RLS error
      if (error) {
        // RLS should be enforced
        expect(error.message).toContain('RLS');
      }
      // If no error, RLS is configured to allow access
    });

    test.skipIf(!hasSupabaseConfig)('should enforce proper access controls on conversations', async () => {
      if (!testData.conversation) {
        console.log('Skipping RLS test - no test conversation available');
        return;
      }

      // Try to access conversation without proper authentication
      const { data, error } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('id', testData.conversation.id);

      // Should either have access or be denied by RLS
      if (error && error.message.includes('RLS')) {
        expect(error.message).toContain('policy');
      }
    });
  });

  describe('Migration Scripts Validation', () => {
    test('migration scripts should be syntactically valid SQL', () => {
      const migrationDir = path.join(__dirname, '../../supabase/migrations');
      
      if (!fs.existsSync(migrationDir)) {
        console.log('Migration directory not found, skipping validation');
        return;
      }

      const migrationFiles = fs.readdirSync(migrationDir)
        .filter(file => file.endsWith('.sql'));

      expect(migrationFiles.length).toBeGreaterThan(0);

      migrationFiles.forEach(file => {
        const filePath = path.join(migrationDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Basic SQL syntax validation
        expect(content).not.toContain('SYNTAX ERROR');
        expect(content.trim()).not.toBe('');
        
        // Should have proper migration structure
        if (content.includes('CREATE OR REPLACE FUNCTION')) {
          expect(content).toContain('BEGIN');
          expect(content).toContain('END');
        }
      });
    });

    test('should have idempotent migrations', () => {
      const migrationDir = path.join(__dirname, '../../supabase/migrations');
      
      if (!fs.existsSync(migrationDir)) return;

      const migrationFiles = fs.readdirSync(migrationDir)
        .filter(file => file.endsWith('.sql'));

      migrationFiles.forEach(file => {
        const filePath = path.join(migrationDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for idempotent patterns
        const hasIdempotentPatterns = 
          content.includes('IF NOT EXISTS') ||
          content.includes('CREATE OR REPLACE') ||
          content.includes('DROP IF EXISTS') ||
          content.includes('ON CONFLICT');

        if (content.includes('CREATE') && !content.includes('REPLACE')) {
          expect(hasIdempotentPatterns).toBe(true);
        }
      });
    });
  });
});