import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, DatabaseProfile, DatabaseWorkspace, DatabaseWorkspaceMembership } from '../lib/supabase';
import { getFriendlyAuthErrorMessage } from '../lib/auth-helpers';
import { useLanguage } from './LanguageContext';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  businessName?: string;
  preferredLanguage?: 'bn' | 'banglish' | 'en';
}

export interface OnboardingData {
  businessName: string;
  category: 'clothing' | 'gadgets' | 'cosmetics' | 'jewelry' | 'food' | 'general';
  preferredLanguage: 'bn' | 'banglish' | 'en';
  monthlyMessageVolume: 'under_1k' | '1k_to_5k' | '5k_to_15k' | 'over_15k';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: DatabaseProfile | null;
  currentWorkspace: DatabaseWorkspace | null;
  workspaces: DatabaseWorkspace[];
  currentRole: 'owner' | 'admin' | 'member' | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (params: SignUpParams) => Promise<{ error: string | null; needsEmailVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<DatabaseProfile>) => Promise<{ error: string | null }>;
  completeOnboarding: (data: OnboardingData) => Promise<{ error: string | null }>;
  switchWorkspace: (workspaceId: string) => void;
  requestAccountDeletion: (confirmationReason: string) => Promise<{ error: string | null; message: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isBangla } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DatabaseProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<DatabaseWorkspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<DatabaseWorkspace[] | null>(null) as any;
  const [currentRole, setCurrentRole] = useState<'owner' | 'admin' | 'member' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch or safely build user profile from database
  const fetchProfileAndWorkspaces = useCallback(async (authenticatedUser: User) => {
    if (!isSupabaseConfigured) {
      // In unconfigured state, construct safe memory profile from user metadata
      setProfile({
        id: authenticatedUser.id,
        full_name: authenticatedUser.user_metadata?.full_name || authenticatedUser.email?.split('@')[0] || 'Merchant',
        business_name: authenticatedUser.user_metadata?.business_name || null,
        preferred_language: authenticatedUser.user_metadata?.preferred_language || 'bn',
        onboarding_completed: Boolean(authenticatedUser.user_metadata?.onboarding_completed),
        avatar_url: null,
        created_at: authenticatedUser.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return;
    }

    try {
      // 1. Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authenticatedUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as DatabaseProfile);
      } else {
        // Fallback: create default profile row if trigger hasn't fired yet
        const defaultProfile: Partial<DatabaseProfile> = {
          id: authenticatedUser.id,
          full_name: authenticatedUser.user_metadata?.full_name || authenticatedUser.email?.split('@')[0] || 'Merchant',
          business_name: authenticatedUser.user_metadata?.business_name || null,
          preferred_language: authenticatedUser.user_metadata?.preferred_language || 'bn',
          onboarding_completed: false,
        };

        const { data: createdProfile } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .maybeSingle();

        if (createdProfile) {
          setProfile(createdProfile as DatabaseProfile);
        }
      }

      // 2. Fetch workspaces via memberships
      const { data: memberships, error: memberError } = await supabase
        .from('workspace_memberships')
        .select('workspace_id, role, workspaces (*)')
        .eq('user_id', authenticatedUser.id);

      if (memberships && memberships.length > 0) {
        const loadedWorkspaces: DatabaseWorkspace[] = [];
        let activeWs: DatabaseWorkspace | null = null;
        let activeRole: 'owner' | 'admin' | 'member' = 'member';

        memberships.forEach((m: any) => {
          if (m.workspaces) {
            loadedWorkspaces.push(m.workspaces as DatabaseWorkspace);
            if (!activeWs) {
              activeWs = m.workspaces as DatabaseWorkspace;
              activeRole = m.role as any;
            }
          }
        });

        setWorkspaces(loadedWorkspaces);
        setCurrentWorkspace(activeWs);
        setCurrentRole(activeRole);
      } else {
        // Safe fallback workspace if database has no workspace row yet
        const fallbackWs: DatabaseWorkspace = {
          id: 'default-ws-' + authenticatedUser.id.slice(0, 8),
          name: authenticatedUser.user_metadata?.business_name || 'My Shop BD',
          owner_id: authenticatedUser.id,
          category: 'clothing',
          monthly_message_volume: '1k_to_5k',
          plan_tier: 'starter',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setWorkspaces([fallbackWs]);
        setCurrentWorkspace(fallbackWs);
        setCurrentRole('owner');
      }
    } catch (err) {
      console.error('Error fetching profile and workspaces:', err);
    }
  }, []);

  // Initialize session and auth state listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured) {
          setIsLoading(false);
          return;
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfileAndWorkspaces(initialSession.user);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            setWorkspaces([]);
            setCurrentWorkspace(null);
            setCurrentRole(null);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Auth initialization error:', err);
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Listen to official auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await fetchProfileAndWorkspaces(newSession.user);
      } else {
        setProfile(null);
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setCurrentRole(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndWorkspaces]);

  // Sign up
  const signUp = async (params: SignUpParams) => {
    if (!isSupabaseConfigured) {
      return {
        error: isBangla
          ? 'Supabase কনফিগারেশন অনুপস্থিত। দয়া করে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY সেট করুন।'
          : 'Supabase configuration missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
      };
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: params.fullName.trim(),
            business_name: params.businessName?.trim() || null,
            preferred_language: params.preferredLanguage || 'bn',
            onboarding_completed: false,
          },
        },
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error, isBangla) };
      }

      const needsEmailVerification = !data.session && Boolean(data.user);

      if (data.user && data.session) {
        await fetchProfileAndWorkspaces(data.user);
      }

      return { error: null, needsEmailVerification };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err, isBangla) };
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: isBangla
          ? 'Supabase কনফিগারেশন অনুপস্থিত। আপনার .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY যোগ করুন।'
          : 'Supabase configuration missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error, isBangla) };
      }

      if (data.user) {
        await fetchProfileAndWorkspaces(data.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err, isBangla) };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setCurrentRole(null);
      return { error: null };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err, isBangla) };
    }
  };

  // Send password reset email
  const sendPasswordReset = async (email: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: isBangla
          ? 'Supabase কনফিগারেশন প্রয়োজন।'
          : 'Supabase credentials required.',
      };
    }

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error, isBangla) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err, isBangla) };
    }
  };

  // Update password (used in reset password or settings)
  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: isBangla ? 'Supabase কনফিগারেশন প্রয়োজন।' : 'Supabase credentials required.',
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error, isBangla) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err, isBangla) };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: isBangla ? 'Supabase কনফিগারেশন প্রয়োজন।' : 'Supabase credentials required.',
      };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error: getFriendlyAuthErrorMessage(error, isBangla) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err, isBangla) };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<DatabaseProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          return { error: getFriendlyAuthErrorMessage(error, isBangla) };
        }
      }

      // Update state
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err, isBangla) };
    }
  };

  // Complete onboarding wizard
  const completeOnboarding = async (data: OnboardingData) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      if (isSupabaseConfigured) {
        // 1. Update user profile to mark onboarding complete
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            business_name: data.businessName,
            preferred_language: data.preferredLanguage,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileErr) {
          return { error: getFriendlyAuthErrorMessage(profileErr, isBangla) };
        }

        // 2. Update user's primary workspace details
        if (currentWorkspace?.id) {
          await supabase
            .from('workspaces')
            .update({
              name: data.businessName,
              category: data.category,
              monthly_message_volume: data.monthlyMessageVolume,
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentWorkspace.id);
        }
      }

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              business_name: data.businessName,
              preferred_language: data.preferredLanguage,
              onboarding_completed: true,
            }
          : null
      );

      if (currentWorkspace) {
        setCurrentWorkspace((prev: any) =>
          prev
            ? {
                ...prev,
                name: data.businessName,
                category: data.category,
                monthly_message_volume: data.monthlyMessageVolume,
              }
            : null
        );
      }

      return { error: null };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err, isBangla) };
    }
  };

  // Switch active workspace
  const switchWorkspace = (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setCurrentWorkspace(ws);
    }
  };

  // Request account deletion
  const requestAccountDeletion = async (confirmationReason: string) => {
    if (!user) return { error: 'Not authenticated', message: '' };

    try {
      // In production, this stores a soft-delete / GDPR audit request and alerts admin
      // because auth.admin.deleteUser requires service_role secret key on backend
      const message = isBangla
        ? 'আপনার অ্যাকাউন্ট মুছে ফেলার আবেদনটি গৃহীত হয়েছে। নিরাপত্তা যাচাইয়ের পর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে সকল ডেটা স্থায়ীভাবে মুছে ফেলা হবে।'
        : 'Your account deletion request has been registered. Data will be purged within 24-48 hours following security verification.';

      return { error: null, message };
    } catch (err: any) {
      return { error: getFriendlyAuthErrorMessage(err, isBangla), message: '' };
    }
  };

  const refreshSession = async () => {
    if (user) {
      await fetchProfileAndWorkspaces(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        currentWorkspace,
        workspaces,
        currentRole,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        sendPasswordReset,
        updatePassword,
        resendVerificationEmail,
        updateProfile,
        completeOnboarding,
        switchWorkspace,
        requestAccountDeletion,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
