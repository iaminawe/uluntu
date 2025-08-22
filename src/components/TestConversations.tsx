import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function TestConversations() {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  const addResult = (test: string, status: TestResult['status'], message?: string, data?: any) => {
    setResults(prev => [...prev, { test, status, message, data }]);
  };

  const runTests = async () => {
    setResults([]);
    
    // Test 1: Get member profile
    addResult('Get member profile', 'pending');
    try {
      const { data: memberData, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setMember(memberData);
      addResult('Get member profile', 'success', `Found: ${memberData.name}`, memberData);
    } catch (error: any) {
      addResult('Get member profile', 'error', error.message);
      return;
    }

    // Test 2: Fetch conversations
    addResult('Fetch conversations', 'pending');
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(
            user_id,
            last_read_message_id,
            notification_settings
          ),
          messages(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .eq('conversation_participants.user_id', member?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      addResult('Fetch conversations', 'success', `Found ${conversations?.length || 0} conversations`, conversations);
    } catch (error: any) {
      addResult('Fetch conversations', 'error', error.message);
    }

    // Test 3: Check conversation_participants
    if (!member) {
      addResult('Check conversation_participants', 'error', 'No member profile found - skipping participant check');
    } else {
      addResult('Check conversation_participants', 'pending');
      try {
        const { data, error } = await supabase
          .from('conversation_participants')
          .select('*')
          .eq('user_id', member.id)
          .limit(1);

        if (error) throw error;
        addResult('Check conversation_participants', 'success', 'Table accessible', data);
      } catch (error: any) {
        addResult('Check conversation_participants', 'error', error.message);
      }
    }

    // Test 4: Find another member
    addResult('Find another member', 'pending');
    try {
      if (!member) {
        addResult('Find another member', 'error', 'No member profile to compare against');
        return;
      }
      
      const { data: otherMembers, error } = await supabase
        .from('members')
        .select('id, name')
        .neq('id', member.id)
        .limit(1);

      if (error) throw error;
      if (!otherMembers || otherMembers.length === 0) {
        addResult('Find another member', 'error', 'No other members found');
        return;
      }
      
      const otherMember = otherMembers[0];
      addResult('Find another member', 'success', `Found: ${otherMember.name}`, otherMember);

      // Test 5: Create/get conversation
      addResult('Create conversation', 'pending');
      try {
        const { data: conversation, error: convError } = await supabase
          .rpc('create_direct_conversation', {
            other_user_id: otherMember.id,
            initial_message: 'Test message from UI'
          });

        if (convError) throw convError;
        addResult('Create conversation', 'success', 'Conversation created/retrieved', conversation);
      } catch (error: any) {
        addResult('Create conversation', 'error', error.message);
      }
    } catch (error: any) {
      addResult('Find another member', 'error', error.message);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          Please sign in to test conversations. Use: gregg@smrt1.ca
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Conversations System Test</h2>
        
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p className="text-sm">
            User: {user.email} ({user.id})
          </p>
          {member && (
            <p className="text-sm mt-1">
              Member: {member.name} ({member.id})
            </p>
          )}
        </div>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="text-2xl">
                {result.status === 'pending' && '⏳'}
                {result.status === 'success' && '✅'}
                {result.status === 'error' && '❌'}
              </span>
              <div className="flex-1">
                <p className="font-medium">{result.test}</p>
                {result.message && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {result.message}
                  </p>
                )}
                {result.data && (
                  <details className="mt-1">
                    <summary className="text-xs text-slate-500 cursor-pointer">
                      View data
                    </summary>
                    <pre className="text-xs mt-2 p-2 bg-slate-100 dark:bg-slate-900 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={runTests}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Re-run Tests
        </button>
      </div>
    </div>
  );
}