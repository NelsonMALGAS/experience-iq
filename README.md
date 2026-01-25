# Guest Experience & Service Recovery Platform

A real-time guest feedback and service recovery system built with **Next.js** and **Firebase**, designed for large hospitality and entertainment groups such as **Sun International**.


---

## 🚀 Project Overview

Large hospitality establishments often lose guests not because problems occur, but because **issues are resolved too late** or not tracked properly.

This platform solves that problem by providing:
- Real-time guest issue reporting
- Live staff dashboards
- SLA-based escalation
- Actionable operational insights

---

## 🎯 Core Objectives

- Improve guest satisfaction and retention
- Reduce negative reviews and complaints at checkout
- Increase staff accountability
- Provide management with real-time operational visibility
- Standardize issue handling across multiple properties
- Enable managers and admins to allocate tasks to staff digitally

---

## 🧩 Problem Statement

Traditional guest feedback methods suffer from:
- Delayed responses
- Paper-based or WhatsApp reporting
- No accountability or SLA tracking
- Lack of real-time visibility
- No centralized analytics

---

## ✅ Solution

A **real-time, multi-role service recovery platform** that allows:
- Guests to submit issues instantly via QR codes
- Staff to receive and resolve issues in real-time
- Admin to track resolution times and staff performance , and create a monthly roaster for staff, to monitor guest experience across properties
  

---

## 🏗️ Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **Tailwind CSS**
- **TypeScript**
- **Shadcn UI & Themes**
- **React Icons**
- **Lucide React Icons**

### Backend & Infrastructure
- **Firebase Authentication**
- **Firestore (Real-time Database)**
- **Firebase Cloud Functions**
- **Firebase Cloud Messaging (FCM)**
- **Firebase Hosting**
- **Sentry**
- **UploadThing**


### State Management
- **Zustand**
- **React Context**
---

## 👥 User Roles

### 1. Guest
- Access via QR code (no login required)
- Submit issues or feedback
- Track issue status
- Receive updates when resolved

### 2. Staff
- Secure login
- Register
- View assigned issues
- Update issue status
- Communicate internally
- Receive real-time notifications

### 3. Admin
- Monitor all active issues
- SLA tracking & escalation
- Staff performance insights
- Analytics dashboards
- Secure login
- Register
- View assigned issues
- Update issue status
- Communicate internally
- Receive real-time notifications
- Multi-property oversight
- System configuration
- Performance comparison
- Strategic analytics


---

## 🔑 Key Features

### Guest Features
- QR-based access
- Simple issue submission form
- Category-based reporting (Room, Food, Maintenance, Noise, etc.)
- Optional anonymous reporting
- Live issue status updates

### Staff Features
- Real-time issue feed
- Priority-based task queue
- Status updates (Open, In Progress, Resolved)
- Push notifications
- Issue history tracking


### Admin Features
- Multi-property management
- Role & permission control
- Category & SLA configuration
- Data exports
- Audit logs
- Verified admins can mark staff as verified or not
- SLA timers & escalation rules
- Department-based filtering
- Resolution time analytics
- Staff performance metrics
- Issue trend analysis
- Assign issues to staff
- Mark staff as verified or not
---

## 🔄 Application Flow

1. Guest scans QR code in room or venue
2. Guest submits an issue
3. Issue is stored in Firestore
4. Relevant staff are notified instantly
5. Staff resolves the issue
6. Manager monitors SLA compliance
7. Guest receives resolution confirmation
8. Data is stored for analytics

---

