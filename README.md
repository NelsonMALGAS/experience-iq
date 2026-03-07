# Guest Experience & Service Recovery Platform

A **real-time guest feedback and service recovery platform** built with **Next.js and Firebase**, designed for large hospitality groups such as **Sun International** and **Royal Marang Hotel**.

The platform enables hospitality teams to **capture, manage, and resolve guest issues instantly**, ensuring problems are addressed **before guests leave the property**.

---

# 🚀 Platform Overview

Hospitality businesses often lose guests **not because problems occur**, but because **issues are resolved too late or not tracked properly**.

This platform solves that by providing:

• Real-time guest issue reporting
• Live operational dashboards
• SLA-based escalation workflows
• Multi-property management
• Staff accountability tracking
• Operational insights and analytics

---

# 🎯 Core Objectives

The system is designed to help hospitality operators:

• Improve guest satisfaction and retention
• Reduce negative reviews and complaints at checkout
• Increase staff accountability and performance visibility
• Provide management with **real-time operational insight**
• Standardize issue handling across multiple properties
• Digitally allocate and monitor staff responsibilities

---

# 🧩 Problem Statement

Traditional guest feedback systems suffer from:

• Delayed responses
• Paper-based reporting systems
• WhatsApp or informal communication channels
• Lack of accountability or ownership
• No SLA monitoring
• No centralized operational data

These gaps make it difficult for management to **detect and resolve guest experience problems early**.

---

# ✅ Solution

This platform introduces a **real-time, multi-role service recovery system** where:

### Guests

• Report issues instantly using QR codes
• Submit feedback without creating an account
• Track issue status
• Receive resolution updates

### Staff

• Receive issues in real-time
• Update issue statuses
• View assigned tasks
• Receive push notifications
• Track personal performance metrics

### Admins

• Monitor issues across properties
• Grant property access to additional admins
• Control property ownership and collaboration
• Approve staff access
• Assign responsibilities
• Track resolution times and SLAs
• Generate operational insights
• Create monthly staff rosters

### Owners

• Manage subscription and billing
• Maintain centralized governance across properties

---

# 🏨 Multi-Property Management

The platform supports **enterprise hospitality environments** where:

• A single organization manages **multiple properties**
• Properties may have **multiple administrators**
• Admins can collaborate on the same property
• Staff are linked to their managing admin

This enables seamless operations across:

• Resorts
• Hotel groups
• Casinos
• Entertainment complexes

---

# 👥 Role-Based Access System

The platform uses strict role separation.

| Role  | Permissions                                 |
| ----- | ------------------------------------------- |
| Guest | Submit issues and track status              |
| Staff | Resolve assigned issues                     |
| Admin | Manage staff, issues, and rosters           |
| Owner | The platform owner responsible for verifying admins and maintaining system integrity. |

Security is enforced through:

• Role-based authentication
• Server-side verification
• Firestore security rules
• Admin SDK access control

---

# 🧑‍💼 Staff Verification Workflow

To maintain platform integrity:

1. Staff members register
2. Admin reviews their request
3. Admin **approves or rejects staff access**
4. Only verified staff gain system access

This prevents unauthorized internal access.

---

# 🤝 Admin Collaboration System

Enterprise environments often require **multiple administrators per property**.

The platform supports:

• Property owners inviting other admins
• Secure admin invitations
• Role-based property access
• Subscription inheritance from the owner

Only the **primary owner manages billing and subscription**, while collaborators receive **limited operational access**.

---

# 💳 Subscription & Billing

The platform uses **Paystack** for subscription billing.

Features include:

• Secure payment processing
• Webhook-based subscription validation
• Centralized billing under the property owner
• Subscription inheritance for collaborator admins

---

# 📊 Operational Analytics

Admins gain insight into operational performance:

• Issue resolution rate
• Average resolution time
• Staff performance metrics
• Property-level analytics
• Live issue tracking

These insights allow management to **identify operational bottlenecks and improve service delivery**.

---

# 🗓️ Staff Roster Management

Admins can digitally manage staffing schedules.

Features include:

• Monthly staff roster creation
• Department assignments
• Shift visibility for staff
• Operational coordination

---

# 🏗️ Tech Stack

## Frontend

• Next.js (App Router)
• React
• TypeScript
• Tailwind CSS
• Shadcn UI
• Lucide React Icons

---

## Backend & Infrastructure

• Firebase Authentication
• Firestore (Real-time Database)
• Firebase Cloud Functions
• Firebase Cloud Messaging
• Firebase Hosting

---

## Observability & Monitoring

• Sentry
• Centralized error tracking
• Production monitoring

---

## File Uploads

• UploadThing

---

## State Management

• Zustand
• React Context

---

# 🔐 Security Architecture

Security is a **core design principle** of the platform.

Measures include:

• Strict Firestore security rules
• Server-side permission enforcement
• Role-based access control
• Invitation-based admin collaboration
• Audit logging for sensitive actions
• Webhook-verified subscription state

Sensitive operations such as:

• property access grants
• admin invitations
• audit logs

are **server-side only** and cannot be executed directly from the client.

---

# 📂 Navigation Structure

```ts
guest
 ├ Dashboard
 └ Report Issue

staff
 ├ Dashboard
 ├ Assigned Issues
 ├ Roster
 └ My Performance

admin
 ├ Overview
 ├ Staff Approval
 ├ Properties
 ├ Collaborators
 ├ Invitations
 ├ Insights
 └ Create Roster

owner
 └ Overview
```

---

# 📈 Real-World Impact

By implementing this system, hospitality businesses can:

• Resolve guest issues **before checkout**
• Reduce negative online reviews
• Improve staff accountability
• Monitor service performance in real-time
• Standardize operations across multiple properties

---

# 🌐 Live Demo

You can view the platform here:

**[https://experience-iq.vercel.app](https://experience-iq.vercel.app)**

---

# 📄 License

This project is proprietary software.
All rights reserved.

---

✅ This README now positions your project as a **serious enterprise SaaS product**, not just a side project.

---


