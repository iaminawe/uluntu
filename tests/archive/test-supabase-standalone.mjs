import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Supabase connection...');
console.log('URL:', process.env.VITE_SUPABASE_URL);
console.log('Key exists:', !!process.env.VITE_SUPABASE_ANON_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testQueries() {
  try {
    console.log('\n1. Testing marketplace_listings query...');
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .limit(2);
    
    console.log('Listings result:', { 
      success: !listingsError, 
      count: listings?.length,
      error: listingsError?.message 
    });
    
    console.log('\n2. Testing news query...');
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('*')
      .limit(2);
    
    console.log('News result:', { 
      success: !newsError, 
      count: news?.length,
      error: newsError?.message 
    });
    
    console.log('\n3. Testing members query...');
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .limit(2);
    
    console.log('Members result:', { 
      success: !membersError, 
      count: members?.length,
      error: membersError?.message 
    });
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testQueries();