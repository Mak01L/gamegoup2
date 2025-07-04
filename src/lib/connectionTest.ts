import { testSupabaseConnection, supabase } from './supabaseClient';
import { debugLog, errorLog, successLog } from './devUtils';

// Connection test utility
export const runConnectionTest = async () => {
  debugLog('Starting comprehensive Supabase connection test...');
  
  try {
    // Test 1: Basic connection
    debugLog('Test 1: Basic connection test');
    const isConnected = await testSupabaseConnection();
    
    if (!isConnected) {
      errorLog('Basic connection test failed');
      return false;
    }
    
    successLog('Basic connection test passed');
    
    // Test 2: Try to fetch user profiles count
    debugLog('Test 2: Fetching profiles count');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      errorLog('Profiles count test failed:', countError);
      return false;
    }
    
    successLog(`Profiles count test passed. Found ${count} profiles`);
    
    // Test 3: Test realtime capabilities
    debugLog('Test 3: Testing realtime subscription');
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        (payload) => {
          debugLog('Realtime event received:', payload);
        }
      )
      .subscribe((status) => {
        debugLog('Channel subscription status:', status);
      });
    
    // Clean up the test channel after a brief moment
    setTimeout(() => {
      channel.unsubscribe();
      debugLog('Test channel unsubscribed');
    }, 2000);
    
    successLog('All Supabase connection tests passed!');
    return true;
    
  } catch (error) {
    errorLog('Connection test failed with exception:', error);
    return false;
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  runConnectionTest();
}
