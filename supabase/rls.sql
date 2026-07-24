-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role
LANGUAGE SQL
STABLE
AS $
  SELECT role FROM public.profiles WHERE id = auth.uid();
$;

-- Helper function to get homeroom teacher class IDs
CREATE OR REPLACE FUNCTION auth.homeroom_class_ids()
RETURNS TABLE(class_id UUID)
LANGUAGE SQL
STABLE
AS $
  SELECT c.id FROM public.classes c
  JOIN public.teachers t ON c.homeroom_teacher_id = t.id
  JOIN public.profiles p ON p.teacher_id = t.id
  WHERE p.id = auth.uid();
$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Teachers policies
CREATE POLICY "Authenticated users can view teachers"
  ON teachers FOR SELECT
  USING (auth.role() = 'authenticated');

-- Academic periods policies
CREATE POLICY "Authenticated users can view academic periods"
  ON academic_periods FOR SELECT
  USING (auth.role() = 'authenticated');

-- Classes policies
CREATE POLICY "Wali kelas can view their own classes"
  ON classes FOR SELECT
  USING (
    id IN (SELECT auth.homeroom_class_ids())
    OR auth.user_role() = 'admin'
  );

-- Students policies
CREATE POLICY "Wali kelas can view students in their class"
  ON students FOR SELECT
  USING (
    class_id IN (SELECT auth.homeroom_class_ids())
    OR auth.user_role() = 'admin'
  );

CREATE POLICY "Wali kelas can insert students in their class"
  ON students FOR INSERT
  WITH CHECK (
    class_id IN (SELECT auth.homeroom_class_ids())
    OR auth.user_role() = 'admin'
  );

CREATE POLICY "Wali kelas can update students in their class"
  ON students FOR UPDATE
  USING (
    class_id IN (SELECT auth.homeroom_class_ids())
    OR auth.user_role() = 'admin'
  );

-- Attendances policies
CREATE POLICY "Wali kelas can manage attendances of their class"
  ON attendances FOR ALL
  USING (
    class_id IN (SELECT auth.homeroom_class_ids())
    OR auth.user_role() = 'admin'
  )
  WITH CHECK (
    class_id IN (SELECT auth.homeroom_class_ids())
    OR auth.user_role() = 'admin'
  );

CREATE POLICY "Students can view own attendances"
  ON attendances FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE class_id IN (SELECT auth.homeroom_class_ids())
    )
    OR auth.user_role() = 'admin'
  );

-- Leave requests policies
CREATE POLICY "Wali kelas can manage leave requests of their class"
  ON leave_requests FOR ALL
  USING (
    student_id IN (
      SELECT id FROM students WHERE class_id IN (SELECT auth.homeroom_class_ids())
    )
    OR auth.user_role() = 'admin'
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE class_id IN (SELECT auth.homeroom_class_ids())
    )
    OR auth.user_role() = 'admin'
  );

-- Student notes policies
CREATE POLICY "Wali kelas can manage notes of their class"
  ON student_notes FOR ALL
  USING (
    student_id IN (
      SELECT id FROM students WHERE class_id IN (SELECT auth.homeroom_class_ids())
    )
    OR auth.user_role() = 'admin'
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE class_id IN (SELECT auth.homeroom_class_ids())
    )
    OR auth.user_role() = 'admin'
  );

-- Announcements policies
CREATE POLICY "Wali kelas can manage announcements of their class"
  ON announcements FOR ALL
  USING (
    class_id IN (SELECT auth.homeroom_class_ids())
    OR auth.user_role() = 'admin'
  )
  WITH CHECK (
    class_id IN (SELECT auth.homeroom_class_ids())
    OR auth.user_role() = 'admin'
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'wali_kelas')
  );
  RETURN NEW;
END;
$;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
