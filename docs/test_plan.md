# Test Plan
## ABC Polytechnic Digital Platform — v1.0

---

## 1. Testing Strategy

| Level | Tool | What |
|---|---|---|
| Type checking | `tsc --noEmit` | TypeScript errors |
| Build verification | `next build` | Production build passes |
| Manual (functional) | Browser | All user flows |
| Manual (security) | Browser DevTools | RLS, auth bypass attempts |
| Manual (mobile) | Expo Go | Mobile screens |

---

## 2. Test Cases

### 2.1 Authentication

| TC-ID | Description | Steps | Expected |
|---|---|---|---|
| TC-A01 | Valid student login | Enter valid student email + password → Submit | Redirect to `/student/profile` |
| TC-A02 | Valid admin login | Enter valid admin email + password → Submit | Redirect to `/admin/dashboard` |
| TC-A03 | Invalid password | Enter wrong password → Submit | Toast: error message shown |
| TC-A04 | Empty fields | Submit empty form | Form HTML5 validation prevents submit |
| TC-A05 | Logout | Click Sign Out | Redirect to `/login`, session cleared |
| TC-A06 | Direct URL access (unauth) | Visit `/student/profile` without login | Redirect to `/login` |
| TC-A07 | Student accessing admin route | Login as student, visit `/admin/dashboard` | Redirect to `/student/profile` |
| TC-A08 | Admin accessing student route | Login as admin, visit `/student/profile` | Redirect to `/admin/dashboard` |

---

### 2.2 Student — Profile

| TC-ID | Description | Expected |
|---|---|---|
| TC-SP01 | View profile | Full name, email, roll no, department, year all visible |
| TC-SP02 | Avatar initial | First letter of name shown in avatar circle |

---

### 2.3 Student — Results

| TC-ID | Description | Expected |
|---|---|---|
| TC-SR01 | View results | Results grouped by "2024-25 — Sem 5" with marks and grade |
| TC-SR02 | Grade display | Grade "A+" shown in green, "F" shown in red |
| TC-SR03 | Summary card | Percentage and failed subjects shown above table |
| TC-SR04 | No results | "No results published yet" empty state shown |
| TC-SR05 | Security: try fetching other student's results | RLS blocks query, returns empty set |

---

### 2.4 Student — Announcements

| TC-ID | Description | Expected |
|---|---|---|
| TC-SA01 | View published announcements | Pinned announcements appear first |
| TC-SA02 | Category badge | Exam = red, Event = purple, Placement = green |
| TC-SA03 | No announcements | "No announcements" empty state |

---

### 2.5 Student — Notifications

| TC-ID | Description | Expected |
|---|---|---|
| TC-SN01 | View notifications | List appears with type icon and time-ago |
| TC-SN02 | Unread indicator | Blue dot on unread, full opacity |
| TC-SN03 | Mark all read | Button appears, clicking marks all read |
| TC-SN04 | Realtime | Admin sends notification → student page auto-updates without refresh |

---

### 2.6 Student — Chatbot

| TC-ID | Description | Expected |
|---|---|---|
| TC-SC01 | Ask college question | "What is the fee for CS?" → College-relevant answer |
| TC-SC02 | Ask off-topic question | "Tell me a recipe" → Politely declined |
| TC-SC03 | Typing indicator | Three bouncing dots shown while awaiting response |
| TC-SC04 | Log created | After chat, `chatbot_logs` table has new row |

---

### 2.7 Admin — Courses

| TC-ID | Description | Expected |
|---|---|---|
| TC-AC01 | View course list | All courses in table with code, name, credits |
| TC-AC02 | Add course | Fill modal, save → new row appears |
| TC-AC03 | Edit course | Click edit, modify name, save → row updated |
| TC-AC04 | Delete course | Click delete, confirm → row removed |
| TC-AC05 | Duplicate code | Insert existing code → Supabase unique error shown in toast |

---

### 2.8 Admin — Results

| TC-ID | Description | Expected |
|---|---|---|
| TC-AR01 | Upload result | Select student + course + marks → save → row in table with auto grade |
| TC-AR02 | Grade computation | 85/100 → Grade "A+"; 35/100 → Grade "F" |
| TC-AR03 | Delete result | Row removed; student no longer sees it |

---

### 2.9 Admin — Announcements / Notifications

| TC-ID | Description | Expected |
|---|---|---|
| TC-AN01 | Create announcement | Fill form, save → appears in student announcements |
| TC-AN02 | Pin announcement | Check pin → appears first in student view |
| TC-AN03 | Draft announcement | Uncheck publish → not visible in student view |
| TC-AN04 | Send notification | Select student, fill title/message → student receives it |

---

## 3. Security Tests

| SC-ID | Test | Expected |
|---|---|---|
| SC-01 | Student queries another student's results via API | RLS returns empty / 0 rows |
| SC-02 | Direct Supabase REST call without auth header | 401 Unauthorized |
| SC-03 | Student calls POST /api/chatbot with >500 char message | 400 Bad Request |
| SC-04 | Inspect browser network — service role key visible? | Never appears in any client request |

---

## 4. TypeScript / Build Verification

```bash
# Web - type check
cd d:\n1\p1\abc\web
npx tsc --noEmit

# Web - production build
npm run build

# Mobile - type check
cd d:\n1\p1\abc\app
npx tsc --noEmit
```

All commands must exit with code 0.
