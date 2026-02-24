# MVP Definition
## ABC Polytechnic Digital Platform

---

## What is the MVP?

The Minimum Viable Product is the **smallest set of features** that delivers real value to both students and admins, validates the core concept, and is deployable for real use.

---

## MVP Feature Set

### ✅ Must Have (MVP)

#### Authentication
- [ ] Email/password login for students and admins
- [ ] Role-based redirect after login
- [ ] Session persistence / logout

#### Student Portal
- [ ] View own profile
- [ ] View results grouped by semester with grade
- [ ] View published announcements
- [ ] View notifications (with unread indicator)

#### Admin Panel
- [ ] Dashboard with student/course/announcement counts
- [ ] View all students (read-only list)
- [ ] Add/Edit/Delete courses
- [ ] Upload results (marks → auto grade)
- [ ] Create/Edit/Delete announcements
- [ ] Send notification to a student

#### Database
- [ ] All 7 tables with proper schema
- [ ] RLS policies on all tables
- [ ] Auth trigger for auto-profile creation
- [ ] Grade auto-compute trigger

---

### 🔄 Post-MVP (Phase 2)

| Feature | Reason Deferred |
|---|---|
| AI Chatbot | Requires API key management and prompt tuning |
| Realtime notifications (WebSocket) | Nice-to-have; polling works for MVP |
| Mobile app | Web covers core use case first |
| Result bulk upload (CSV) | Manual upload is viable for MVP |
| Announcement expiry / targeting by role | Nice-to-have; all announcements visible is simpler |
| Fee payment integration | Requires payment gateway setup |
| Timetable | Separate complex feature |
| Parent portal | Different user type, adds scope |
| RAG chatbot | Requires embedding infrastructure |

---

## MVP Success Criteria

| Criterion | Target |
|---|---|
| Admin can log in and upload results | ✅ <2 min per batch |
| Student can log in and see results | ✅ Instant |
| Admin can post an announcement | ✅ <30 sec |
| Student sees new announcement | ✅ On next page visit |
| No data leakage between students | ✅ RLS enforced |
| Build passes TypeScript check | ✅ Zero TS errors |

---

## MVP Timeline (Estimate)

| Week | Activities |
|---|---|
| Week 1 | DB schema, Supabase setup, auth system |
| Week 2 | Student portal (profile, results, announcements, notifications) |
| Week 3 | Admin panel (CRUD for all entities) |
| Week 4 | Testing, bug fixes, deployment |
| Week 5+ | Phase 2: chatbot, mobile, realtime |
