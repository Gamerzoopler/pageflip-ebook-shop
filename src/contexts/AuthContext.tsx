
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle different auth events
        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in!');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Successfully signed out!');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription...');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      console.log('Sign in successful for:', data.user?.email);
      return { error: null };
      
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('Attempting to sign up user:', email);
      
      const redirectUrl = `${window.location.origin}/`;
      console.log('Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || email.split('@')[0],
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Password must be at least 6 characters long.');
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          console.log('User signed up and confirmed immediately:', data.user.email);
          toast.success('Account created successfully! You are now signed in.');
        } else {
          console.log('User signed up, email confirmation required:', data.user.email);
          toast.success('Account created! Please check your email to confirm your account.');
        }
      }

      return { error: null };
      
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast.error('An error occurred while signing out.');
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      console.log('Resending confirmation email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        toast.error(error.message);
        return { error };
      }

      toast.success('Confirmation email sent! Please check your inbox.');
      return { error: null };
      
    } catch (error) {
      console.error('Unexpected resend error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
