import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, role: UserRole, metadata?: any) => Promise<{ error: any; session: any }>;
  loginWithDemo: (role: UserRole) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch warning:', error.message);
        return null;
      }

      const appUser: User = {
        id: userId,
        email: email,
        name: profile.name || email.split('@')[0],
        role: (profile.role as UserRole) || UserRole.STUDENT,
        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.name || 'User'}`,
        joinedClubs: [], // In real app, fetch from join table
        studentYear: profile.student_year,
        department: profile.department,
        mentoredClub: profile.mentored_club
      };

      return appUser;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email!);
        if (profile) setUser(profile);
      }
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
             await new Promise(r => setTimeout(r, 500)); 
          }
          const profile = await fetchProfile(session.user.id, session.user.email!);
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
           setUser(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, metadata: any = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          ...metadata // Spread extra fields like studentYear, mentoredClub etc.
        }
      }
    });

    return { error, session: data.session };
  };

  const loginWithDemo = (role: UserRole) => {
    const demoUser: User = {
      id: `demo-${role.toLowerCase()}`,
      email: `demo.${role.toLowerCase()}@uniclubs.edu`,
      name: `Demo ${role.charAt(0) + role.slice(1).toLowerCase()}`,
      role: role,
      avatar: `https://ui-avatars.com/api/?name=Demo+${role}&background=random&color=fff`,
      joinedClubs: ['c1'],
      studentYear: role !== UserRole.ADMIN ? '3rd Year' : undefined,
      department: 'Computer Science',
      mentoredClub: role === UserRole.ADMIN ? 'Tech Innovators' : undefined
    };
    setUser(demoUser);
  };

  const signOut = async () => {
    if (user?.id.startsWith('demo-')) {
      setUser(null);
    } else {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, loginWithDemo, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
