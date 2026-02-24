# ER Diagram — ABC Polytechnic Digital Platform

```mermaid
erDiagram
    roles {
        smallint id PK
        text name
    }

    users {
        uuid id PK
        smallint role_id FK
        text full_name
        text email
        text roll_no
        text department
        smallint year
        text avatar_url
        text phone
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    courses {
        uuid id PK
        text code
        text name
        text department
        smallint year
        smallint semester
        smallint credits
        text description
        boolean is_active
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    results {
        uuid id PK
        uuid student_id FK
        uuid course_id FK
        text exam_type
        numeric marks_obtained
        numeric max_marks
        text grade
        smallint semester
        text academic_year
        text remarks
        uuid uploaded_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    announcements {
        uuid id PK
        text title
        text content
        text category
        smallint target_role FK
        boolean is_pinned
        boolean is_published
        timestamptz published_at
        timestamptz expires_at
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        text title
        text message
        text type
        boolean is_read
        text action_url
        timestamptz created_at
    }

    chatbot_logs {
        uuid id PK
        uuid user_id FK
        text session_id
        text user_message
        text bot_response
        integer tokens_used
        integer response_ms
        boolean is_flagged
        text platform
        timestamptz created_at
    }

    roles        ||--o{ users         : "has role"
    users        ||--o{ results       : "student has"
    courses      ||--o{ results       : "course has"
    users        ||--o{ notifications : "receives"
    users        ||--o{ chatbot_logs  : "generates"
    users        ||--o{ announcements : "created_by"
    users        ||--o{ courses       : "created_by"
    roles        ||--o{ announcements : "target_role"
```

---

## Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| roles → users | 1:N | One role assigned to many users |
| users → results | 1:N | A student has many result records |
| courses → results | 1:N | A course has results for many students |
| users → notifications | 1:N | A student receives many notifications |
| users → chatbot_logs | 1:N | A user generates many chatbot conversations |
| users → announcements | 1:N | An admin creates many announcements |
| roles → announcements | 1:N | Announcements can be targeted to a role |

---

## Key Constraints

- `results` has UNIQUE constraint on `(student_id, course_id, exam_type, semester, academic_year)`
- `users.roll_no` is UNIQUE (students only, nullable for admins)
- `users.email` is UNIQUE
- `courses.code` is UNIQUE
- Grade is **auto-computed** via PostgreSQL trigger based on percentage
