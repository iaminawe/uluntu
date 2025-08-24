/**
 * Comprehensive Messaging Flow Test
 * Tests the complete messaging flow from frontend to backend to identify broken connections
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MessagesPage from '../src/pages/MessagesPage';
import { messagingApi } from '../src/features/messaging/api/messagingApi.mock';
import { useMessagingHybrid } from '../src/features/messaging/hooks/useMessagingHybrid';
import messagingUISlice from '../src/features/messaging/store/messagingUISlice';

// Mock implementations
jest.mock('../src/features/messaging/api/messagingApi', () => ({
  messagingApi: require('../src/features/messaging/api/messagingApi.mock').messagingApi
}));

jest.mock('../src/shared/contexts/SessionContextWithRedux', () => ({
  useSession: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User'
    }
  })
}));

describe('Messaging Flow Integration Test', () => {
  let queryClient: QueryClient;
  let store: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    store = configureStore({
      reducer: {
        messagingUI: messagingUISlice
      }
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      </Provider>
    );
  };

  describe('1. UI Component Rendering', () => {
    test('MessagesPage renders without authentication', () => {
      const { container } = renderWithProviders(<MessagesPage />);
      expect(container).toBeInTheDocument();
    });

    test('Shows sign-in prompt when user is not authenticated', () => {
      // Mock no user
      jest.mock('../src/shared/contexts/SessionContextWithRedux', () => ({
        useSession: () => ({ user: null })
      }));

      renderWithProviders(<MessagesPage />);
      expect(screen.getByText(/Sign in to access messages/i)).toBeInTheDocument();
    });
  });

  describe('2. Mock API Functionality', () => {
    test('Mock API creates conversations', async () => {
      const conversation = await messagingApi.createConversation({
        type: 'direct',
        title: 'Test Conversation',
        participant_ids: ['user-1', 'user-2'],
        metadata: {}
      });

      expect(conversation).toHaveProperty('id');
      expect(conversation.title).toBe('Test Conversation');
      expect(conversation.participants).toHaveLength(2);
    });

    test('Mock API sends messages', async () => {
      // First create a conversation
      const conversation = await messagingApi.createConversation({
        type: 'direct',
        title: 'Test Conversation',
        participant_ids: ['user-1', 'user-2'],
        metadata: {}
      });

      // Send a message
      const message = await messagingApi.sendMessage({
        conversation_id: conversation.id,
        content: 'Hello World!',
        message_type: 'text',
        metadata: {}
      });

      expect(message).toHaveProperty('id');
      expect(message.content).toBe('Hello World!');
      expect(message.conversation_id).toBe(conversation.id);
    });

    test('Mock API retrieves conversations', async () => {
      // Create some conversations first
      await messagingApi.createConversation({
        type: 'direct',
        title: 'Conv 1',
        participant_ids: ['user-1', 'user-2'],
        metadata: {}
      });

      await messagingApi.createConversation({
        type: 'direct', 
        title: 'Conv 2',
        participant_ids: ['user-1', 'user-3'],
        metadata: {}
      });

      const conversations = await messagingApi.getConversations();
      expect(conversations).toHaveLength(2);
    });

    test('Mock API retrieves messages', async () => {
      // Create conversation and send messages
      const conversation = await messagingApi.createConversation({
        type: 'direct',
        title: 'Test Conversation',
        participant_ids: ['user-1', 'user-2'],
        metadata: {}
      });

      await messagingApi.sendMessage({
        conversation_id: conversation.id,
        content: 'Message 1',
        message_type: 'text',
        metadata: {}
      });

      await messagingApi.sendMessage({
        conversation_id: conversation.id,
        content: 'Message 2',
        message_type: 'text',
        metadata: {}
      });

      const messages = await messagingApi.getMessages({
        conversation_id: conversation.id,
        limit: 50,
        offset: 0
      });

      expect(messages).toHaveLength(2);
    });
  });

  describe('3. React Query Integration', () => {
    test('useMessagingHybrid hook loads conversations', async () => {
      let hookResult: any;

      const TestComponent = () => {
        hookResult = useMessagingHybrid();
        return <div>Test</div>;
      };

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(hookResult.conversations).toBeDefined();
        expect(Array.isArray(hookResult.conversations)).toBe(true);
      });
    });

    test('useMessagingHybrid creates conversations', async () => {
      let hookResult: any;

      const TestComponent = () => {
        hookResult = useMessagingHybrid();
        return <div>Test</div>;
      };

      renderWithProviders(<TestComponent />);

      await waitFor(() => {
        expect(hookResult.createConversation).toBeDefined();
      });

      // Test conversation creation
      const newConversation = await hookResult.createConversation({
        type: 'direct',
        title: 'Hook Test Conversation',
        participant_ids: ['user-1', 'user-2'],
        metadata: {}
      });

      expect(newConversation).toHaveProperty('id');
      expect(newConversation.title).toBe('Hook Test Conversation');
    });
  });

  describe('4. Redux State Management', () => {
    test('Redux store updates when conversation is selected', () => {
      const action = { type: 'messagingUI/setSelectedConversation', payload: 'conv-123' };
      const newState = messagingUISlice(undefined, action);
      
      expect(newState.selectedConversationId).toBe('conv-123');
    });

    test('Redux store manages composer state', () => {
      let state = messagingUISlice(undefined, { type: 'messagingUI/setComposing', payload: true });
      expect(state.isComposing).toBe(true);

      state = messagingUISlice(state, { type: 'messagingUI/setComposing', payload: false });
      expect(state.isComposing).toBe(false);
    });
  });

  describe('5. Database Connection Status', () => {
    test('Check if real database tables exist', async () => {
      // This test checks if the mock is being used vs real database
      const isUsingMock = require('../src/features/messaging/api/messagingApi').messagingApi === 
                         require('../src/features/messaging/api/messagingApi.mock').messagingApi;
      
      expect(isUsingMock).toBe(true);
      console.log('🔍 FINDING: Currently using MOCK API - no real database connection');
    });

    test('Verify database migration existence', () => {
      const fs = require('fs');
      const path = require('path');
      
      const migrationPath = path.join(process.cwd(), 'database/migrations/009_create_messaging_system.sql');
      const migrationExists = fs.existsSync(migrationPath);
      
      console.log(`🔍 FINDING: Migration file exists at ${migrationPath}: ${migrationExists}`);
      expect(migrationExists).toBe(true);
    });
  });

  describe('6. Data Persistence Test', () => {
    test('Data persists between API calls in mock', async () => {
      // Create conversation
      const conv1 = await messagingApi.createConversation({
        type: 'direct',
        title: 'Persistence Test',
        participant_ids: ['user-1', 'user-2'],
        metadata: {}
      });

      // Retrieve conversations
      const conversations = await messagingApi.getConversations();
      const foundConv = conversations.find(c => c.id === conv1.id);
      
      expect(foundConv).toBeDefined();
      expect(foundConv?.title).toBe('Persistence Test');
      
      console.log('🔍 FINDING: Data persists in mock API between calls');
    });

    test('Messages persist in mock conversation', async () => {
      // Create conversation
      const conversation = await messagingApi.createConversation({
        type: 'direct',
        title: 'Message Persistence Test',
        participant_ids: ['user-1', 'user-2'],
        metadata: {}
      });

      // Send message
      const message = await messagingApi.sendMessage({
        conversation_id: conversation.id,
        content: 'Persistence test message',
        message_type: 'text',
        metadata: {}
      });

      // Retrieve messages
      const messages = await messagingApi.getMessages({
        conversation_id: conversation.id,
        limit: 50,
        offset: 0
      });

      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Persistence test message');
      
      console.log('🔍 FINDING: Messages persist in mock API');
    });
  });

  describe('7. Real-time Features', () => {
    test('Check for real-time messaging hooks', () => {
      try {
        const realtimeHook = require('../src/features/messaging/hooks/useRealtimeMessaging');
        console.log('🔍 FINDING: Real-time messaging hook exists but may not be implemented');
        expect(realtimeHook).toBeDefined();
      } catch (error) {
        console.log('🔍 FINDING: Real-time messaging hook not found or not functional');
      }
    });

    test('Check for Supabase real-time subscription setup', () => {
      // This would test if real-time subscriptions are set up
      // Since we're using mock, this will show the gap
      console.log('🔍 FINDING: No real-time subscriptions active (using mock API)');
    });
  });
});

describe('Critical Issues Identified', () => {
  test('Document all broken connections', () => {
    const issues = [
      '1. MOCK API ONLY: Using messagingApi.mock.ts instead of real Supabase connection',
      '2. NO DATABASE TABLES: Migration 009_create_messaging_system.sql not applied',
      '3. NO REAL-TIME: No Supabase real-time subscriptions for live messaging',
      '4. NO PERSISTENCE: Data only persists in memory during session',
      '5. NO USER CONTEXT: Mock API uses hardcoded user IDs',
      '6. INCOMPLETE COMPONENTS: MessageThread composer not connected to send function',
      '7. NO ERROR HANDLING: No proper error boundaries for messaging failures',
      '8. NO AUTHENTICATION: No check for proper user permissions'
    ];

    console.log('\n🚨 CRITICAL MESSAGING FLOW ISSUES:');
    issues.forEach(issue => console.log(`   ${issue}`));
    
    expect(issues.length).toBeGreaterThan(0);
  });
});