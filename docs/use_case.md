# Use Case Diagram — ABC Polytechnic Digital Platform

```mermaid
graph TD
    %% Actors
    Student(["👤 Student"])
    Admin(["⚡ Admin"])
    OpenAI(["🤖 OpenAI API"])
    Supabase(["🗄️ Supabase"])

    %% Auth Use Cases
    Student -->|UC-1 Login| AuthSystem["🔐 Authentication System"]
    Admin   -->|UC-1 Login| AuthSystem
    AuthSystem -->|Verify credentials| Supabase

    %% Student Use Cases
    Student -->|UC-2 View Profile|       ViewProfile["👤 View Profile"]
    Student -->|UC-3 View Results|       ViewResults["📊 View Results"]
    Student -->|UC-4 View Announcements| ViewAnnounce["📢 View Announcements"]
    Student -->|UC-5 View Notifications| ViewNotifs["🔔 View Notifications"]
    Student -->|UC-6 Mark as Read|       MarkRead["✓ Mark Notifications Read"]
    Student -->|UC-7 Chat with AI|       Chatbot["🤖 AI Chatbot"]

    %% Admin Use Cases
    Admin -->|UC-8 View Dashboard|       Dashboard["🏠 Admin Dashboard"]
    Admin -->|UC-9 Manage Students|      ManageStudents["🎓 View Students"]
    Admin -->|UC-10 Manage Courses|      ManageCourses["📚 CRUD Courses"]
    Admin -->|UC-11 Upload Results|      UploadResults["📊 Upload Results"]
    Admin -->|UC-12 Manage Announcements| ManageAnnounce["📢 CRUD Announcements"]
    Admin -->|UC-13 Send Notifications|  SendNotifs["🔔 Send Notifications"]

    %% System connections
    ViewProfile      --> Supabase
    ViewResults      --> Supabase
    ViewAnnounce     --> Supabase
    ViewNotifs       --> Supabase
    MarkRead         --> Supabase
    Chatbot          --> OpenAI
    Chatbot          --> Supabase
    Dashboard        --> Supabase
    ManageStudents   --> Supabase
    ManageCourses    --> Supabase
    UploadResults    --> Supabase
    ManageAnnounce   --> Supabase
    SendNotifs       --> Supabase

    %% Styling
    style Student fill:#3b82f6,color:#fff,rx:50
    style Admin   fill:#8b5cf6,color:#fff,rx:50
    style OpenAI  fill:#10b981,color:#fff,rx:50
    style Supabase fill:#1e293b,color:#94a3b8,stroke:#3b82f6
```

---

## Use Case Descriptions

### UC-1: Login
- **Actor:** Student / Admin
- **Precondition:** User has valid credentials
- **Main Flow:** Enter email + password → System validates → Redirect to role dashboard
- **Alternate Flow:** Invalid credentials → Show error toast
- **Postcondition:** Authenticated session established

### UC-3: View Results
- **Actor:** Student
- **Precondition:** Authenticated as student, results exist
- **Main Flow:** Navigate to Results → System fetches results (RLS: student_id = user) → Display grouped by semester with grade
- **Postcondition:** Student views their academic performance

### UC-7: Chat with AI
- **Actor:** Student
- **Precondition:** Authenticated, OpenAI API available
- **Main Flow:** Type message → API validates → Send to OpenAI with college system prompt → Return response → Log to chatbot_logs
- **Alternate Flow:** API down → Return fallback message
- **Postcondition:** Chat logged to database

### UC-11: Upload Results
- **Actor:** Admin
- **Precondition:** Authenticated as admin, students and courses exist
- **Main Flow:** Select student, select course, enter marks → Submit → Grade auto-computed by DB trigger → Result saved
- **Postcondition:** Student can view result in their portal
