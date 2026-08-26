import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AppState, Linking } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const authCallbackUrl = 'gimnasio://auth/callback';

interface AuthActionResult {
  errorMessage: string | null;
}

interface AuthContextValue {
  authError: string | null;
  isConfigured: boolean;
  isHydrated: boolean;
  isSendingMagicLink: boolean;
  session: Session | null;
  signOut: () => Promise<AuthActionResult>;
  sendMagicLink: (email: string) => Promise<AuthActionResult>;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isAuthCallback(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'gimnasio:' && parsedUrl.hostname === 'auth' && parsedUrl.pathname === '/callback';
  } catch {
    return false;
  }
}

function tokensFromUrl(url: string): { accessToken: string; refreshToken: string } | null {
  const hash = url.split('#')[1] ?? '';
  const hashParameters = new URLSearchParams(hash);
  const accessToken = hashParameters.get('access_token');
  const refreshToken = hashParameters.get('refresh_token');

  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isHydrated, setIsHydrated] = useState(!isSupabaseConfigured);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuthUrl = useCallback(async (url: string) => {
    const client = supabase;

    if (!client || !isAuthCallback(url)) {
      return;
    }

    try {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      const tokens = tokensFromUrl(url);
      const result = code
        ? await client.auth.exchangeCodeForSession(code)
        : tokens
          ? await client.auth.setSession({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken })
          : { error: new Error('El enlace de acceso no contiene una sesión válida.') };

      if (result.error) {
        setAuthError('No pudimos completar el acceso. Solicita un enlace nuevo e inténtalo de nuevo.');
      }
    } catch {
      setAuthError('No pudimos completar el acceso. Solicita un enlace nuevo e inténtalo de nuevo.');
    }
  }, []);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    const configuredClient = client;
    let isMounted = true;
    const { data: authListener } = configuredClient.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
      }
    });
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        configuredClient.auth.startAutoRefresh();
      } else {
        configuredClient.auth.stopAutoRefresh();
      }
    });

    async function hydrateSession() {
      const [{ data, error }, initialUrl] = await Promise.all([
        configuredClient.auth.getSession(),
        Linking.getInitialURL(),
      ]);

      if (error) {
        setAuthError('No pudimos recuperar tu sesión. Puedes solicitar un nuevo enlace de acceso.');
      }
      if (isMounted) {
        setSession(data.session);
      }
      if (initialUrl) {
        await handleAuthUrl(initialUrl);
      }
      if (isMounted) {
        setIsHydrated(true);
      }
    }

    void hydrateSession();
    configuredClient.auth.startAutoRefresh();
    const urlListener = Linking.addEventListener('url', ({ url }) => void handleAuthUrl(url));

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      appStateListener.remove();
      urlListener.remove();
      configuredClient.auth.stopAutoRefresh();
    };
  }, [handleAuthUrl]);

  const sendMagicLink = useCallback(async (email: string): Promise<AuthActionResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const client = supabase;

    if (!client) {
      return { errorMessage: 'El acceso remoto aún no está configurado en esta instalación.' };
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return { errorMessage: 'Escribe un correo válido para recibir el enlace.' };
    }

    setIsSendingMagicLink(true);
    setAuthError(null);

    try {
      const { error } = await client.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: authCallbackUrl },
      });

      if (error) {
        return { errorMessage: 'No pudimos enviar el enlace. Revisa el correo e inténtalo de nuevo.' };
      }

      return { errorMessage: null };
    } catch {
      return { errorMessage: 'No pudimos enviar el enlace. Comprueba tu conexión e inténtalo de nuevo.' };
    } finally {
      setIsSendingMagicLink(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    const client = supabase;

    if (!client) {
      return { errorMessage: null };
    }

    setAuthError(null);
    const { error } = await client.auth.signOut();

    if (error) {
      return { errorMessage: 'No pudimos cerrar la sesión. Inténtalo de nuevo.' };
    }

    return { errorMessage: null };
  }, []);

  const value = useMemo(
    () => ({
      authError,
      isConfigured: isSupabaseConfigured,
      isHydrated,
      isSendingMagicLink,
      session,
      signOut,
      sendMagicLink,
      user: session?.user ?? null,
    }),
    [authError, isHydrated, isSendingMagicLink, sendMagicLink, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }

  return context;
}
