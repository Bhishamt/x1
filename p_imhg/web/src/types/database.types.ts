export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: { id: number; name: string }
        Insert: { id: number; name: string }
        Update: { id?: number; name?: string }
      }
      users: {
        Row: {
          id: string
          role_id: number
          full_name: string
          email: string
          roll_no: string | null
          department: string | null
          year: number | null
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role_id?: number
          full_name: string
          email: string
          roll_no?: string | null
          department?: string | null
          year?: number | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      courses: {
        Row: {
          id: string
          code: string
          name: string
          department: string
          year: number
          semester: number
          credits: number
          description: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      results: {
        Row: {
          id: string
          student_id: string
          course_id: string
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
          roll_no: string | null
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
      current_role_id: { Args: Record<string, never>; Returns: number }
    }
  }
}

// Convenience type aliases
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type UserProfile = Tables<'users'>
export type Course = Tables<'courses'>
export type Result = Tables<'results'>
export type Announcement = Tables<'announcements'>
export type Notification = Tables<'notifications'>
export type ChatbotLog = Tables<'chatbot_logs'>

export type UserRole = 'admin' | 'student'
