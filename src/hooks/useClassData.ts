import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Class, AcademicPeriod, Teacher, Student } from '../types';
import { useAuth } from './AuthContext';

export function useClassData() {
  const { profile } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [academicPeriod, setAcademicPeriod] = useState<AcademicPeriod | null>(null);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.teacher_id) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [profile?.teacher_id]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch teacher data
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', profile!.teacher_id)
        .single();

      if (teacherError) throw teacherError;
      setTeacherData(teacher);

      // Fetch active academic period
      const { data: period, error: periodError } = await supabase
        .from('academic_periods')
        .select('*')
        .eq('is_active', true)
        .single();

      if (periodError && periodError.code !== 'PGRST116') throw periodError;
      setAcademicPeriod(period || null);

      // Fetch class
      const { data: cls, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('homeroom_teacher_id', profile!.teacher_id)
        .single();

      if (classError && classError.code !== 'PGRST116') throw classError;
      setClassData(cls || null);

      if (cls) {
        // Fetch students
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', cls.id)
          .order('full_name');

        if (studentError) throw studentError;
        setStudents(studentData || []);
      }
    } catch (err: any) {
      console.error('Error fetching class data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { classData, academicPeriod, teacherData, students, loading, error, refetch: fetchData };
}
