import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a proxy that makes all queries fail gracefully in demo mode
    const demoResponse = { data: null, error: { message: 'DEMO_MODE' }, count: null };

    const createQueryProxy = (): unknown =>
      new Proxy({}, {
        get(_, prop) {
          // Make the proxy awaitable - resolve with demoResponse
          if (prop === 'then') {
            return (resolve?: (v: unknown) => void) => resolve?.(demoResponse);
          }
          // Any method call returns a new chainable proxy
          return () => createQueryProxy();
        },
      });

    return new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        if (prop === 'from') {
          return () => createQueryProxy();
        }
        if (prop === 'auth') {
          return {
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Demo modunda giris yapilamaz' } }),
            signOut: () => Promise.resolve({ error: null }),
          };
        }
        return undefined;
      },
    });
  }

  cachedClient = createBrowserClient(url, key);
  return cachedClient;
}
