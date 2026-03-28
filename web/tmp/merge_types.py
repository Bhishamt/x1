import json
import os

types_file = r'C:\Users\bhish\.gemini\antigravity\brain\73349845-a053-43e4-8e26-8717ff0177c8\.system_generated\steps\213\output.txt'
target_file = r'd:\n1\p1\abc\web\src\types\database.types.ts'

with open(types_file, 'r', encoding='utf-8') as f:
    data = json.load(f)
    new_types = data['types']

constants = """
// --- Application Constants & Helpers ---

/**
 * Common mapped types for convenience
 */
export type Notification = Tables<'notifications'>
export type Announcement = Tables<'announcements'>

/**
 * Global Role Map
 */
export const ROLE_MAP: Record<number, string> = {
  1: 'super_admin',
  2: 'hod',
  3: 'class_incharge',
  4: 'student'
}

/**
 * Static Department Codes
 */
export const DEPARTMENTS = ['CE', 'ME', 'EE', 'CS', 'EC', 'IT', 'COMMON']

/**
 * Exam Configuration
 */
export const EXAM_TYPES = [
  { key: 'ct_1', label: 'Class Test 1', maxMarks: 30 },
  { key: 'ct_2', label: 'Class Test 2', maxMarks: 30 },
  { key: 'house_test', label: 'House Test', maxMarks: 60 },
  { key: 'final_exam', label: 'Semester Final', maxMarks: 60 }
]

export const Constants = {
  public: {
    Enums: {},
  },
} as const
"""

# Find the end of the generated types (usually ends with a closing brace of some sort or just the end of the string)
# The generated types from Supabase usually end with something like `}` at the very bottom.
# I will just append the constants.

full_content = new_types + constants

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(full_content)

print("Successfully merged types and constants.")
