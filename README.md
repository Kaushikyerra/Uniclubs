<div align="center">
<img width="1200" height="475" alt="UniClubs Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🏛️ UniClubs: University Club Management Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-AI_Assistant-orange?logo=google-gemini)](https://ai.google.dev/)

**UniClubs** is a sophisticated campus ecosystem designed to centralize and streamline student engagement. Built with a role-based architecture, it connects students, club leaders, and faculty mentors through a unified digital interface featuring AI-powered support and real-time event tracking.

---

## 🚀 Key Features

### 👤 Role-Based Dashboards
The platform provides a tailored experience for three distinct user levels:
* **Students:** Browse clubs by category, join communities, and manage personal event schedules.
* **Club Leads:** Manage memberships, approve join requests, and publish new events.
* **Faculty (Admin):** Oversee system-wide club approvals, monitor student participation, and mentor specific organizations.

### 🤖 AI Integration
Leveraging **Google Gemini AI** to enhance user experience:
* **UniBot Assistant:** A contextual chatbot that answers questions regarding club details and event schedules using real-time database context.
* **AI Description Generator:** Helps club leaders create compelling, professional club profiles instantly.

### 📅 Event Management
Full-cycle event lifecycle management including registration forms, dietary requirement tracking, and attendee list exports for organizers.

---

## 🛠️ Technical Stack

* **Frontend:** React 19 with TypeScript.
* **Styling:** Tailwind CSS and Lucide React icons.
* **State & Auth:** Supabase Auth and Context API.
* **Database:** PostgreSQL (via Supabase) with Row Level Security (RLS).
* **Analytics:** Interactive data visualization using Recharts.

---

## 📁 Project Structure

```text
├── components/          # Reusable UI (AIChatBot, Layout, ProtectedRoutes)
├── contexts/            # Global Auth and State providers
├── pages/               # Role-specific views (Admin, Dashboard, Clubs, Events)
├── services/            # Gemini AI, Supabase client, and Mock Data layers
├── supabase_schema.sql  # Database definitions and profile triggers
└── types.ts             # Centralized TypeScript interfaces
