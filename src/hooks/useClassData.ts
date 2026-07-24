import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Class, AcademicPeriod, Teacher, Student } from '../types';
import { useAuth } from './AuthContext';
import { mockClass, mockAcademicPeriod, mockTeacher, mockStudents } from '../lib/mockData';

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
  }, [profile?.teacher_id]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const targetTeacherId = profile?.teacher_id || mockTeacher.id;

      // Fetch teacher data
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', targetTeacherId)
        .single();

      setTeacherData(teacher || mockTeacher);

      // Fetch active academic period
      const { data: period, error: periodError } = await supabase
        .from('academic_periods')
        .select('*')
        .eq('is_active', true)
        .single();

      setAcademicPeriod(period || mockAcademicPeriod);

      // Fetch class
      const { data: cls, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('homeroom_teacher_id', targetTeacherId)
        .single();

      const activeClass = cls || mockClass;
      setClassData(activeClass);

      if (activeClass) {
        // Fetch students
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', activeClass.id)
          .order('full_name');

        setStudents(studentData && studentData.length > 0 ? studentData : mockStudents);
      } else {
        setStudents(mockStudents);
      }
    } catch (err: any) {
      console.warn('Error fetching class data, using fallback:', err);
      setClassData(mockClass);
      setAcademicPeriod(mockAcademicPeriod);
      setTeacherData(mockTeacher);
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  }

  return { classData, academicPeriod, teacherData, students, loading, error, refetch: fetchData };
}
