# Product / UX Rebaseline — Choufli Hal → Choufli HVAC

**Date:** 2026-08-25  
**Author:** OpenCode (automated)  
**Status:** DRAFT — awaiting approval before any implementation

---

## A. Vision

Transform Choufli Hal from a Tunisian general marketplace into a **professional U.S. HVAC lead generation, booking, and contractor management platform** — used as a **sales demo** to approach HVAC companies in the Phoenix, AZ market.

**North Star metric:** A demo visitor can complete a full Service Request → Contractor Match → Appointment Booking flow in < 5 minutes with realistic Phoenix HVAC data.

---

## B. Current State Audit

### B.1 Backend (Healthy)

| Layer | Status | Notes |
|-------|--------|-------|
| Auth (JWT + RBAC) | ✅ Complete | `/auth/login`, `/auth/register/customer`, `/auth/register/contractor`, `/auth/me`. Roles: CUSTOMER, CONTRACTOR, ADMIN. |
| User + ContractorProfile | ✅ Complete | User implements UserDetails. ContractorProfile has businessName, specialties, baseRate, acceptsEmergency, averageRating, isVerified, etc. |
| ServiceRequest | ✅ Complete | Full lifecycle: NEW → MATCHED → ACCEPTED → SCHEDULED → COMPLETED/CANCELLED. Urgency enum: ROUTINE/URGENT/EMERGENCY. |
| LeadAssignment | ✅ Complete | SENT → ACCEPTED/REJECTED/EXPIRED. QuotedPrice, contractorNotes. |
| Appointment | ✅ Complete | SCHEDULED → COMPLETED/CANCELLED/NO_SHOW. scheduledStart/End, notes, completionNotes. |
| Review | ✅ Complete | 5-axis rating: overall, quality, professionalism, punctuality, communication. Comment. |
| Availability | ✅ Complete | DayOfWeek + startTime/endTime + isEmergencyAvailable. |
| ServiceArea | ✅ Complete | ZipCode-based coverage. City, state. |
| Demo Data | ✅ Complete | 1 Admin, 3 Customers, 5 Contractors, 5 ServiceRequests, 6 LeadAssignments, 3 Appointments (1 completed w/ review), ServiceAreas, Availability. |
| Controllers | ✅ Complete | All CRUD endpoints exist with proper @PreAuthorize annotations. |
| **Missing backend** | ⚠️ | No customer PUT /users/me endpoint (profile update). No contractor-specific "get available leads" endpoint beyond my-leads. No admin analytics endpoint. |

### B.2 Frontend (Mixed)

| Component | State | Category |
|-----------|-------|----------|
| `log-in` | ✅ Production-ready | Slice C — approved |
| `register` (customer) | ✅ Production-ready | Slice D — approved |
| `register-contractor` | ✅ Production-ready | Slice E — approved |
| `nav` | ⚠️ Partially wired | Has AuthService subscription, but menu items hard-coded French strings, no role-based nav |
| `home` | ❌ Legacy Tunisian | Categories: Plumbing, Electricity, Baby sitting, Paint, DIY. Slogan: "Quick Fixes, Big Smiles". Tunisian company copy. |
| `annonces` | ❌ Legacy Tunisian | Generic announcement card listing (Tunisian marketplace feature) |
| `annonceform` | ❌ Legacy Tunisian | Annonce creation form (no HVAC relevance) |
| `missions` | ❌ Stub/empty | Hardcoded "0" counters, empty tab content. French labels. |
| `profile` | ⚠️ Partially wired | Uses AuthService, but updateProfile is `alert('not implemented')`. Inline template. |
| `forget` | ❌ Stub | Password recovery (no backend support) |
| `footer` | ⚠️ Untuned | Exists but not reviewed |
| `unauthnav` | ⚠️ Untuned | Exists but not reviewed |
| Shared (Badge, EmptyState, Skeleton, Alert, ConfirmDialog) | ✅ Production-ready | Slice A — approved |
| Core (AuthService, Guards, Interceptor, Models) | ✅ Production-ready | Slice B — approved |

### B.3 Routing

| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/` → `/home` | HomeComponent | None | ❌ Legacy |
| `/login` | LogInComponent | PublicGuard | ✅ |
| `/register/customer` | RegisterComponent | PublicGuard | ✅ |
| `/register/contractor` | RegisterContractorComponent | PublicGuard | ✅ |
| `/profile` | ProfileComponent | None | ⚠️ No auth guard |
| `/home` | HomeComponent | None | ❌ Legacy |
| `/formannonce` | AnnonceformComponent | None | ❌ Legacy |
| `/forget` | ForgetComponent | None | ❌ Stub |
| `/missions` | MissionsComponent | None | ❌ Stub |
| `/annonce` | AnnoncesComponent | None | ❌ Legacy |
| `/customer/dashboard` | — | AuthGuard + RoleGuard | ❌ Does not exist |
| `/contractor/dashboard` | — | AuthGuard + RoleGuard | ❌ Does not exist |
| `/admin/dashboard` | — | AuthGuard + RoleGuard | ❌ Does not exist |

---

## C. Target Information Architecture

```
/
├── /home                          ← Public landing (HVAC branded)
├── /login                         ← Auth (done)
├── /register/customer             ← Auth (done)
├── /register/contractor           ← Auth (done)
│
├── /customer/
│   ├── /dashboard                 ← Overview: active requests, upcoming appointments
│   ├── /request/new               ← Service Request form (the "Portfolio")
│   ├── /request/:id               ← Request detail + lead status + contractor quotes
│   ├── /requests                  ← All my requests (history)
│   ├── /appointments              ← My appointments list
│   └── /profile                   ← Edit profile
│
├── /contractor/
│   ├── /dashboard                 ← Overview: new leads, today's appointments, stats
│   ├── /leads                     ← Available/assigned leads (my-leads)
│   ├── /lead/:id                  ← Lead detail: accept/reject, quote
│   ├── /appointments              ← My appointments (calendar view)
│   ├── /availability              ← Manage weekly schedule
│   ├── /service-areas             ← Manage zip code coverage
│   ├── /profile                   ← Contractor profile + business info
│   └── /reviews                   ← My reviews + ratings
│
├── /admin/
│   ├── /dashboard                 ← Platform stats: users, requests, revenue
│   ├── /users                     ← User management (list, activate/deactivate)
│   ├── /contractors               ← Contractor list + verification status
│   ├── /requests                  ← All service requests (override, cancel)
│   └── /reviews                   ← Flagged/inappropriate reviews
│
└── /contractor/:id                ← Public contractor profile (for customer view)
```

---

## D. Screen Inventory (25 screens)

### Public (4)
| # | Screen | Route | State | Notes |
|---|--------|-------|-------|-------|
| P1 | Landing page | `/home` | Needs rewrite | HVAC branded, search by service + zip, CTA to register/request |
| P2 | Login | `/login` | ✅ Done | |
| P3 | Customer register | `/register/customer` | ✅ Done | |
| P4 | Contractor register | `/register/contractor` | ✅ Done | |

### Customer (7)
| # | Screen | Route | State | Notes |
|---|--------|-------|-------|-------|
| C1 | Customer dashboard | `/customer/dashboard` | ❌ New | Active requests summary, upcoming appointments, recent activity |
| C2 | New service request | `/request/new` | ❌ New | Multi-step form: service type, problem description, urgency, property info, zip, photos |
| C3 | Request detail | `/request/:id` | ❌ New | Status timeline, lead assignments, contractor quotes, accept/reject |
| C4 | My requests | `/requests` | ❌ New | Filterable list with status badges |
| C5 | My appointments | `/appointments` | ❌ New | List with date/time, contractor info, status |
| C6 | Customer profile | `/profile` | ⚠️ Needs rewrite | First/last name, email, phone, address. Remove alert() stub. |
| C7 | Contractor public profile | `/contractor/:id` | ❌ New | Business info, ratings, reviews, specialties, service area |

### Contractor (8)
| # | Screen | Route | State | Notes |
|---|--------|-------|-------|-------|
| T1 | Contractor dashboard | `/contractor/dashboard` | ❌ New | New leads count, today's appointments, earnings summary |
| T2 | My leads | `/leads` | ❌ New | List of assigned leads with status (sent/accepted/rejected) |
| T3 | Lead detail | `/lead/:id` | ❌ New | Service request details, accept/reject, quote submission |
| T4 | My appointments | `/contractor/appointments` | ❌ New | Calendar/list view, status management (complete, cancel, no-show) |
| T5 | Manage availability | `/availability` | ❌ New | Weekly schedule editor (day + time range) |
| T6 | Manage service areas | `/service-areas` | ❌ New | Zip code CRUD |
| T7 | Contractor profile | `/contractor/profile` | ❌ New | Business name, description, specialties, license, base rate |
| T8 | My reviews | `/reviews` | ❌ New | Star breakdown, individual reviews |

### Admin (4)
| # | Screen | Route | State | Notes |
|---|--------|-------|-------|-------|
| A1 | Admin dashboard | `/admin/dashboard` | ❌ New | Total users, active requests, completed jobs, revenue |
| A2 | User management | `/admin/users` | ❌ New | User list, role filter, activate/deactivate |
| A3 | Contractor management | `/admin/contractors` | ❌ New | Contractor list, verification toggle |
| A4 | Request management | `/admin/requests` | ❌ New | All requests, override status, cancel |

### Existing (Legacy → Repurpose or Remove)
| # | Screen | Route | Action |
|---|--------|-------|--------|
| L1 | Missions | `/missions` | **Remove** — replaced by contractor leads/appointments |
| L2 | Annonces | `/annonce` | **Remove** — replaced by service requests |
| L3 | Annonce form | `/formannonce` | **Remove** — replaced by /request/new |
| L4 | Forget password | `/forget` | **Keep as stub** — mark "Coming soon" |

---

## E. Customer Journey (End-to-End)

```
1. Visitor lands on /home (HVAC landing page)
   → Sees "Find a licensed HVAC pro in Phoenix" + search by service + zip
   
2. Visitor clicks "Get Started" → /register/customer
   → Fills: firstName, lastName, email, password
   → Auto-login → redirected to /customer/dashboard
   
3. Dashboard shows empty state: "No service requests yet"
   → CTA: "Request HVAC Service"
   
4. Click → /request/new (multi-step form)
   Step 1: Service type (AC Repair, AC Installation, Heating Repair, Emergency AC, HVAC Maintenance)
   Step 2: Problem description (textarea), urgency (Routine/Urgent/Emergency)
   Step 3: Property type (residential/commercial), sq ft, HVAC system type
   Step 4: Zip code, address, preferred date/time
   Step 5: Photo upload (optional)
   → Review & Submit
   
5. Backend creates ServiceRequest(status=NEW)
   → Redirect to /request/:id showing "Searching for contractors..."
   
6. System matches contractors (by zip + specialties + availability)
   → LeadAssignment created for each matched contractor (status=SENT)
   
7. Customer sees lead status timeline on /request/:id:
   → "3 contractors notified" → "2 responded" → "1 accepted"
   
8. Contractor accepts + sends quote ($450)
   → Customer sees quote on /request/:id
   → CTA: "Accept Quote" / "Decline"
   
9. Customer accepts quote
   → Backend creates Appointment(scheduledStart, scheduledEnd)
   → ServiceRequest status → SCHEDULED
   
10. Customer sees appointment on /customer/appointments
    → Date, time, contractor name, address
    
11. Contractor completes job
    → Appointment status → COMPLETED
    
12. Customer prompted to leave review
    → 5-axis rating + comment
    → Contractor's averageRating updated
```

---

## F. Contractor Journey (End-to-End)

```
1. Contractor lands on /home → clicks "Join as a Contractor" → /register/contractor
   → Fills: firstName, lastName, email, password
   → Auto-login → redirected to /contractor/dashboard
   
2. Dashboard shows setup checklist:
   □ Complete your profile
   □ Set your service areas
   □ Set your availability
   
3. /contractor/profile → Fill business info:
   → Business name, description, license, specialties (multi-select), base rate
   
4. /service-areas → Add zip codes (85001, 85003, etc.)
   
5. /availability → Set weekly hours (Mon-Fri 8am-6pm)
   
6. When customer creates ServiceRequest in their zip:
   → LeadAssignment created (status=SENT)
   → Contractor sees on /leads as "New Lead"
   
7. /lead/:id → View service request details:
   → Service type, problem, urgency, property info, zip, address
   → CTA: "Accept" or "Reject"
   
8. Contractor clicks "Accept"
   → Popup: enter quotedPrice + notes
   → LeadAssignment status → ACCEPTED
   
9. Contractor schedules appointment (or system auto-schedules):
   → Appointment created with date/time
   
10. /contractor/appointments → See today's schedule
    → Click appointment → mark "Completed" / "Cancelled" / "No Show"
    
11. Completed jobs auto-prompt customer for review
    → Review appears on /reviews with 5-axis breakdown
```

---

## G. Admin Journey (End-to-End)

```
1. Login → redirected to /admin/dashboard
   → Stats cards: Total Users (9), Active Requests (5), Completed Jobs (1), Contractors (5)
   
2. /admin/users → User list table
   → Columns: Name, Email, Role, Status, Joined
   → Action: Toggle active/inactive
   
3. /admin/contractors → Contractor list
   → Columns: Business Name, Owner, License, Verified, Avg Rating, Leads
   → Action: Toggle verified status
   
4. /admin/requests → All service requests
   → Columns: Customer, Service Type, Zip, Status, Urgency, Created
   → Action: Override status (for demo/sales purposes), cancel request
```

---

## H. Backend Gap Analysis

### H.1 Missing Endpoints Needed

| # | Endpoint | Method | Auth | Purpose |
|---|----------|--------|------|---------|
| 1 | `/users/me` | PUT | CUSTOMER | Update profile (firstName, lastName, phone) |
| 2 | `/contractor-profile/me` | PUT | CONTRACTOR | Already exists ✅ |
| 3 | `/service-requests` | POST | CUSTOMER | Already exists ✅ |
| 4 | `/service-requests/my-requests` | GET | CUSTOMER | Already exists ✅ |
| 5 | `/leads/my-leads` | GET | CONTRACTOR | Already exists ✅ |
| 6 | `/leads/{id}/accept` | POST | CONTRACTOR | Already exists ✅ |
| 7 | `/leads/{id}/reject` | POST | CONTRACTOR | Already exists ✅ |
| 8 | `/appointments/my-appointments` | GET | C+T | Already exists ✅ |
| 9 | `/appointments/{id}/status` | PATCH | T | Already exists ✅ |
| 10 | `/availability/my-availability` | GET | CONTRACTOR | Already exists ✅ |
| 11 | `/service-areas/my-areas` | GET | CONTRACTOR | Already exists ✅ |
| 12 | `/reviews/contractor/{id}` | GET | C+T+A | Already exists ✅ |
| 13 | `/reviews/my-reviews` | GET | C+T | Already exists ✅ |
| 14 | `/reviews/service-request/{id}` | POST | CUSTOMER | Already exists ✅ |
| 15 | `/users` | GET | ADMIN | Already exists ✅ |
| 16 | `/users/{id}` | PUT | ADMIN | Already exists ✅ |
| 17 | `/service-requests` | GET | ADMIN | Already exists ✅ |

**Only backend gap:** `PUT /users/me` for customer profile update.

### H.2 Frontend Services Needed

| # | Service | Purpose |
|---|---------|---------|
| 1 | `ServiceRequestService` | CRUD for service requests |
| 2 | `LeadService` | Get leads, accept, reject |
| 3 | `AppointmentService` | Get appointments, update status |
| 4 | `ContractorProfileService` | Get/update contractor profile |
| 5 | `AvailabilityService` | CRUD for weekly schedule |
| 6 | `ServiceAreaService` | CRUD for zip codes |
| 7 | `ReviewService` | Get reviews, create review |
| 8 | `UserService` | Admin user CRUD, profile update |

---

## I. Recommended Micro Slice Order

### Priority Matrix

| Slice | What | Depends On | Effort |
|-------|------|------------|--------|
| **F1** | Core Layout Shell (role-based nav, sidebars, router outlets) | — | Medium |
| **F2** | Customer Dashboard (empty state → summary cards) | F1 | Small |
| **F3** | Service Request Form (/request/new) | F1 | Large |
| **F4** | Customer Request Detail + Lead Timeline | F3 | Medium |
| **F5** | Contractor Dashboard | F1 | Medium |
| **F6** | Contractor Leads List + Detail + Accept/Reject | F5 | Medium |
| **F7** | Contractor Profile + Availability + Service Areas | F5 | Medium |
| **F8** | Appointments (Customer + Contractor views) | F6 | Medium |
| **F9** | Reviews (Customer submit + Contractor view) | F8 | Small |
| **F10** | Admin Dashboard + User/Contractor/Request management | F1 | Large |
| **F11** | Public Contractor Profile (/contractor/:id) | F7 | Small |
| **F12** | Landing Page Rewrite (HVAC branded) | — | Medium |

### Recommended NEXT SLICE: **F1 — Core Layout Shell**

**Why F1 first:**
- All role dashboards depend on having a proper layout
- Current nav has no role-based routing
- Current components use `<app-nav>` everywhere — needs role-aware switching
- Creates the skeleton that all subsequent slices plug into

**F1 Scope:**
1. Create `core/layouts/` with three layout components:
   - `CustomerLayoutComponent` — top nav + sidebar (Dashboard, New Request, My Requests, Appointments, Profile) + `<router-outlet>`
   - `ContractorLayoutComponent` — top nav + sidebar (Dashboard, Leads, Appointments, Availability, Service Areas, Profile, Reviews) + `<router-outlet>`
   - `AdminLayoutComponent` — top nav + sidebar (Dashboard, Users, Contractors, Requests) + `<router-outlet>`
2. Rewrite `nav.component` to be role-aware (different menu items per role)
3. Set up lazy-loaded route modules: `customer.routes.ts`, `contractor.routes.ts`, `admin.routes.ts`
4. Guard all role routes with AuthGuard + RoleGuard (already exist)
5. Remove legacy routes: `/missions`, `/annonce`, `/formannonce`
6. Update `/home` redirect to be role-aware

---

## J. What Gets Deleted/Replaced

| File | Action | Reason |
|------|--------|--------|
| `missions/` | Delete component | Replaced by contractor leads/appointments |
| `annonces/` | Delete component | Replaced by service requests |
| `annonceform/` | Delete component | Replaced by /request/new |
| `services/annonce.service.ts` | Delete service | No longer relevant |
| `unauthnav/` | Delete component | Replaced by public nav in landing page |
| `forget/` | Keep as stub | "Coming soon" page |
| `home/` | Full rewrite | HVAC branded landing page |
| `nav/` | Full rewrite | Role-aware top nav |
| `profile/` | Rewrite | Role-specific profile editing |

---

## K. Design Tokens (Confirmed)

All values from `styles.css` — no changes needed:
- Primary: `#1976d2` (Material Blue)
- Primary Dark: `#0d47a1`
- Primary Light: `#bbdefb`
- Accent: `#ff4081` (Material Pink)
- Success: `#4caf50`
- Warning: `#ff9800`
- Danger: `#f44336`
- Font: Inter (Google Fonts)
- Border Radius: 8px (cards), 4px (inputs)
- Shadows: Standard Material elevation

---

## L. Domain Vocabulary (HVAC)

| Term | Meaning |
|------|---------|
| **Service Request** | A customer's request for HVAC service (replaces "annonce") |
| **Lead** | A ServiceRequest assigned to a contractor (LeadAssignment) |
| **Quote** | Contractor's price offer for a lead (quotedPrice field) |
| **Appointment** | Scheduled job from an accepted lead |
| **Availability** | Contractor's weekly working hours |
| **Service Area** | Zip codes a contractor covers |
| **Urgency** | ROUTINE / URGENT / EMERGENCY |
| **Verification** | Admin confirms contractor's license is valid |

---

*End of Rebaseline Document*
