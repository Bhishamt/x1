// Minimal type aliases mirroring the web app's database.types.ts
export interface Database {
    public: { Tables: Record<string, any>; Views: Record<string, any>; Functions: Record<string, any> }
}

export interface UserProfile {
    id: string; role_id: number; full_name: string; email: string
    roll_no: string | null; department: string | null; year: number | null
    avatar_url: string | null; phone: string | null; is_active: boolean
    created_at: string; updated_at: string
}
export interface Course {
    id: string; code: string; name: string; department: string
    year: number; semester: number; credits: number
    description: string | null; is_active: boolean; created_at: string
}
export interface Result {
    id: string; student_id: string; course_id: string; exam_type: string
    marks_obtained: number; max_marks: number; grade: string | null
    semester: number; academic_year: string; created_at: string
}
export interface Announcement {
    id: string; title: string; content: string; category: string
    is_pinned: boolean; is_published: boolean; published_at: string | null; created_at: string
}
export interface Notification {
    id: string; user_id: string; title: string; message: string
    type: string; is_read: boolean; action_url: string | null; created_at: string
}
