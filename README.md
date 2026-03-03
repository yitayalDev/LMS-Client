# LMS UOG - Professional Learning Management System (Client)

![LMS Hero](https://via.placeholder.com/1200x600/0a0a0a/ffffff?text=LMS+UOG+Dashboard+Preview)

A premium, full-stack Learning Management System built with **Next.js 14**, **Tailwind CSS**, and **framer-motion**. This platform features high-end glassmorphism design, real-time interactivity, and a multi-tenant dashboard architecture.

## 🚀 Live Demo
- **Live Link:** [https://lms-client-adrw.vercel.app](https://lms-client-adrw.vercel.app)
- **Demo Access (One-Click):** Available on the login page for Admin, Instructor, and Student roles.

## ✨ Key Features
- **Modern UI/UX**: Professional dark theme with glassmorphic components and smooth transitions.
- **Multi-Role Dashboards**:
  - **Admin**: System-wide analytics, user management, and course approval workflow.
  - **Instructor**: Advanced course builder, student performance tracking, and earnings overview.
  - **Student**: Personalized learning path, progress tracking, and gamified achievements (badges/points).
- **Real-time Interaction**: Integrated messaging system using Socket.io for direct student-instructor communication.
- **Secure Authentication**: JWT-based auth with MFA (Multi-Factor Authentication) support and RBAC gating.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + ShadcnUI
- **Icons/Animations**: Lucide React + Framer Motion
- **State Management**: React Context API
- **API Client**: Axios with centralized interceptors

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yitayalDev/LMS-Client.git
   cd LMS-Client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:10000/api
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🔐 Security Note
All sensitive actions are restricted in **Demo Mode** to ensure the integrity of the showcase environment.

---
Developed by [Yitayal](https://github.com/yitayalDev)
