import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface ChatContact {
  id: string;
  full_name: string;
  avatar_url: string | null;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export function useChatContacts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chat_contacts', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ChatContact[]> => {
      // 1. Get current user's profile (role and gym_id)
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('role, gym_id')
        .eq('id', user!.id)
        .single();

      if (!myProfile) return [];

      const role = myProfile.role;
      const gymId = myProfile.gym_id;

      let contactIds: string[] = [];

      // 2. Fetch contacts based on role
      if (role === 'admin') {
        // Admins see all coaches and clients in their gym
        const { data: gymMembers } = await supabase
          .from('profiles')
          .select('id')
          .eq('gym_id', gymId)
          .neq('id', user!.id);
        contactIds = (gymMembers || []).map(m => m.id);
      } else if (role === 'coach') {
        // Coaches see their clients
        const { data: clients } = await supabase
          .from('coach_clients')
          .select('client_id')
          .eq('coach_id', user!.id);
        
        // AND admins of the same gym
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('gym_id', gymId)
          .eq('role', 'admin');

        contactIds = [
          ...(clients || []).map(c => c.client_id),
          ...(admins || []).map(a => a.id)
        ];
      } else if (role === 'client') {
        // Clients only see their coaches
        const { data: coaches } = await supabase
          .from('coach_clients')
          .select('coach_id')
          .eq('client_id', user!.id);
        contactIds = (coaches || []).map(c => c.coach_id);
      }

      // Remove duplicates and self
      contactIds = Array.from(new Set(contactIds)).filter(id => id !== user!.id);

      if (contactIds.length === 0) return [];

      // 3. Fetch profiles for these contacts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', contactIds);

      // 4. Get last message and unread count for each contact
      const contacts: ChatContact[] = [];
      for (const profile of profiles || []) {
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user!.id})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('sender_id', profile.id)
          .eq('receiver_id', user!.id)
          .eq('read', false);

        contacts.push({
          id: profile.id,
          full_name: profile.full_name || 'Sin nombre',
          avatar_url: profile.avatar_url,
          last_message: lastMsg?.content,
          last_message_at: lastMsg?.created_at,
          unread_count: count || 0,
        });
      }

      // Sort by last message date
      contacts.sort((a, b) => {
        if (!a.last_message_at) return 1;
        if (!b.last_message_at) return -1;
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });

      return contacts;
    },
  });
}

export function useChatMessages(contactId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat_messages', user?.id, contactId],
    enabled: !!user && !!contactId,
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user!.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark received messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', contactId!)
        .eq('receiver_id', user!.id)
        .eq('read', false);

      return (data || []) as ChatMessage[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!user || !contactId) return;

    const channel = supabase
      .channel(`chat:${user.id}:${contactId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          const isRelevant =
            (msg.sender_id === user.id && msg.receiver_id === contactId) ||
            (msg.sender_id === contactId && msg.receiver_id === user.id);

          if (isRelevant) {
            queryClient.setQueryData<ChatMessage[]>(
              ['chat_messages', user.id, contactId],
              (old = []) => {
                if (old.some((m) => m.id === msg.id)) return old;
                return [...old, msg];
              }
            );

            // Mark as read if we received it
            if (msg.sender_id === contactId) {
              supabase
                .from('messages')
                .update({ read: true })
                .eq('id', msg.id);
            }

            // Refresh contacts for unread counts
            queryClient.invalidateQueries({ queryKey: ['chat_contacts'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, contactId, queryClient]);

  return query;
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          receiver_id: receiverId,
          content: content.trim(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_contacts'] });
    },
  });
}
