/**
 * Custom hook for fetching users (for participant selection)
 */

import { useState, useEffect } from 'react';
import { supabase, TABLES } from '@/lib/supabase/client';
import type { User } from '@/types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .eq('is_active', true)
          .order('nama_lengkap', { ascending: true });

        if (fetchError) throw fetchError;
        
        setUsers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return { users, loading, error };
}
