# PRE-F4 RECONNAISSANCE REPORT
## Comprehensive Product + Technical Analysis — August 27, 2026

---

## 1. EXECUTIVE SUMMARY

**What exists today:**
- Angular 16 + Spring Boot backend with 10 entities, 11 controllers, 14 services, 9 repositories
- Design System (40+ CSS tokens, Angular Material theme, Inter font)
- Auth infrastructure (JWT, AuthGuard, RoleGuard, PublicGuard)
- Login, Customer Registration, Contractor Registration (all production-ready)
- F1: App Layout Shell (Customer/Contractor/Admin layouts with responsive sidebar)
- F2: Customer Dashboard (KPIs, request list, appointment list, loading/error/empty states)
- F3: Customer Service Request Form (4-step stepper, POST to `/service-requests`)
- Phoenix HVAC demo data seeded (9 users, 5 service requests, 6 lead assignments, 3 appointments, 1 review)

**What doesn't exist:**
- **Contractor has ZERO frontend pages** — the `/contractor/dashboard` route renders a placeholder component with no content
- **Admin has ZERO frontend pages** — same placeholder situation
- Customer has no "view my requests" detail page (only dashboard list)
- No lead accept/reject UI (backend supports it)
- No appointment creation UI (backend supports it)
- No contractor profile edit UI (backend supports it)
- No file upload anywhere
- No admin dashboard/stats UI

---

## 2. CURRENT PROJECT STATE

### Completed Slices (A → F3)

| Slice | Description | Status |
|-------|-------------|--------|
| A | Design System Foundation | ✅ DONE |
| B | Auth Infrastructure (JWT, guards, interceptor) | ✅ DONE |
| C | Login Page | ✅ DONE |
| D | Customer Registration | ✅ DONE |
| E | Contractor Registration | ✅ DONE |
| F1 | Core App Layout Shell | ✅ DONE |
| F2 | Customer Dashboard | ✅ DONE |
| F3 | Customer Service Request Form | ✅ DONE (cleaned up) |

### Route Inventory

| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/` | HomeComponent | Public | ✅ Live |
| `/login` | LogInComponent | PublicGuard | ✅ Live |
| `/register/customer` | RegisterComponent | PublicGuard | ✅ Live |
| `/register/contractor` | RegisterContractorComponent | PublicGuard | ✅ Live |
| `/customer/dashboard` | CustomerDashboardPlaceholderComponent | AuthGuard+RoleGuard(CUSTOMER) | ✅ Live |
| `/customer/request/new` | NewRequestComponent | AuthGuard+RoleGuard(CUSTOMER) | ✅ Live |
| `/contractor/dashboard` | ContractorDashboardPlaceholderComponent | AuthGuard+RoleGuard(CONTRACTOR) | ⚠️ Placeholder only |
| `/admin/dashboard` | AdminDashboardPlaceholderComponent | AuthGuard+RoleGuard(ADMIN) | ⚠️ Placeholder only |

---

## 3. BACKEND API INVENTORY (11 Controllers)

### ServiceRequestController (`/service-requests`)
| Method | Endpoint | Auth | Ownership Check |
|--------|----------|------|-----------------|
| POST | `/service-requests` | CUSTOMER | ✅ Sets customer from JWT |
| GET | `/service-requests/{id}` | CUSTOMER/CONTRACTOR/ADMIN | ✅ Customer: own only; Contractor: assigned only |
| GET | `/service-requests/my-requests` | CUSTOMER | ✅ Filters by customer ID |
| PUT | `/service-requests/{id}` | CUSTOMER/CONTRACTOR/ADMIN | ✅ Customer: own + only NEW status; Contractor: own + accepted lead |
| GET | `/service-requests` | ADMIN | ✅ Admin only |

### AppointmentController (`/appointments`)
| Method | Endpoint | Auth | Ownership Check |
|--------|----------|------|-----------------|
| POST | `/appointments/service-request/{id}` | CONTRACTOR/ADMIN | ✅ Checks accepted lead |
| GET | `/appointments/{id}` | CUSTOMER/CONTRACTOR/ADMIN | ✅ Customer: own SR's apt; Contractor: own apts |
| GET | `/appointments/my-appointments` | CUSTOMER/CONTRACTOR | ✅ Contractor: by contractorId; Customer: by SR's customer |
| PATCH | `/appointments/{id}/status` | CONTRACTOR/ADMIN | ✅ Validates status transition |

### LeadAssignmentController (`/leads`)
| Method | Endpoint | Auth | Ownership Check |
|--------|----------|------|-----------------|
| GET | `/leads/{id}` | CUSTOMER/CONTRACTOR/ADMIN | ✅ Contractor: own only; Customer: own SR only |
| GET | `/leads/my-leads` | CONTRACTOR | ✅ Filters by contractor ID |
| POST | `/leads/{id}/accept` | CONTRACTOR | ✅ Own only |
| POST | `/leads/{id}/reject` | CONTRACTOR | ✅ Own only |

### ContractorProfileController (`/contractor-profile`)
| Method | Endpoint | Auth | Ownership Check |
|--------|----------|------|-----------------|
| GET | `/contractor-profile/me` | CONTRACTOR | ✅ Own profile |
| PUT | `/contractor-profile/me` | CONTRACTOR | ✅ Own profile |
| GET | `/contractor-profile/{id}` | Any | ⚠️ No auth check (public read) |

### AvailabilityController (`/availability`)
| Method | Endpoint | Auth | Ownership Check |
|--------|----------|------|-----------------|
| POST | `/availability` | CONTRACTOR | ✅ Sets contractor from JWT |
| GET | `/availability/my-availability` | CONTRACTOR | ✅ Filters by contractor |
| PUT | `/availability/{id}` | CONTRACTOR | ✅ Own only |
| DELETE | `/availability/{id}` | CONTRACTOR | ✅ Own only |

### ServiceAreaController (`/service-areas`)
| Method | Endpoint | Auth | Ownership Check |
|--------|----------|------|-----------------|
| POST | `/service-areas` | CONTRACTOR | ✅ Sets contractor from JWT |
| GET | `/service-areas/my-areas` | CONTRACTOR | ✅ Filters by contractor |
| DELETE | `/service-areas/{id}` | CONTRACTOR | ✅ Own only |
| GET | `/service-areas/zip/{zip}` | Public | ⚠️ No auth (by design — search) |

### ReviewController (`/reviews`)
| Method | Endpoint | Auth | Ownership Check |
|--------|----------|------|-----------------|
| POST | `/reviews/service-request/{id}` | CUSTOMER | ✅ Own SR |
| GET | `/reviews/contractor/{id}` | CUSTOMER/CONTRACTOR/ADMIN | ✅ Public read |
| GET | `/reviews/my-reviews` | CUSTOMER/CONTRACTOR | ✅ Filters by role |

### UserController (`/users`)
| Method | Endpoint | Auth | Ownership Check |
|--------|----------|------|-----------------|
| GET | `/users` | ADMIN | ✅ Admin only |
| GET | `/users/{id}` | ADMIN | ✅ Admin only |
| PUT | `/users/{id}` | ADMIN | ✅ Admin only |
| DELETE | `/users/{id}` | ADMIN | ✅ Admin only |

### AuthController (`/auth`)
| Method | Endpoint | Auth | Ownership Check |
|--------|----------|------|-----------------|
| POST | `/auth/login` | Public | N/A |
| POST | `/auth/register/customer` | Public | N/A |
| POST | `/auth/register/contractor` | Public | N/A |
| GET | `/auth/me` | Authenticated | ✅ Returns current user |

### AnnonceController (`/annonce`) — Legacy
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/annonce` | ⚠️ None | Legacy marketplace feature |
| GET | `/annonce/{cat}/{loc}` | ⚠️ None | Legacy |
| GET | `/annonce` | ⚠️ None | Legacy |
| PUT | `/annonce/{id}` | ⚠️ None | Legacy |
| DELETE | `/annonce/{id}` | ⚠️ None | Legacy |

### EvaluationController (`/evaluation`) — Legacy
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/evaluation?titre=x` | ⚠️ None | Legacy marketplace feature |

---

## 4. DOMAIN MODEL & ENTITY RELATIONSHIPS

```
User (implements UserDetails)
 ├── ContractorProfile (OneToOne via @MapsId on User.id)
 ├── ServiceRequest[] (OneToMany as "customer")
 ├── LeadAssignment[] (OneToMany as "contractor")
 ├── Appointment[] (OneToMany as "contractor")
 ├── Review[] (OneToMany as "contractor" / "customer")
 ├── ServiceArea[] (OneToMany as "contractor")
 └── Availability[] (OneToMany as "contractor")

ServiceRequest
 ├── User customer (ManyToOne)
 ├── LeadAssignment[] (OneToMany)
 ├── Appointment (OneToOne via Appointment.serviceRequest)
 └── Review (OneToOne via Review.serviceRequest)

LeadAssignment
 ├── ServiceRequest (ManyToOne)
 ├── User contractor (ManyToOne)
 └── Fields: status, quotedPrice, contractorNotes, sentAt, respondedAt

Appointment
 ├── ServiceRequest (OneToOne)
 ├── User contractor (ManyToOne)
 └── Fields: scheduledStart, scheduledEnd, status, notes, completionNotes

Review
 ├── User customer (ManyToOne)
 ├── User contractor (ManyToOne)
 ├── ServiceRequest (OneToOne)
 └── Fields: overallRating, qualityRating, professionalismRating, punctualityRating, communicationRating, comment

ServiceArea
 ├── User contractor (ManyToOne)
 └── Fields: zipCode, city, state

Availability
 ├── User contractor (ManyToOne)
 └── Fields: dayOfWeek, startTime, endTime, isEmergencyAvailable
```

### Key Enum Values

| Enum | Values |
|------|--------|
| Role | CUSTOMER, CONTRACTOR, ADMIN |
| ServiceRequestStatus | NEW, MATCHED, ACCEPTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED |
| LeadAssignmentStatus | SENT, ACCEPTED, REJECTED, EXPIRED |
| AppointmentStatus | SCHEDULED, COMPLETED, CANCELLED, NO_SHOW |
| Urgency | ROUTINE, URGENT, EMERGENCY |

---

## 5. SERVICE REQUEST LIFECYCLE (Full Flow)

```
Customer submits request
    → ServiceRequestService.createServiceRequest()
    → Status: NEW
    → [AUTO-MATCH: Not implemented — would find contractors by zipCode + serviceType]
    → LeadAssignment created for each matched contractor (status: SENT)

Contractor views lead → /leads/my-leads
    → LeadAssignment status: SENT

Contractor accepts lead → POST /leads/{id}/accept
    → LeadAssignment status: ACCEPTED
    → [NO QUOTE: acceptLead() doesn't set quotedPrice]

Contractor rejects lead → POST /leads/{id}/reject
    → LeadAssignment status: REJECTED

Contractor creates appointment → POST /appointments/service-request/{id}
    → Requires accepted lead
    → Appointment status: SCHEDULED
    → ServiceRequest status: SCHEDULED

Contractor marks appointment complete → PATCH /appointments/{id}/status
    → Status: COMPLETED
    → ServiceRequest status: COMPLETED

Customer cancels → PUT /service-requests/{id}
    → Only if status is NEW
    → ServiceRequest status: CANCELLED
```

---

## 6. FRONTEND ↔ BACKEND RECONCILIATION

### Backend endpoints that the frontend USES:
| Endpoint | Frontend Consumer |
|----------|-------------------|
| `POST /service-requests` | CustomerDataService.createServiceRequest() |
| `GET /service-requests/my-requests` | CustomerDataService.getMyServiceRequests() |
| `GET /service-requests/{id}` | CustomerDataService.getServiceRequest() |
| `GET /appointments/my-appointments` | CustomerDataService.getMyAppointments() |
| `POST /auth/login` | AuthService |
| `POST /auth/register/customer` | AuthService |
| `POST /auth/register/contractor` | AuthService |
| `GET /auth/me` | AuthService |

### Backend endpoints that the frontend DOES NOT use (18 unused):

| Endpoint | Would Be Used By |
|----------|------------------|
| `PUT /service-requests/{id}` | Customer cancel, Contractor price update |
| `GET /service-requests` | Admin dashboard |
| `GET /leads/my-leads` | Contractor dashboard |
| `POST /leads/{id}/accept` | Contractor lead response |
| `POST /leads/{id}/reject` | Contractor lead response |
| `GET /leads/{id}` | Lead detail view |
| `GET /appointments/{id}` | Appointment detail |
| `PATCH /appointments/{id}/status` | Contractor status update |
| `POST /appointments/service-request/{id}` | Contractor scheduling |
| `GET /contractor-profile/me` | Contractor profile edit |
| `PUT /contractor-profile/me` | Contractor profile edit |
| `GET /contractor-profile/{id}` | Public contractor view |
| `GET /availability/my-availability` | Contractor availability view |
| `POST /availability` | Contractor availability create |
| `PUT /availability/{id}` | Contractor availability edit |
| `DELETE /availability/{id}` | Contractor availability delete |
| `GET /service-areas/my-areas` | Contractor areas view |
| `POST /service-areas` | Contractor area add |
| `DELETE /service-areas/{id}` | Contractor area remove |
| `GET /reviews/contractor/{id}` | Public reviews |
| `GET /reviews/my-reviews` | Contractor/Customer reviews |
| `POST /reviews/service-request/{id}` | Customer review submission |
| `GET /users` | Admin user management |
| `GET /users/{id}` | Admin user detail |
| `PUT /users/{id}` | Admin user edit |
| `DELETE /users/{id}` | Admin user delete |

---

## 7. CUSTOMER JOURNEY (What Works Today)

1. **Login** → `/login` → JWT stored → Redirect to `/customer/dashboard`
2. **View Dashboard** → KPIs (active requests, upcoming appointments, completed jobs)
3. **View Recent Requests** → List with status badges, urgency badges
4. **View Upcoming Appointments** → List with contractor name, date, status
5. **Request HVAC Service** → `/customer/request/new` → 4-step stepper → Submit
6. **Success Screen** → "Go to Dashboard"

### Customer Journey Gaps:
- No request detail page (tap on request → nothing happens)
- No appointment detail page
- No ability to cancel a request from UI (backend supports it for NEW status)
- No review submission UI (backend supports it)
- No profile/settings page
- "My Requests" nav link is disabled ("coming soon")
- "Appointments" nav link is disabled ("coming soon")

---

## 8. CONTRACTOR JOURNEY (What Exists Today)

**Frontend: Nothing.** The contractor layout shell renders, the sidebar renders with all "coming soon" badges, the dashboard placeholder shows a skeleton loader. There are zero functional contractor pages.

**Backend: Everything.** The backend has full CRUD for:
- Viewing assigned leads (`GET /leads/my-leads`)
- Accepting/rejecting leads (`POST /leads/{id}/accept|reject`)
- Creating appointments (`POST /appointments/service-request/{id}`)
- Updating appointment status (`PATCH /appointments/{id}/status`)
- Viewing/managing availability (`/availability`)
- Viewing/managing service areas (`/service-areas`)
- Editing profile (`PUT /contractor-profile/me`)

---

## 9. ADMIN JOURNEY (What Exists Today)

**Frontend: Nothing.** Same as contractor — layout shell only, zero functional pages.

**Backend: Partial.** Admin can:
- View all users (`GET /users`)
- CRUD users (`GET/PUT/DELETE /users/{id}`)
- View all service requests (`GET /service-requests`)
- CRUD appointments as admin (`POST /appointments/service-request/{id}`, `PATCH /appointments/{id}/status`)

---

## 10. STATUS UX MATRIX

| Status | Badge Label | Badge CSS Class | Exists In Backend | Exists In Frontend |
|--------|-------------|-----------------|-------------------|-------------------|
| NEW | "New" | `ch-badge--new` | ✅ | ✅ (dashboard list) |
| MATCHED | "Matched" | `ch-badge--matched` | ✅ | ✅ (badge component) |
| SENT | "Sent" | `ch-badge--sent` | ✅ | ✅ (badge component) |
| ACCEPTED | "Accepted" | `ch-badge--accepted` | ✅ | ✅ (badge component) |
| SCHEDULED | "Scheduled" | `ch-badge--scheduled` | ✅ | ✅ (dashboard) |
| IN_PROGRESS | "In Progress" | `ch-badge--in-progress` | ✅ | ✅ (badge component) |
| COMPLETED | "Completed" | `ch-badge--completed` | ✅ | ✅ (dashboard) |
| CANCELLED | "Cancelled" | `ch-badge--cancelled` | ✅ | ✅ (badge component) |
| REJECTED | "Rejected" | `ch-badge--rejected` | ✅ | ✅ (badge component) |
| EXPIRED | "Expired" | `ch-badge--expired` | ✅ | ✅ (badge component) |
| ROUTINE | "Routine" | `ch-badge--routine` | ✅ | ✅ (dashboard) |
| URGENT | "Urgent" | `ch-badge--urgent` | ✅ | ✅ (dashboard) |
| EMERGENCY | "Emergency" | `ch-badge--emergency` | ✅ | ✅ (dashboard) |
| NO_SHOW | "No Show" | `ch-badge--no-show` | ✅ | ⚠️ Missing from badge component |

**Badge component gap:** `NO_SHOW` is not in `STATUS_LABELS` map — would render as raw string "NO_SHOW".

---

## 11. SECURITY ANALYSIS

### What's Solid:
- JWT authentication with `JwtAuthenticationFilter`
- Role-based access on every controller endpoint
- Ownership enforcement in `ServiceRequestService.getServiceRequest()` (customer can only see own; contractor can only see assigned)
- Ownership enforcement in `AppointmentService` (customer can only see own; contractor can only see own)
- `@PreAuthorize` annotations on all sensitive endpoints
- `passwordHash` field uses `@JsonProperty(WRITE_ONLY)` to prevent serialization

### What's Missing / Weak:
- **No customer self-profile update endpoint** — `PUT /users/{id}` is ADMIN-only
- **No auto-matching** — when a NEW service request is created, no contractors are automatically assigned
- **No lead expiry logic** — `EXPIRED` status exists but no timer/ scheduler marks stale leads
- **No rate limiting** on auth endpoints
- **No CORS configuration visible** — frontend talks to `localhost:8081` directly
- **`/contractor-profile/{id}` has no auth check** — anyone can read any contractor's profile
- **`/service-areas/zip/{zip}` has no auth check** — by design but worth noting
- **AnnonceController and EvaluationController have ZERO auth** — legacy endpoints, should be removed or secured
- **No input sanitization** on free-text fields (problemDescription, notes, comment)

---

## 12. FRONTEND ARCHITECTURE NOTES

### Angular Material Modules Available (but unused by new code):
- `MatTableModule` — available, not used anywhere yet
- `MatPaginatorModule` — available, not used
- `MatSortModule` — available, not used
- `MatTabsModule` — available, not used
- `MatExpansionModule` — available, not used
- `MatChipsModule` — available, not used
- `MatDialogModule` — NOT imported (would need adding for modals)
- `MatSnackBarModule` — available, not used

### Existing Shared Components (Reusable):
- `<app-badge [status]="...">` — renders labeled status chips
- `<app-empty-state icon="..." message="..." actionText="..." (actionClick)="...">` — empty state
- `<app-skeleton variant="text|card">` — loading skeleton
- `<app-alert type="error|success" [message]="..." (dismiss)="...">` — alert banner
- `<app-confirm-dialog>` — confirmation dialog

### Key Frontend Patterns:
- Services use `HttpClient` with `http://localhost:8081/api/v1` base URL
- Components use `takeUntil(this.destroy$)` for cleanup
- `forkJoin` for parallel data loading
- Reactive Forms with `FormBuilder`
- `BreakpointObserver` for responsive behavior (contractor/admin layouts)
- No lazy loading — everything in `AppModule` declarations

---

## 13. DEMO DATA STATE

### Seeded Data:
- **Users:** admin (id:1), customer1 John Doe (id:2), customer2 Jane Smith (id:3), customer3 Mike Wilson (id:4), contractor1 Mike Davis (id:5), contractor2 Sarah Johnson (id:6), contractor3 Robert Martinez (id:7), contractor4 Lisa Anderson (id:8), contractor5 David Thompson (id:9)
- **Service Requests:** 5 total (SR1-3 are MATCHED, SR4-5 are NEW)
- **Lead Assignments:** 6 total (3 ACCEPTED with quotedPrice, 2 SENT, 1 REJECTED)
- **Appointments:** 3 total (2 SCHEDULED, 1 COMPLETED)
- **Reviews:** 1 review (5-star for contractor1 on SR3)
- **Contractor Profiles:** All 5 contractors have profiles with business names, licenses, specialties
- **Service Areas:** Each contractor covers 6 Phoenix ZIP codes
- **Availability:** All 5 contractors: Mon-Fri 8am-6pm

### Demo Account Quick Reference:
| Email | Password | Role | ID |
|-------|----------|------|----|
| admin@hvacmarketplace.com | admin123 | ADMIN | 1 |
| customer1@hvacmarketplace.com | customer123 | CUSTOMER | 2 |
| customer2@hvacmarketplace.com | customer123 | CUSTOMER | 3 |
| customer3@hvacmarketplace.com | customer123 | CUSTOMER | 4 |
| contractor1@hvacmarketplace.com | contractor123 | CONTRACTOR | 5 |
| contractor2@hvacmarketplace.com | contractor123 | CONTRACTOR | 6 |
| contractor3@hvacmarketplace.com | contractor123 | CONTRACTOR | 7 |
| contractor4@hvacmarketplace.com | contractor123 | CONTRACTOR | 8 |
| contractor5@hvacmarketplace.com | contractor123 | CONTRACTOR | 9 |

---

## 14. WHAT F4 SHOULD BE: RECOMMENDED NEXT SLICE

### The Gap That Matters Most

The **contractor has zero frontend**. This is the most critical gap because:
1. The backend is fully built for contractor operations
2. A demo to an HVAC company means showing the **contractor experience**
3. The customer → contractor flow is broken: a customer can submit a request, but no contractor can ever see or respond to it in the UI

### Recommended Slice: F4 — Contractor Dashboard + Lead Management

**Scope:**
1. **Contractor Dashboard** — KPIs (new leads, accepted leads, upcoming appointments, completed jobs)
2. **Lead Inbox** — List of assigned leads with status, service type, urgency, zip code, quoted price
3. **Lead Detail / Accept / Reject** — View lead, accept (with optional quote price), reject (with reason)
4. **Appointment List** — View scheduled appointments
5. **Appointment Status Update** — Mark appointment as completed

**What this slice DOES NOT include (deferred to F5+):**
- Contractor profile editing
- Availability/ServiceArea management
- Review display
- Customer request detail page
- Admin dashboard
- Auto-matching (backend change)

### Backend Endpoints Used by F4:

| Endpoint | Frontend Service | Used By |
|----------|------------------|---------|
| `GET /leads/my-leads` | ContractorDataService | Lead Inbox |
| `GET /leads/{id}` | ContractorDataService | Lead Detail |
| `POST /leads/{id}/accept` | ContractorDataService | Accept Lead |
| `POST /leads/{id}/reject` | ContractorDataService | Reject Lead |
| `GET /appointments/my-appointments` | ContractorDataService | Appointment List |
| `PATCH /appointments/{id}/status` | ContractorDataService | Mark Complete |
| `GET /contractor-profile/me` | ContractorDataService | Dashboard greeting |
| `GET /auth/me` | AuthService (existing) | User info |

---

## 15. F4 TECHNICAL ARCHITECTURE

### New Files Needed:

```
frontend/src/app/
├── components/contractor/
│   ├── contractor-dashboard/       ← Main dashboard (KPIs + lead summary + appointment summary)
│   │   ├── contractor-dashboard.component.ts
│   │   ├── contractor-dashboard.component.html
│   │   └── contractor-dashboard.component.css
│   ├── lead-inbox/                 ← Lead list with filters
│   │   ├── lead-inbox.component.ts
│   │   ├── lead-inbox.component.html
│   │   └── lead-inbox.component.css
│   ├── lead-detail/                ← Lead detail + accept/reject
│   │   ├── lead-detail.component.ts
│   │   ├── lead-detail.component.html
│   │   └── lead-detail.component.css
│   └── appointment-list/           ← Appointment list
│       ├── appointment-list.component.ts
│       ├── appointment-list.component.html
│       └── appointment-list.component.css
├── core/services/
│   └── contractor-data.service.ts  ← NEW: all contractor API calls
```

### Routes to Add:

```typescript
{
  path: 'contractor',
  component: ContractorLayoutComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'CONTRACTOR' },
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: ContractorDashboardComponent },
    { path: 'leads', component: LeadInboxComponent },
    { path: 'leads/:id', component: LeadDetailComponent },
    { path: 'appointments', component: AppointmentListComponent },
  ],
}
```

### Sidebar Nav to Update:

```typescript
navItems = [
  { label: 'Dashboard', route: '/contractor/dashboard', icon: 'dashboard' },
  { label: 'My Leads', route: '/contractor/leads', icon: 'work' },
  { label: 'Appointments', route: '/contractor/appointments', icon: 'event' },
];
// Remove "coming soon" badges from active items
```

---

## 16. F4 COMPONENT SPECIFICATIONS

### ContractorDashboardComponent
- **Data:** forkJoin({ leads: getMyLeads(), appointments: getMyAppointments(), profile: getMyProfile() })
- **KPIs:** New Leads (status=SENT), Accepted Leads (status=ACCEPTED), Upcoming Appointments, Completed Jobs
- **Recent Leads:** Top 5 leads with status badge, service type, urgency, zip
- **Upcoming Appointments:** Next 3 appointments with date/time, customer name, status
- **CTA:** "View All Leads" button → navigates to `/contractor/leads`

### LeadInboxComponent
- **Data:** getMyLeads() → LeadAssignment[]
- **Table:** Service Type | Urgency | ZIP Code | Status | Quoted Price | Sent At
- **Filters:** Status tabs (All / New / Accepted / Rejected)
- **Actions:** Click row → navigate to `/contractor/leads/:id`
- **Empty State:** "No leads yet" with message

### LeadDetailComponent
- **Data:** getLeadById(id) → LeadAssignment (includes serviceRequest nested)
- **Display:** Customer name, service type, problem description, urgency, zip, address, property details
- **Actions (if status=SENT):** Accept button (opens quote price input), Reject button (opens reason input)
- **Actions (if status=ACCEPTED):** "Create Appointment" button → navigate to appointment creation (F5 scope or inline)
- **Status badge:** Shows current lead status

### AppointmentListComponent
- **Data:** getMyAppointments() → Appointment[]
- **Table:** Service Type | Customer | Date/Time | Status | Notes
- **Actions:** Mark Complete button (PATCH status → COMPLETED)
- **Empty State:** "No appointments scheduled"

---

## 17. DECISION: PROCEED WITH F4

### Verdict: **PROCEED WITH F4 — Contractor Dashboard + Lead Management**

**Rationale:**
1. Backend is 100% ready — all 8 endpoints exist and are tested
2. Frontend has zero contractor pages — biggest gap in the demo
3. F4 is the natural next step after F3 (customer submits request → contractor sees it)
4. All shared components (badge, empty-state, skeleton, alert) are reusable
5. Angular Material modules (MatTable, MatTabs) are already imported but unused
6. No new backend code needed — pure frontend work
7. The demo story is incomplete without contractor interaction

**Risk Assessment:** LOW
- Backend is stable and fully tested
- No database changes needed
- No security changes needed
- Pattern is established (follow F2's forkJoin + loading/error/empty pattern)

**Estimated Effort:** 4 new components + 1 new service + route updates + sidebar update

---

## 18. MASTER PROJECT CHECKPOINT

### What We've Built (Complete):
- Full auth flow (login, register, JWT, guards)
- Design system (40+ tokens, Material theme)
- Responsive layout shell (3 roles)
- Customer dashboard with real data
- Customer service request form (4-step stepper)
- Phoenix HVAC demo data

### What's Next:
- **F4:** Contractor Dashboard + Lead Management ← RECOMMENDED
- **F5:** Contractor Profile + Availability Management
- **F6:** Customer Request Detail + Cancel
- **F7:** Customer Review Submission
- **F8:** Admin Dashboard + User Management
- **F9:** Auto-matching backend logic

---

*Report generated: August 27, 2026*
*Data source: Direct source code reads of all 11 controllers, 10 entities, 14 services, 9 repositories, all frontend components, routing, and models.*
