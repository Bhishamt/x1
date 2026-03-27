export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: { id: number; name: string; level: number }
        Insert: { id: number; name: string; level?: number }
        Update: { id?: number; name?: string; level?: number }
      }
      departments: {
        Row: { id: string; name: string; code: string; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; code: string; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['departments']['Insert']>
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          status?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          role_id: number
          department_id: string | null
          full_name: string
          email: string
          roll_no: number | null
          year: number | null
          semester: number | null
          academic_year: string | null
          scheme: string | null
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role_id?: number
          department_id?: string | null
          full_name: string
          email: string
          roll_no?: number | null
          year?: number | null
          semester?: number | null
          academic_year?: string | null
          scheme?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      admins: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          role: string
          department_id: string | null
          semester: number | null
          phone: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['admins']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['admins']['Insert']>
      }
      subjects: {
        Row: {
          id: string
          subject_code: string
          subject_name: string
          department_id: string
          semester: number
          scheme: string
          credits: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>
      }
      results: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          exam_type: string
          marks_obtained: number
          max_marks: number
          grade: string | null
          semester: number
          academic_year: string
          remarks: string | null
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['results']['Row'], 'id' | 'grade' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['results']['Insert']>
      }
      result_corrections: {
        Row: {
          id: string
          result_id: string
          student_id: string
          subject_code: string
          exam_type: string
          semester: number
          academic_year: string
          old_marks: number
          new_marks: number
          reason: string
          status: 'pending' | 'approved' | 'rejected'
          requested_by: string
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['result_corrections']['Row'], 'id' | 'status' | 'reviewed_by' | 'reviewed_at' | 'created_at'>
        Update: Partial<Database['public']['Tables']['result_corrections']['Insert']> & { status?: 'pending' | 'approved' | 'rejected'; reviewed_by?: string; reviewed_at?: string }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          target_role: number | null
          is_pinned: boolean
          is_published: boolean
          published_at: string | null
          expires_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      announcement_reads: {
        Row: {
          id: string
          announcement_id: string
          user_id: string
          read_at: string
        }
        Insert: Omit<Database['public']['Tables']['announcement_reads']['Row'], 'id' | 'read_at'>
        Update: Partial<Database['public']['Tables']['announcement_reads']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          platform: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['push_tokens']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['push_tokens']['Insert']>
      }
      chatbot_logs: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          user_message: string
          bot_response: string
          tokens_used: number | null
          response_ms: number | null
          is_flagged: boolean
          platform: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chatbot_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chatbot_logs']['Insert']>
      }
    }
    Views: {
      student_result_summary: {
        Row: {
          student_id: string
          full_name: string
          roll_no: number | null
          academic_year: string
          semester: number
          total_subjects: number
          percentage: number
          failed_subjects: number
        }
      }
    }
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
      is_super_admin: { Args: Record<string, never>; Returns: boolean }
      is_staff: { Args: Record<string, never>; Returns: boolean }
      current_role_id: { Args: Record<string, never>; Returns: number }
      user_department: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type UserProfile = Tables<'users'>
export type Subject = Tables<'subjects'>
export type Result = Tables<'results'>
export type ResultCorrection = Tables<'result_corrections'>
export type Announcement = Tables<'announcements'>
export type AnnouncementRead = Tables<'announcement_reads'>
export type Notification = Tables<'notifications'>
export type PushToken = Tables<'push_tokens'>
export type ChatbotLog = Tables<'chatbot_logs'>
export type Admin = Tables<'admins'>

export type UserRole = 'super_admin' | 'hod' | 'class_incharge' | 'student'

// Role ID to name mapping
export const ROLE_MAP: Record<number, UserRole> = {
  1: 'super_admin',
  2: 'hod',
  3: 'class_incharge',
  4: 'student',
}

// Exam types with their max marks
export const EXAM_TYPES = [
  { key: 'class_test_1', label: 'Class Test 1', maxMarks: 30 },
  { key: 'class_test_2', label: 'Class Test 2', maxMarks: 30 },
  { key: 'house_test', label: 'House Test', maxMarks: 60 },
  { key: 'final_exam', label: 'Final Exam', maxMarks: 60 },
] as const

export type ExamTypeKey = typeof EXAM_TYPES[number]['key']

// Departments
export const DEPARTMENTS = [
  'Computer Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Electronics & Communication',
  'Information Technology',
  'Architecture Assistantship',
  'COMMON',
] as const

// Year → Semester mapping (diploma)
export const YEAR_SEMESTERS: Record<number, number[]> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
}
