'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserRole } from '@/types/database';
import { hasPermission } from '@/lib/constants';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setState({ user: null, loading: false, error: null });
          return;
        }

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) {
          setState({ user: null, loading: false, error: error.message });
          return;
        }

        setState({ user: profile as UserProfile, loading: false, error: null });
      } catch (err) {
        setState({
          user: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Bir hata olustu',
        });
      }
    }

    loadUser();

    const listener = supabase.auth.onAuthStateChange?.(
      (_event: string, session: unknown) => {
        if (!session) {
          setState({ user: null, loading: false, error: null });
        } else {
          loadUser();
        }
      }
    );

    const subscription = listener?.data?.subscription;
    return () => subscription?.unsubscribe();
  }, []);

  const can = (module: string, action: string): boolean => {
    if (!state.user) return true; // Allow all access in demo/unauthenticated mode
    return hasPermission(state.user.role as UserRole, module, action);
  };

  return {
    ...state,
    can,
    isAdmin: state.user?.role === 'admin',
    isManager: state.user?.role === 'warehouse_manager',
  };
}
