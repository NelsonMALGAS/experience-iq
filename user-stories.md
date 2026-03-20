
# User Stories – Guest Experience & Service Recovery Platform (MVP)

This document defines the **Minimum Viable Product (MVP)** user stories for the Guest Experience & Service Recovery Platform.

---

## 🧍 Guest User Stories

### Issue Submission

* [x] As a **guest**, I want to submit an issue without creating an account, so that I can report problems quickly and easily.
* [x] As a **guest**, I want to access the issue form by scanning a QR code, so that I can report issues from anywhere on the property.
* [x] As a **guest**, I want to select an issue category, so that my issue is routed to the correct department.
* [x] As a **guest**, I want to describe my issue in my own words, so that staff clearly understand the problem.
* [x] As a **guest**, I want to optionally upload images, so that I can better explain the issue.

### Transparency & Trust

* [x] As a **guest**, I want to see the current status of my submitted issue, so that I know it is being addressed.
* [x] As a **guest**, I want to receive confirmation when my issue is resolved, so that I feel acknowledged.
* [x] As a **guest**, I want the option to submit issues anonymously, so that I feel safe reporting issues honestly.

---

## 🧑‍🔧 Staff User Stories

### Authentication & Access

* [x] As a **staff member**, I want to log in securely, so that only authorized users can access internal dashboards.
* [x] As a **staff member**, I want to see only issues assigned to my property and department, so that I can focus on relevant tasks.

### Issue Management

* [x] As a **staff member**, I want to see a real-time list of active issues, so that I can respond quickly.
* [x] As a **staff member**, I want to accept or be assigned an issue, so that responsibility is clearly defined.
* [x] As a **staff member**, I want to update the status of an issue (Open, In Progress, Resolved), so that progress is visible to admins and guests.
* [x] As a **staff member**, I want to see issue priority levels, so that I can address urgent issues first.
* [x] As a **staff member**, I want to view full issue details (category, description, images), so that I understand the problem before acting.

### Accountability & Communication

* [x] As a **staff member**, I want my actions on an issue to be logged, so that accountability is maintained.
* [x] As a **staff member**, I want to receive real-time notifications when an issue is assigned to me, so that I do not miss critical tasks.

---

## 🧑‍💼 Admin User Stories

*(Admins include managers, supervisors, and executives)*

### Operational Oversight

* [x] As a **admin**, I want to log in securely, so that only authorized users can access internal dashboards.
* [x] As an **admin**, I want to view all active issues for my property or properties, so that I have full operational visibility.
* [x] As an **admin**, I want to filter issues by category, department, priority, and status, so that I can identify problem areas quickly.
* [x] As an **admin**, I want to see how long issues have been open, so that I can monitor SLA compliance.

### SLA & Performance Management

* [ ] As an **admin**, I want to be alerted when an issue exceeds its SLA, so that I can intervene before guest dissatisfaction increases.
* [x] As an **admin**, I want to assign or reassign issues to staff, so that issues are resolved efficiently.
* [x] As an **admin**, I want to track staff response and resolution times, so that I can measure performance and accountability.

### Analytics & Reporting

* [x] As an **admin**, I want to view basic analytics (issue counts, resolution times, SLA compliance), so that I can make data-driven decisions.
* [x] As an **admin**, I want to view issue trends over time, so that I can proactively prevent recurring problems.
* [x] As an **admin**, I want to compare performance across multiple properties, so that I can identify top-performing and underperforming locations.

---

## 🔔 Notification User Stories

* [x] As a **staff member**, I want to receive real-time notifications when new issues are created or assigned to me, so that I can respond immediately.
* [ ] As an **admin**, I want to receive alerts when SLAs are breached, so that corrective action can be taken.
* [ ] As a **guest**, I want to receive a notification when my issue is resolved, so that I know it was handled.

---

## 🔐 Security & Governance User Stories

* [x] As an **admin**, I want role-based access control, so that users only see data relevant to their role.
* [x] As an **admin**, I want secure authentication for staff and admins, so that operational data is protected.
* [x] As an **admin**, I want data isolation per property, so that information does not leak across properties.
* [x] As an **admin**, I want all issue actions to be audit-logged, so that the system is compliance-ready.



## ✅ Verified User User Stories (Admin & Staff)

> Admin and Staff users must be **verified by the system** before gaining access to sensitive data, operational controls, or management features.
> Verification is a mandatory gate **after authentication** and **before privilege escalation**.

---

### 🔐 Verification & Access Control

* [x] As a **staff member**, I want my account to require verification before I can access operational data, so that sensitive guest and property information is protected.
* [x] As an **admin**, I want staff accounts to be verified before they gain staff-level privileges, so that only trusted personnel can manage guest issues.
* [x] As an **admin**, I want my own account to require verification before accessing administrative controls, so that critical system functions are protected.

---

### 🚫 Restricted Access (Unverified Users)

* [x] As an **unverified staff member**, I want to see a restricted dashboard state, so that I understand my access is limited until verification is complete.
* [x] As an **unverified admin**, I want to be prevented from viewing sensitive analytics and user data, so that system security is maintained.
* [x] As an **unverified staff or admin**, I must not be able to trigger data-fetching actions for sensitive information, so that no data is leaked unintentionally.

---

### 📊 Data Visibility & Fetching Rules

* [x] As a **verified staff member**, I want to access issue details, assignments, and performance metrics, so that I can perform my duties effectively.
* [x] As a **verified admin**, I want to access analytics, user management, and property-level data, so that I can oversee operations.
* [x] As the **system**, I must block all sensitive data queries for unverified staff and admins, so that verification is enforced server-side.

---

### 🧭 UX & Transparency

* [x] As a **staff or admin user**, I want to see a clear “Pending Verification” message when my account is not yet verified, so that I understand why access is restricted.
* [x] As a **staff or admin user**, I want restricted features to appear disabled or locked rather than missing, so that the experience feels intentional and trustworthy.

---

### 🛡️ Governance & Security

* [x] As an **admin**, I want verification status to be enforced on the server, so that client-side manipulation cannot bypass restrictions.
* [x] As an **admin**, I want all verification state changes to be audit-logged, so that access decisions are traceable and compliance-ready.

---


# 💳 Subscription & Billing User Stories (Paystack)

## 🧑‍💼 Owner (Primary Account Holder)

### Subscription Management

* [x] As an **owner**, I want to subscribe to a paid plan, so that I can access the platform for my properties.
* [x] As an **owner**, I want to choose between different pricing plans, so that I can select what best fits my business needs.
* [x] As an **owner**, I want my subscription status to control platform access, so that unpaid accounts cannot use the system.

### Payment Processing

* [x] As an **owner**, I want to pay securely using Paystack, so that transactions are safe and reliable.
* [x] As the **system**, I want to verify payments via Paystack webhooks, so that subscription status is always accurate and cannot be tampered with client-side.
* [x] As an **owner**, I want to receive confirmation after a successful payment, so that I know my subscription is active.

### Subscription Lifecycle

* [x] As an **owner**, I want my subscription to automatically renew, so that I maintain uninterrupted access.
* [x] As an **owner**, I want to cancel my subscription, so that I can stop future billing.
* [x] As the **system**, I want to restrict access when a subscription expires or fails, so that only paying customers can use the platform.

---

# 🏢 Multi-Property & Ownership User Stories

## Ownership & Governance

* [x] As an **owner**, I want to be the only entity responsible for billing, so that financial control is centralized.
* [x] As an **owner**, I want to manage multiple properties under one subscription, so that I can operate at scale.
* [x] As an **owner**, I want to grant admins access to specific properties, so that management responsibilities can be delegated.

---

# 👥 Admin Collaboration User Stories

## Invitations & Access Control

* [x] As an **admin**, I want to invite other admins to collaborate on a property, so that management can be shared.
* [x] As the **system**, I want invitations to expire after a set period, so that unused invites do not remain valid indefinitely.
* [x] As an **admin**, I want to revoke collaborator access, so that I maintain control over who can manage my properties.

## Access Restrictions

* [x] As a **collaborator admin**, I want to access only the properties I was invited to, so that data isolation is maintained.
* [x] As a **collaborator admin**, I must not access billing or subscription data, so that financial governance remains with the owner.

---

# 🔔 Billing & System Notifications

* [x] As an **owner**, I want to receive notifications when a payment succeeds or fails, so that I can take action if needed.
* [x] As an **owner**, I want to be alerted before my subscription expires, so that I can renew in time.
* [ ] As an **admin**, I want to be notified if the platform access is restricted due to billing issues, so that I understand system limitations.

---

# 🔐 Billing Security & Compliance

* [x] As the **system**, I must process all payments server-side, so that sensitive payment data is never exposed to the client.
* [x] As the **system**, I must validate all Paystack webhook signatures, so that only legitimate payment events are processed.
* [x] As the **system**, I must log all billing-related events, so that financial activity is auditable.

---

# 🚫 Access Control Based on Subscription

* [x] As the **system**, I must block all platform access if the subscription is inactive, so that only paying customers can use the system.
* [x] As an **admin**, I want to see a clear “Subscription Required” state if billing is inactive, so that I understand why access is restricted.
* [x] As a **staff member**, I want restricted access if the subscription is inactive, so that system rules are consistently enforced.

---

# 📊 Billing & Insights 

* [ ] As an **owner**, I want to view billing history, so that I can track past payments.
* [ ] As an **owner**, I want to download invoices, so that I can maintain financial records.
* [ ] As an **owner**, I want to see usage insights (e.g., number of issues, properties), so that I can understand platform value.

---


## 🔄 MVP Scope Clarification

The MVP **includes**:

* [x] Authentication for guests, staff, and admins
* [x] Mandatory verification for staff and admins
* [x] Server-side enforcement of verification rules
* [x] Restricted dashboard states for unverified users
* [x] Prevention of sensitive data fetching until verification
* [x] Subscription-based access control
* [x] Paystack payment integration (secure + webhook validated)
* [x] Owner-level billing and governance
* [x] Multi-property ownership model
* [x] Admin collaboration with scoped access

---


## 🏁 MVP Scope Summary

The MVP includes:

* [ ] QR-based guest issue submission
* [x] Real-time issue visibility for staff
* [x] Issue assignment and status tracking
* [x] SLA monitoring and escalation
* [x] Admin dashboards and analytics
* [x] Secure role-based access control

---

## 📌 Out of Scope (Post-MVP)

* [ ] AI-powered sentiment analysis
* [ ] Predictive maintenance
* [ ] PMS system integrations
* [ ] Multi-language support
* [ ] Advanced BI dashboards

---

## ✅ MVP Success Criteria

* [x] Guests can submit an issue in under 1 minute
* [x] Issues appear in staff dashboards in real time
* [x] Admins can identify SLA breaches instantly
* [x] Staff accountability is visible through audit logs
* [x] Admins can view performance per property

---

## 📄 Document Status

**Version:** 1.2
**Scope:** MVP
**Status:** Ready for Production

---


