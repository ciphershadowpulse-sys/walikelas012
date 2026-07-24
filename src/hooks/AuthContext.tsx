import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export interface SignUpData {
  fullName: string;
  nip: string;
  email: string;
  password: string;
  className: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching Supabase session:', err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile from Supabase:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profileData) {
          return { error: 'Profil wali kelas belum terdaftar di database.' };
        }

        setProfile(profileData);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Terjadi kesalahan saat masuk.' };
    }
  }

  async function signUp(data: SignUpData) {
    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName },
        },
      });

      if (authError) {
        return { error: authError.message };
      }

      const userId = authData.user?.id;
      if (!userId) {
        return { error: 'Gagal membuat akun pengakses.' };
      }

      // 2. Insert into teachers table
      let teacherId = '';
      const { data: teacherData, error: tErr } = await supabase
        .from('teachers')
        .insert({
          nip: data.nip || `NIP-${Date.now()}`,
          full_name: data.fullName,
          email: data.email,
          status: 'Aktif',
        })
        .select('id')
        .single();

      if (tErr) throw tErr;
      teacherId = teacherData.id;

      // 3. Get active academic period & insert class
      const { data: activePeriod } = await supabase
        .from('academic_periods')
        .select('id')
        .eq('is_active', true)
        .single();

      const { data: classData, error: cErr } = await supabase
        .from('classes')
        .insert({
          class_name: data.className,
          grade_level: data.className.split('-')[0] || '10',
          homeroom_teacher_id: teacherId,
          academic_period_id: activePeriod?.id || null,
        })
        .select('id')
        .single();

      if (cErr) throw cErr;

      // 4. Insert into profiles table
      const { data: profileData, error: pErr } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: data.fullName,
          email: data.email,
          role: 'wali_kelas',
          teacher_id: teacherId,
        })
        .select('*')
        .single();

      if (pErr) throw pErr;

      setUser(authData.user);
      setProfile(profileData);
      setLoading(false);

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Gagal mendaftarkan akun wali kelas.' };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
