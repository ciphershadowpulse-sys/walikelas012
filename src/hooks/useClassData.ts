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
    fetchData();
  }, [profile?.id, profile?.teacher_id]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      if (!profile) {
        setLoading(false);
        return;
      }

      let teacherId = profile.teacher_id;

      // 1. Fetch teacher data
      if (teacherId) {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', teacherId)
          .maybeSingle();

        setTeacherData(teacher || null);
      } else if (profile.email) {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('*')
          .eq('email', profile.email)
          .maybeSingle();

        if (teacher) {
          setTeacherData(teacher);
          teacherId = teacher.id;
        }
      }

      // 2. Fetch active academic period
      const { data: period } = await supabase
        .from('academic_periods')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      setAcademicPeriod(period || null);

      // 3. Fetch class
      if (teacherId) {
        const { data: cls } = await supabase
          .from('classes')
          .select('*')
          .eq('homeroom_teacher_id', teacherId)
          .maybeSingle();

        setClassData(cls || null);

        if (cls) {
          // Fetch students
          const { data: studentData } = await supabase
            .from('students')
            .select('*')
            .eq('class_id', cls.id)
            .order('full_name');

          setStudents(studentData || []);
        } else {
          setStudents([]);
        }
      } else {
        setClassData(null);
        setStudents([]);
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
