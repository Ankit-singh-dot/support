# Freshdesk-Inspired Design Specification: Support Desk System

This document outlines the UI/UX architecture and design language inspired by Freshdesk (Freshworks Helpdesk).

---

## 1. Information Architecture & Navigation

The application consists of two primary operational areas:

### A. Customer Support Portal
- Clean, focused self-service portal.
- **Top Navigation Bar**:
  - Logo / Brand ("FreshSupport Portal")
  - Navigation links: "My Tickets", "Submit Ticket"
  - User profile menu / Clerk `UserButton`
- **Customer Pages**:
  - **Overview / Dashboard**: Recent tickets snapshot, quick status summary.
  - **My Tickets Table**: Search by subject, filter by Status (`OPEN`, `IN_PROGRESS`, `WAITING_ON_CUSTOMER`, `RESOLVED`).
  - **Submit Ticket Form**: Intuitive subject, priority, description input with immediate client-side validation.
  - **Ticket Detail**: Conversation stream of public agent replies, customer reply box, status timeline.

### B. Internal Support Staff Workspace (Agent & Admin)
- Multi-column helpdesk layout:
  - **Collapsible Left Sidebar**:
    - Dashboard Overview (`/staff/dashboard`)
    - All Tickets (`/staff/tickets`)
    - My Assigned Tickets (`/staff/assigned`)
    - User / Agent Management (`/staff/agents` — Admin only)
  - **Top Workspace Bar**:
    - Quick search bar
    - Active role pill (`Admin` or `Agent`)
    - User profile dropdown & logout
  - **Main Working Area**:
    - Ticket list view with status filter tabs, priority pills, assignee selector, and overdue warnings.
  - **Ticket Detail View (Freshdesk Two-Column Pattern)**:
    - **Left / Main Column**:
      - Ticket ID & Subject header
      - Submitter metadata (Customer name, email, time elapsed)
      - Chronological conversation timeline
      - Tabbed composer: Public Reply (Blue border) vs. Internal Note (Yellow/Amber background for clear distinction)
      - Submit action button
    - **Right Properties Panel**:
      - Status dropdown (`OPEN`, `IN_PROGRESS`, `WAITING_ON_CUSTOMER`, `RESOLVED`)
      - Priority dropdown (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
      - Assignee selector (Agents list + unassigned)
      - Overdue indicator banner (Red alert if `createdAt > 24h` and not `RESOLVED`)
      - Timestamp metadata (Created, Last updated)
      - Ticket Activity Log timeline tab

---

## 2. Visual Hierarchy & Color Palette

Inspired by the Freshdesk visual language:

- **Primary Brand Color**: Freshdesk Teal / Blue (`#12344D`, `#1273EB`, `#2C5CC5`)
- **Status Colors**:
  - `OPEN`: Blue badge (`bg-blue-100 text-blue-800 border-blue-200`)
  - `IN_PROGRESS`: Amber badge (`bg-amber-100 text-amber-800 border-amber-200`)
  - `WAITING_ON_CUSTOMER`: Purple badge (`bg-purple-100 text-purple-800 border-purple-200`)
  - `RESOLVED`: Green badge (`bg-emerald-100 text-emerald-800 border-emerald-200`)
- **Priority Colors**:
  - `LOW`: Slate (`bg-slate-100 text-slate-700`)
  - `MEDIUM`: Blue (`bg-sky-100 text-sky-700`)
  - `HIGH`: Orange (`bg-orange-100 text-orange-700 font-medium`)
  - `URGENT`: Red (`bg-rose-100 text-rose-800 font-semibold ring-1 ring-rose-300`)
- **Overdue Indicator**:
  - Warning tag: `bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5`
- **Internal Note Composer**:
  - Warm amber workspace (`bg-amber-50/60 border border-amber-200`) with a prominent "Private Internal Note - Only visible to support agents" banner to eliminate accidental public leaks.

---

## 3. Responsive Adaptations

- Large screens (`>= 1024px`): Full two-column ticket workspace with sticky right properties panel.
- Medium/Small screens (`< 1024px`): Collapsible sidebar; right properties panel moves into a toggleable drawer or stacked below the conversation stream.
