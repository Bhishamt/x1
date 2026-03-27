# Vision Document
## ABC Polytechnic Digital Platform

**Version:** 1.0 | **Date:** February 2026 | **Author:** Final Year Project Team

---

## 1. Project Overview

The **ABC Polytechnic Digital Platform** is a unified college management ecosystem that digitises the academic experience for both students and administrative staff. It replaces paper-based and fragmented systems with a modern, real-time, mobile-first platform.

---

## 2. Problem Statement

Current challenges:
- Results are manually distributed, causing delays and errors
- Announcements are posted on physical notice boards, missing many students
- No real-time communication channel between admin and students
- No centralised digital profile for students
- Administrative overhead is high for data management

---

## 3. Vision Statement

> *"To create a seamless, secure, and intelligent digital ecosystem for ABC Polytechnic — empowering students with instant access to their academic data and enabling administrators to manage the institution efficiently from anywhere."*

---

## 4. Target Users

| User | Description |
|---|---|
| **Student** | Active enrolled students of ABC Polytechnic |
| **Admin** | Faculty and administration staff with elevated access |

---

## 5. Goals

1. **Digitise** results, notifications, and announcements
2. **Enable** real-time communication via Supabase Realtime
3. **Provide** an AI-powered chatbot for student queries
4. **Secure** all data with Row Level Security
5. **Scale** easily via Supabase's managed PostgreSQL

---

## 6. Success Metrics

- 100% of students can view results digitally
- Admin can upload results within 2 minutes per batch
- Chatbot resolves 70%+ queries without human intervention
- Platform load time < 2 seconds on standard connection
- Zero unauthorized data access (RLS enforcement)

---

## 7. Scope

### In Scope
- Web portal (Next.js)
- Mobile app (Expo React Native)  
- Student features: profile, results, announcements, notifications, chatbot
- Admin features: full CRUD for courses, results, announcements, notifications
- Supabase backend (auth, DB, realtime)

### Out of Scope (Future)
- Fee payment gateway
- Timetable management
- Online examination system
- Parent portal
