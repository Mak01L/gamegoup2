import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AutoRefreshHookOptions {
  onFriendsChange?: () => void;
  onMatchesChange?: () => void;
  onMessagesChange?: () => void;
  userId?: string;
}

export const useAutoRefresh = ({
  onFriendsChange,
  onMatchesChange, 
  onMessagesChange,
  userId
}: AutoRefreshHookOptions) => {
  const subscriptionsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    console.log('🔄 Setting up auto-refresh subscriptions for user:', userId);

    // Clean up existing subscriptions
    subscriptionsRef.current.forEach(sub => {
      supabase.removeChannel(sub);
    });
    subscriptionsRef.current = [];

    // Subscribe to friendship changes
    if (onFriendsChange) {
      const friendsSubscription = supabase
        .channel('friendships_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
        }, () => {
          console.log('👥 Friendships changed - auto refreshing');
          onFriendsChange();
        })
        .subscribe();
      
      subscriptionsRef.current.push(friendsSubscription);
    }

    // Subscribe to match changes  
    if (onMatchesChange) {
      const matchesSubscription = supabase
        .channel('matches_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public', 
          table: 'user_matches',
          filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
        }, () => {
          console.log('💖 Matches changed - auto refreshing');
          onMatchesChange();
        })
        .subscribe();

      subscriptionsRef.current.push(matchesSubscription);
    }

    // Subscribe to like/dislike changes (for immediate match detection)
    const likesSubscription = supabase
      .channel('likes_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'likes_dislikes',
        filter: `target_user_id=eq.${userId}`
      }, (payload) => {
        console.log('💝 Someone liked you - checking for matches');
        if (payload.new.action === 'like' && onMatchesChange) {
          // Small delay to allow trigger to create match
          setTimeout(onMatchesChange, 500);
        }
      })
      .subscribe();

    subscriptionsRef.current.push(likesSubscription);

    // Subscribe to message changes
    if (onMessagesChange) {
      const messagesSubscription = supabase
        .channel('messages_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'private_messages'
        }, () => {
          console.log('💬 Messages changed - auto refreshing');
          onMessagesChange();
        })
        .subscribe();

      subscriptionsRef.current.push(messagesSubscription);
    }

    return () => {
      console.log('🧹 Cleaning up auto-refresh subscriptions');
      subscriptionsRef.current.forEach(sub => {
        supabase.removeChannel(sub);
      });
      subscriptionsRef.current = [];
    };
  }, [userId, onFriendsChange, onMatchesChange, onMessagesChange]);

  return {
    forceRefresh: () => {
      console.log('🔄 Force refreshing all data');
      onFriendsChange?.();
      onMatchesChange?.();
      onMessagesChange?.();
    }
  };
};
