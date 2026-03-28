/**
 * Shared interfaces for newly implemented modules 
 * to ensure type safety and resolve TSC errors.
 */

export interface AttendanceRecord {
    id?: string;
    student_id: string;
    subject_id: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
    uploaded_by?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    type: 'exam' | 'holiday' | 'event' | 'deadline';
    target_department: string | null;
    target_semester: number | null;
    departments?: { name: string } | null;
}

export interface DocumentRecord {
    id: string;
    title: string;
    description: string | null;
    file_url: string;
    type: 'academic_calendar' | 'syllabus' | 'previous_paper' | 'form' | 'other';
    department_id: string | null;
    semester: number | null;
    academic_year: string | null;
    departments?: { name: string } | null;
    created_at?: string;
}

export interface SubjectRow {
    id: string;
    subject_name: string;
    subject_code: string;
    department_id: string;
    semester: number;
}
