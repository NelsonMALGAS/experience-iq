<div align="center">

<br />

# ExperienceIQ

### Guest Experience & Service Recovery Platform

**Real-time issue management and service recovery for enterprise hospitality.**  
Built for hotel groups, resorts, and multi-property operators who demand operational excellence.

<br />

[![Live Platform](https://img.shields.io/badge/Live%20Platform-experience--iq.vercel.app-0f172a?style=for-the-badge&logo=vercel&logoColor=white)](https://experience-iq.vercel.app)
&nbsp;
![Status](https://img.shields.io/badge/Status-Production-22c55e?style=for-the-badge)
&nbsp;

---

</div>

## The Problem

Hospitality businesses lose guests **not because problems occur, but because they are resolved too late.**

Traditional feedback systems are broken:

| Pain Point | Impact |
|---|---|
| Paper-based reporting | Hours of delay before management is aware |
| WhatsApp & informal channels | No accountability, no audit trail |
| No SLA monitoring | Issues escalate undetected |
| No centralised data | Management flies blind |
| Delayed responses | Guest checks out dissatisfied |

The result: negative online reviews, lost repeat business, and no operational data to improve.

---

## The Solution

ExperienceIQ is a **real-time, multi-role service recovery platform** that closes the gap between a guest's problem and its resolution — while the guest is still on property.

```
Guest reports issue  →  Staff receives alert  →  Issue resolved  →  Guest satisfied
        │                       │                       │
   QR code scan           Live dashboard          Audit logged
   No account needed      SLA tracked             Analytics updated
```

---

## Platform Overview

### For Guests
- Report issues instantly using **QR codes** — no account required
- Submit feedback and track issue status in real time
- Receive resolution updates throughout their stay

### For Staff
- Receive and action issues the moment they are raised
- Update issue statuses and track personal performance metrics
- View assigned tasks and shift rosters
- Receive push notifications for critical escalations

### For Admins
- Monitor all issues across one or multiple properties from a single dashboard
- Approve staff access and manage role assignments
- Grant property access to collaborator admins
- Track resolution times and SLA compliance
- Generate operational insights and monthly staff rosters

### For Owners
- Manage subscription and billing through a centralised interface
- Maintain governance across all properties
- Retain sole authority over billing and access provisioning

---

## Multi-Property Architecture

ExperienceIQ is purpose-built for **enterprise hospitality environments** where a single organisation operates across multiple sites.

- One platform manages an entire property portfolio
- Properties support **multiple administrators** with granular access control
- Admins collaborate on shared properties without accessing each other's data
- Staff are scoped to their managing admin's properties
- Billing is consolidated under a single owner

Designed for hotel groups, casino resorts, entertainment complexes, and multi-site operators.

---

## Role-Based Access Control

Access is strictly enforced at every layer — authentication, Firestore rules, and server-side validation.

| Role | Core Permissions |
|---|---|
| **Guest** | Submit issues · Track resolution status |
| **Staff** | Resolve assigned issues · View roster · Track performance |
| **Admin** | Manage staff · Oversee properties · Invite collaborators · View analytics |
| **Owner** | Verify admins · Manage billing · Maintain system governance |

---

## Staff Verification Workflow

Platform integrity is maintained through a controlled onboarding process:

1. Staff member registers on the platform
2. Admin receives a verification request
3. Admin **approves or rejects** access
4. Only verified staff gain operational access

This prevents unauthorised internal access and ensures accountability from day one.

---

## Admin Collaboration System

Enterprise properties often require multiple administrators working in parallel. ExperienceIQ supports this securely:

- Primary admin (property owner) invites verified admins as collaborators
- Collaborators receive **scoped, property-level access** only
- Invitation flow is server-side with 7-day expiry and audit logging
- Collaborators **cannot access subscription data, billing, or other admins' properties**
- Access can be revoked instantly at any time

The primary owner remains the **single source of truth** for billing and governance.

---

## Subscription & Billing

Billing is handled via **Paystack**, with a secure, webhook-validated flow.

- Subscription state is the source of truth for platform access
- Webhooks validate and update access in real time
- Billing is centralised under the property owner
- Collaborator admins inherit access without separate billing accounts
- All payment data is handled server-side — never exposed to the client

---

## Operational Analytics

Admins gain actionable insight into operational performance across every property:

- Issue resolution rate and trend analysis
- Average resolution time per property and per staff member
- SLA compliance tracking
- Staff performance metrics
- Live issue monitoring across the portfolio

These insights allow management to **identify bottlenecks, improve service standards, and hold teams accountable** with data.

---

## Staff Roster Management

Digital staffing coordination, built into the same platform:

- Monthly roster creation per department
- Shift visibility for all staff members
- Department-level assignment management
- Integrated with the issue management workflow

---

## Security Architecture

Security is a **core design principle**, not an afterthought.

| Layer | Implementation |
|---|---|
| **Authentication** | Firebase Auth with session cookie validation |
| **Authorisation** | Role-based access enforced server-side on every request |
| **Database** | Strict Firestore security rules — client writes are blocked for sensitive collections |
| **Admin Collaboration** | Invitation-only access grants with full audit logging |
| **Billing** | Subscription state validated via Paystack webhook signatures (HMAC-SHA512) |
| **Observability** | Sentry error tracking and production monitoring |

Sensitive operations — including property access grants, admin invitations, and audit logs — are **server-side only** and cannot be triggered directly from the client under any circumstances.

---

## Tech Stack

**Frontend**

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework — SSR, streaming, server actions |
| TypeScript | Type safety across the full stack |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible, composable component library |
| Lucide React | Icon system |
| Zustand / React Context | Client-side state management |

**Backend & Infrastructure**

| Technology | Purpose |
|---|---|
| Firebase Authentication | Session management and identity |
| Firestore | Real-time document database |
| Firebase Cloud Functions | Server-side background processing |
| Firebase Cloud Messaging | Push notifications for staff |
| Vercel | Hosting and edge deployment |
| UploadThing | Managed file uploads |
| Sentry | Error tracking and production observability |
| Paystack | Subscription billing and webhook processing |

---

## Navigation Structure

```
guest/
├── Dashboard
└── Report Issue

staff/
├── Dashboard
├── Assigned Issues
├── Roster
└── My Performance

admin/
├── Overview
├── Staff Approval
├── Properties
├── Collaborators
├── Invitations
├── Insights
└── Create Roster

owner/
└── Overview
```

---

## Real-World Impact

Hospitality operators using ExperienceIQ can expect to:

- **Resolve guest issues before checkout** — eliminating the window for negative reviews
- **Reduce complaint escalations** by catching problems at the source
- **Improve staff accountability** through transparent, trackable task ownership
- **Monitor service performance in real time** across every property
- **Standardise operations** across multi-property portfolios with a single platform

---

## Live Demo

The platform is live and available for evaluation:

**[https://experience-iq.vercel.app](https://experience-iq.vercel.app)**

| Role | Credentials |
|---|---|
| Admin | admin@gmail.com / 123456789 |
| Staff | staff@gmail.com / 123456789 |
| Guest | Property Code: `JVBHTG` · Rooms: 101, 102, 103 |

> **Note:** Please log out between role switches. The platform uses session-based authentication.

---

## License

This software is **proprietary and confidential**.  
All rights reserved. Unauthorised use, reproduction, or distribution is strictly prohibited.

&copy; 2026 ExperienceIQ. All rights reserved.

---

<div align="center">

*Built for hospitality operators who refuse to leave guest experience to chance.*

</div>