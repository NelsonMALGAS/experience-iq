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
- Create roster(monthly shifts for staff)
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

## ⏱️ What is an SLA?

**SLA** stands for **Service Level Agreement**.

In this platform, an **SLA defines the maximum acceptable time allowed to respond to and resolve a guest issue**.

---

## 📌 How SLA works in the app

* Each **issue category** (e.g. Housekeeping, Maintenance, F&B) has a predefined SLA time.
* The SLA timer **starts automatically** when a guest submits an issue.
* The platform continuously tracks how long the issue has been open.
* If the issue is **not resolved within the SLA time**, it is considered **breached**.

---

## 🚨 SLA Breach

An **SLA breach** occurs when:

* The issue remains unresolved after the allowed SLA time expires.

When this happens, the system:

* Visually flags the issue as **Overdue**
* Notifies **Admins** in real time
* Allows the issue to be **escalated or reassigned**
* Logs the breach for reporting and performance tracking

---

## 🎯 Why SLAs matter

SLAs help the business to:

* Ensure consistent guest service standards
* Hold staff accountable
* Identify operational bottlenecks
* Prevent negative guest experiences before checkout
* Improve response times and guest satisfaction

---

## 🧠 Example

> **Housekeeping Issue SLA:** 30 minutes
>
> If a guest reports a room cleanliness issue at **14:00**, it must be resolved by **14:30**.
>
> If unresolved at **14:30**, the issue is marked as **SLA Breached** and escalated to an Admin.

---

NB: SOME PARTS OF THE APP STILL USING DUMMY DATA




