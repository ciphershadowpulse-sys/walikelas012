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

      if (error && error.code !== 'PGRST116') {
        console.warn('Warning fetching profile:', error);
      }
      setProfile(data || null);
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
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        setProfile(profileData || {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email || email,
          role: 'wali_kelas',
          created_at: new Date().toISOString(),
        });
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

      let userId = authData.user?.id;

      // Try automatic sign in immediately so client gets session token
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInData?.user) {
        userId = signInData.user.id;
        setUser(signInData.user);
      }

      if (!userId) {
        return { error: 'Pendaftaran gagal, ID pengguna tidak ditemukan.' };
      }

      // 2. Create or find Teacher record
      let teacherId = '';
      const { data: existingTeacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      if (existingTeacher?.id) {
        teacherId = existingTeacher.id;
      } else {
        const { data: newTeacher, error: tErr } = await supabase
          .from('teachers')
          .insert({
            nip: data.nip || `NIP-${Date.now()}`,
            full_name: data.fullName,
            email: data.email,
            status: 'Aktif',
          })
          .select('id')
          .single();

        if (tErr) {
          console.error('Error inserting teacher:', tErr);
        }
        teacherId = newTeacher?.id || '';
      }

      // 3. Find or Create Active Academic Period
      let periodId = '';
      const { data: activePeriod } = await supabase
        .from('academic_periods')
        .select('id')
        .eq('is_active', true)
        .maybeSingle();

      if (activePeriod?.id) {
        periodId = activePeriod.id;
      } else {
        const { data: newPeriod } = await supabase
          .from('academic_periods')
          .insert({
            school_year: '2024/2025',
            semester: 'Ganjil',
            is_active: true,
          })
          .select('id')
          .single();

        periodId = newPeriod?.id || '';
      }

      // 4. Create Class record
      if (teacherId) {
        const { data: existingClass } = await supabase
          .from('classes')
          .select('id')
          .eq('homeroom_teacher_id', teacherId)
          .maybeSingle();

        if (!existingClass) {
          await supabase.from('classes').insert({
            class_name: data.className,
            grade_level: data.className.split('-')[0] || '10',
            homeroom_teacher_id: teacherId,
            academic_period_id: periodId || null,
          });
        }
      }

      // 5. Create Profile record
      const profilePayload = {
        id: userId,
        full_name: data.fullName,
        email: data.email,
        role: 'wali_kelas' as const,
        teacher_id: teacherId || null,
      };

      const { data: profileData, error: pErr } = await supabase
        .from('profiles')
        .upsert(profilePayload)
        .select('*')
        .single();

      if (pErr) {
        console.error('Error upserting profile:', pErr);
      }

      const activeProfile = profileData || {
        ...profilePayload,
        created_at: new Date().toISOString(),
      };

      setProfile(activeProfile);
      setLoading(false);

      return { error: null };
    } catch (err: any) {
      console.error('Catch error in signUp:', err);
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
