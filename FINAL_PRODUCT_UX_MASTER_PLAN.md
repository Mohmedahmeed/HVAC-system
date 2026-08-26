# FINAL PRODUCT / UX MASTER PLAN — Choufli HVAC

**Version:** 2.0 (Final)  
**Date:** 2026-08-26  
**Status:** APPROVED — awaiting next-slice implementation  
**Author:** OpenCode — Senior Product Designer persona  

---

## A. Product Vision

Transform Choufli Hal from a Tunisian general marketplace into a **professional U.S. HVAC lead-generation, booking, and contractor-management platform** — used as a sales demo to approach HVAC companies in Phoenix, AZ.

**North Star Metric:** A demo visitor completes a full Service Request → Contractor Match → Appointment flow in under 5 minutes with realistic Phoenix HVAC data.

---

## B. Product Principles

1. **Contractor-first trust:** Homeowners hire contractors they trust. Every screen must reinforce credibility (ratings, verification, portfolio, reviews).
2. **Lead clarity over quantity:** Contractors see high-intent, zip-matched leads — not a flood of noise.
3. **Service-request-driven flow:** All work starts with a Service Request. No direct appointment creation by customers.
4. **Demo-ready at every slice:** Every slice must be visually demonstrable with Phoenix seed data.
5. **Role-separated by design:** Customer, Contractor, and Admin never share the same layout shell.
6. **No dead ends:** Every page has a clear primary CTA, even if that CTA is an empty-state引导.

---

## C. Current Codebase State

### C.1 Frontend File Inventory

| # | Path | Role | State | Classification |
|---|------|------|-------|----------------|
| 1 | `components/log-in/` | Auth: Login | ✅ Production-ready | KEEP |
| 2 | `components/register/` | Auth: Customer register | ✅ Production-ready | KEEP |
| 3 | `components/register-contractor/` | Auth: Contractor register | ✅ Production-ready | KEEP |
| 4 | `components/nav/` | Top navigation bar | ⚠️ Subscribed to AuthService; French labels; logout() not wired in HTML; no role-based menu | REWRITE |
| 5 | `components/home/` | Landing page | ❌ Tunisian categories (Plumbing, Baby sitting), Tunisian copy, yellow (#FCDC07) branding | REWRITE |
| 6 | `components/profile/` | Profile editor | ⚠️ Uses inline template; profile.component.html has form control name `nom` but TS defines `firstName` (mismatch); updateProfile() is `alert('not implemented')` | REWRITE |
| 7 | `components/missions/` | Missions (stub) | ❌ Empty counters ("0"), French labels, no backend wiring | DELETE CANDIDATE |
| 8 | `components/annonces/` | Annonce listing | ❌ Tunisian marketplace feature, pulls from /annonce endpoint | DELETE CANDIDATE |
| 9 | `components/annonceform/` | Annonce creation form | ❌ Tunisian marketplace stepper, French labels, no HVAC relevance | DELETE CANDIDATE |
| 10 | `components/forget/` | Password recovery | ⚠️ French form, no backend support, no functionality | DEPRECATE |
| 11 | `components/footer/` | Footer | ⚠️ French copyright 2023, social links to Tunisian accounts | REWRITE |
| 12 | `components/unauthnav/` | Public navigation | ⚠️ Standalone toolbar, not used by any current page | DELETE CANDIDATE |
| 13 | `core/services/auth.service.ts` | Auth service | ✅ Production-ready | KEEP |
| 14 | `core/interceptors/auth.interceptor.ts` | Token interceptor | ✅ Production-ready | KEEP |
| 15 | `core/guards/auth.guard.ts` | Route auth guard | ⚠️ Imports from `../services/auth.service` (old path) but compiles | REUSE |
| 16 | `core/guards/role.guard.ts` | Role guard | ⚠️ Same old path import | REUSE |
| 17 | `core/guards/public.guard.ts` | Public guard | ⚠️ Same old path import | REUSE |
| 18 | `core/models/user.model.ts` | User + MeResponse + ROLE_DASHBOARDS | ✅ Production-ready | KEEP |
| 19 | `core/models/auth.model.ts` | LoginRequest + AuthResponse | ✅ Production-ready | KEEP |
| 20 | `shared/` (Badge, EmptyState, Skeleton, Alert, ConfirmDialog) | Shared UI | ✅ Production-ready | KEEP |
| 21 | `services/annonce.service.ts` | Annonce HTTP service | ❌ Only serves legacy Annonces page | DELETE CANDIDATE |
| 22 | `styles.css` | Design tokens (40+ CSS vars) | ✅ Production-ready | KEEP |
| 23 | `theme.scss` | Angular Material theme | ✅ Production-ready | KEEP |
| 24 | `angular-material.module.ts` | Material barrel import | ✅ Production-ready | KEEP |

### C.2 Backend File Inventory

| # | File | Role | Classification |
|---|------|------|----------------|
| 1 | `controller/AuthController.java` | Login, register, /me | KEEP |
| 2 | `controller/UserController.java` | Admin user CRUD | KEEP |
| 3 | `controller/ServiceRequestController.java` | SR CRUD | KEEP |
| 4 | `controller/LeadAssignmentController.java` | Lead accept/reject | KEEP |
| 5 | `controller/AppointmentController.java` | Appointment CRUD + status | KEEP |
| 6 | `controller/ReviewController.java` | Review CRUD | KEEP |
| 7 | `controller/AvailabilityController.java` | Availability CRUD | KEEP |
| 8 | `controller/ServiceAreaController.java` | Zip-area CRUD | KEEP |
| 9 | `controller/ContractorProfileController.java` | Profile GET/PUT | KEEP |
| 10 | `controller/AnnonceController.java` | Tunisian annonces | DELETE CANDIDATE |
| 11 | `controller/EvaluationController.java` | Tunisian evaluation | DELETE CANDIDATE |
| 12 | `entity/User.java` | User entity | KEEP |
| 13 | `entity/ContractorProfile.java` | Contractor profile | KEEP |
| 14 | `entity/ServiceRequest.java` | Service request | KEEP |
| 15 | `entity/LeadAssignment.java` | Lead assignment | KEEP |
| 16 | `entity/Appointment.java` | Appointment | KEEP |
| 17 | `entity/Review.java` | Review (5-axis) | KEEP |
| 18 | `entity/Availability.java` | Weekly availability | KEEP |
| 19 | `entity/ServiceArea.java` | Zip coverage | KEEP |
| 20 | `entity/Annonce.java` | Tunisian entity | DELETE CANDIDATE |
| 21 | `entity/Evaluation.java` | Tunisian entity | DELETE CANDIDATE |
| 22 | `enums/*` | Role, Status, Urgency | KEEP |
| 23 | `security/*` | JWT + SecurityConfig | KEEP |
| 24 | `config/DemoDataSeeder.java` | Phoenix seed data | KEEP |
| 25 | `config/DemoDataConfig.java` | Profile activation | KEEP |
| 26 | `dto/AuthRequest.java` | Login DTO | KEEP |
| 27 | `dto/AuthResponse.java` | Login response DTO | KEEP |

### C.3 Current Route Map (Actual Code)

| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/` → `/home` | HomeComponent | None | ❌ Legacy |
| `/login` | LogInComponent | PublicGuard | ✅ |
| `/register` → `/register/customer` | Redirect | — | ✅ |
| `/register/customer` | RegisterComponent | PublicGuard | ✅ |
| `/register/contractor` | RegisterContractorComponent | PublicGuard | ✅ |
| `/profile` | ProfileComponent | **None** | ⚠️ Unguarded, broken |
| `/home` | HomeComponent | None | ❌ Legacy |
| `/formannonce` | AnnonceformComponent | None | ❌ Legacy |
| `/forget` | ForgetComponent | None | ⚠️ Stub |
| `/missions` | MissionsComponent | None | ❌ Legacy |
| `/annonce` | AnnoncesComponent | None | ❌ Legacy |

**Missing routes:** All `/customer/*`, `/contractor/*`, `/admin/*` — none exist.

### C.4 Critical Frontend Bugs Found

1. **`profile.component.html`** uses `formControlName="nom"` but `profile.component.ts` defines `firstName` — form binding is broken.
2. **`profile.component.ts`** uses inline template, making `profile.component.html` the **actual file on disk** — the two conflict.
3. **`nav.component.html`** logout button is not wired — `logout()` method exists in TS but no click handler in HTML.
4. **Guard imports** (`auth.guard.ts`, `role.guard.ts`, `public.guard.ts`) import from `../services/auth.service` — old path that works only because the root `services/` folder exists alongside `core/services/`. This is a latent import path issue.
5. **`unauthnav.component.ts`** has local `login()` and `logout()` methods that don't use AuthService — entirely fake auth state.

---

## D. Approved Design System

Extracted from actual `styles.css` and `theme.scss`:

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--ch-primary` | `#1E40AF` | Buttons, links, active states |
| `--ch-primary-dark` | `#1E3A8A` | Hover states, brand panel |
| `--ch-primary-light` | `#DBEAFE` | Light backgrounds, badges |
| `--ch-accent` | `#F59E0B` | CTA highlights, accent badges |
| `--ch-accent-light` | `#FEF3C7` | Accent backgrounds |
| `--ch-success` | `#059669` | Success states, completed |
| `--ch-success-light` | `#D1FAE5` | Success backgrounds |
| `--ch-warning` | `#D97706` | Warning states |
| `--ch-warning-light` | `#FEF3C7` | Warning backgrounds |
| `--ch-error` | `#DC2626` | Error states, danger |
| `--ch-error-light` | `#FEE2E2` | Error backgrounds |
| `--ch-info` | `#1E40AF` | Info states |
| `--ch-info-light` | `#DBEAFE` | Info backgrounds |
| `--ch-text` | `#1E293B` | Primary text |
| `--ch-text-secondary` | `#64748B` | Secondary text |
| `--ch-text-muted` | `#94A3B8` | Muted/placeholder |
| `--ch-text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| `--ch-bg` | `#F8FAFC` | Page background |
| `--ch-surface` | `#FFFFFF` | Card/surface background |
| `--ch-border` | `#E2E8F0` | Borders |
| `--ch-divider` | `#F1F5F9` | Dividers |

### Typography

| Property | Value |
|----------|-------|
| Font family | `'Inter', 'Roboto', 'Helvetica Neue', sans-serif` |
| Framework | Angular Material custom theme (`theme.scss`) |
| Tailwind | **NOT USED** |

### Spacing Scale

| Token | Value |
|-------|-------|
| `--ch-space-1` | 4px |
| `--ch-space-2` | 8px |
| `--ch-space-3` | 12px |
| `--ch-space-4` | 16px |
| `--ch-space-5` | 20px |
| `--ch-space-6` | 24px |
| `--ch-space-8` | 32px |
| `--ch-space-10` | 40px |
| `--ch-space-12` | 48px |
| `--ch-space-16` | 64px |

### Shadows

| Token | Value |
|-------|-------|
| `--ch-shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `--ch-shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` |
| `--ch-shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` |
| `--ch-shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` |

### Border Radius

| Token | Value |
|-------|-------|
| `--ch-radius-sm` | 6px |
| `--ch-radius` | 8px |
| `--ch-radius-lg` | 12px |
| `--ch-radius-xl` | 16px |
| `--ch-radius-full` | 9999px |

---

## E. User Personas

### E.1 Homeowner (Customer)
- **Role:** CUSTOMER
- **Goal:** Get HVAC problem fixed quickly by a trusted professional
- **Pain:** Doesn't know which contractor to trust, worried about pricing
- **Demo action:** Create service request, see matched contractors, view quotes, book appointment

### E.2 HVAC Contractor
- **Role:** CONTRACTOR
- **Goal:** Get more qualified local HVAC leads
- **Pain:** Wasted time on bad leads, no easy way to showcase work
- **Demo action:** View matched leads, accept/reject, provide quote, manage schedule, showcase portfolio

### E.3 Platform Admin
- **Role:** ADMIN
- **Goal:** Manage the marketplace, verify contractors, monitor activity
- **Pain:** Needs visibility into all platform operations
- **Demo action:** View dashboard stats, manage users, verify contractors, oversee requests

---

## F. Domain Vocabulary

| Term | Definition | Backend Entity |
|------|-----------|----------------|
| Service Request | Customer's HVAC service need | `ServiceRequest` |
| Lead | ServiceRequest auto-assigned to a contractor by zip match | `LeadAssignment` |
| Quote | Contractor's price offer for a lead (set on accept) | `LeadAssignment.quotedPrice` |
| Appointment | Scheduled job created by contractor after acceptance | `Appointment` |
| Availability | Contractor's weekly working hours | `Availability` |
| Service Area | Zip codes a contractor covers | `ServiceArea` |
| Contractor Profile | Business info, specialties, license, ratings | `ContractorProfile` |
| Portfolio | Collection of completed projects with before/after photos | **Not yet implemented** |
| Review | 5-axis rating after completed appointment | `Review` |
| Verification | Admin confirms contractor license is valid | `ContractorProfile.isVerified` |
| Urgency | ROUTINE / URGENT / EMERGENCY | `Urgency` enum |
| Service Type | AC Repair, Installation, Heating, Maintenance, Emergency | String field |

---

## G. Information Architecture

```
PUBLIC
├── /home                              Landing page
├── /login                             Sign in
├── /register/customer                 Homeowner signup
├── /register/contractor               Contractor signup
└── /contractor/:id                    Public contractor profile

CUSTOMER
├── /customer/dashboard                Overview + quick actions
├── /customer/request/new              Submit service request
├── /customer/request/:id              Request detail + lead timeline
├── /customer/requests                 All my requests
├── /customer/appointments             My appointments
├── /customer/profile                  Edit profile
└── /customer/review/:contractorId     Leave review (after completed job)

CONTRACTOR
├── /contractor/dashboard              Overview + stats
├── /contractor/leads                  Assigned leads
├── /contractor/leads/:id              Lead detail + accept/reject/quote
├── /contractor/appointments           My appointments
├── /contractor/portfolio              My project gallery
├── /contractor/portfolio/new          Add project
├── /contractor/portfolio/:id          Edit/view project
├── /contractor/profile                Business profile
├── /contractor/service-areas          Zip coverage
├── /contractor/availability           Weekly schedule
└── /contractor/reviews                My reviews

ADMIN
├── /admin/dashboard                   Platform stats
├── /admin/users                       User management
├── /admin/contractors                 Contractor verification
└── /admin/requests                    All service requests
```

---

## H. Complete Route Map

| # | Route | Component | Role | Guard | Status |
|---|-------|-----------|------|-------|--------|
| 1 | `/` → `/home` | HomeComponent | PUBLIC | None | REWRITE |
| 2 | `/login` | LogInComponent | PUBLIC | PublicGuard | KEEP |
| 3 | `/register/customer` | RegisterComponent | PUBLIC | PublicGuard | KEEP |
| 4 | `/register/contractor` | RegisterContractorComponent | PUBLIC | PublicGuard | KEEP |
| 5 | `/contractor/:id` | PublicContractorProfileComponent | PUBLIC | None | NEW |
| 6 | `/customer/dashboard` | CustomerDashboardComponent | CUSTOMER | AuthGuard+RoleGuard | NEW |
| 7 | `/customer/request/new` | NewRequestComponent | CUSTOMER | AuthGuard+RoleGuard | NEW |
| 8 | `/customer/request/:id` | RequestDetailComponent | CUSTOMER | AuthGuard+RoleGuard | NEW |
| 9 | `/customer/requests` | CustomerRequestsComponent | CUSTOMER | AuthGuard+RoleGuard | NEW |
| 10 | `/customer/appointments` | CustomerAppointmentsComponent | CUSTOMER | AuthGuard+RoleGuard | NEW |
| 11 | `/customer/profile` | CustomerProfileComponent | CUSTOMER | AuthGuard+RoleGuard | NEW |
| 12 | `/customer/review/:contractorId` | ReviewFormComponent | CUSTOMER | AuthGuard+RoleGuard | NEW |
| 13 | `/contractor/dashboard` | ContractorDashboardComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 14 | `/contractor/leads` | ContractorLeadsComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 15 | `/contractor/leads/:id` | ContractorLeadDetailComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 16 | `/contractor/appointments` | ContractorAppointmentsComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 17 | `/contractor/portfolio` | PortfolioListComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 18 | `/contractor/portfolio/new` | PortfolioFormComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 19 | `/contractor/portfolio/:id` | PortfolioDetailComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 20 | `/contractor/profile` | ContractorProfileComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 21 | `/contractor/service-areas` | ServiceAreasComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 22 | `/contractor/availability` | AvailabilityComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 23 | `/contractor/reviews` | ContractorReviewsComponent | CONTRACTOR | AuthGuard+RoleGuard | NEW |
| 24 | `/admin/dashboard` | AdminDashboardComponent | ADMIN | AuthGuard+RoleGuard | NEW |
| 25 | `/admin/users` | AdminUsersComponent | ADMIN | AuthGuard+RoleGuard | NEW |
| 26 | `/admin/contractors` | AdminContractorsComponent | ADMIN | AuthGuard+RoleGuard | NEW |
| 27 | `/admin/requests` | AdminRequestsComponent | ADMIN | AuthGuard+RoleGuard | NEW |

**Removed legacy routes:** `/missions`, `/annonce`, `/formannonce`, `/forget`, `/profile` (unguarded)

---

## I. Complete Screen Inventory

### PUBLIC SCREENS

---

#### I.1 Landing Page

| Field | Value |
|-------|-------|
| **Route** | `/home` |
| **Role** | PUBLIC |
| **Purpose** | Convert visitors into registrations or service requests |
| **Primary CTA** | "Get a Free Quote" → /register/customer |
| **Secondary CTA** | "Join as a Contractor" → /register/contractor |
| **Data source** | Static content (demo site) |
| **API dependency** | None |
| **States** | Default |
| **Empty state** | N/A |
| **Loading state** | N/A |
| **Error state** | N/A |
| **Responsive** | Full-width hero on mobile, 2-column on desktop |
| **Content sections** | Hero with search (service type + zip), How it works (3 steps), Stats (reactivity, customers, services), Featured contractors, Testimonials, CTA footer |

---

#### I.2 Login

| Field | Value |
|-------|-------|
| **Route** | `/login` |
| **Role** | PUBLIC |
| **Purpose** | Authenticate user |
| **Primary CTA** | "Log In" |
| **Secondary CTA** | "Create a homeowner account" / "Join as a contractor" |
| **Data source** | User input |
| **API dependency** | `POST /auth/login` |
| **States** | Default → Loading → Success (redirect) / Error |
| **Empty state** | N/A |
| **Loading state** | Spinner on button |
| **Error state** | `<app-alert>` inline error |
| **Responsive** | 2-column (brand left, form right), stacks on mobile |

---

#### I.3 Customer Registration

| Field | Value |
|-------|-------|
| **Route** | `/register/customer` |
| **Role** | PUBLIC |
| **Purpose** | Create homeowner account |
| **Primary CTA** | "Create Account" |
| **Secondary CTA** | "Log in" / "Join as a contractor" |
| **Data source** | User input |
| **API dependency** | `POST /auth/register/customer` → auto-login via `POST /auth/login` |
| **States** | Default → Loading → Success (redirect to /customer/dashboard) / Error |
| **Empty state** | N/A |
| **Loading state** | Spinner on button |
| **Error state** | `<app-alert>` inline (email exists, validation) |
| **Responsive** | 2-column, stacks on mobile |

---

#### I.4 Contractor Registration

| Field | Value |
|-------|-------|
| **Route** | `/register/contractor` |
| **Role** | PUBLIC |
| **Purpose** | Create contractor account |
| **Primary CTA** | "Create Account" |
| **Secondary CTA** | "Log in" / "Register as homeowner" |
| **Data source** | User input |
| **API dependency** | `POST /auth/register/contractor` → auto-login via `POST /auth/login` |
| **States** | Default → Loading → Success (redirect to /contractor/dashboard) / Error |
| **Empty state** | N/A |
| **Loading state** | Spinner on button |
| **Error state** | `<app-alert>` inline |
| **Responsive** | 2-column, stacks on mobile |

---

#### I.5 Public Contractor Profile

| Field | Value |
|-------|-------|
| **Route** | `/contractor/:id` |
| **Role** | PUBLIC |
| **Purpose** | Show contractor credibility to potential customers |
| **Primary CTA** | "Request Service" → /customer/request/new (with contractor prefilled) |
| **Secondary CTA** | None |
| **Data source** | `GET /contractor-profile/{id}`, `GET /reviews/contractor/{id}`, `GET /contractor-portfolio/{id}` (future) |
| **API dependency** | `GET /contractor-profile/{id}` ✅, `GET /reviews/contractor/{id}` ✅ |
| **States** | Loading → Loaded → Error (contractor not found) |
| **Empty state** | "Contractor profile not found" |
| **Loading state** | `<app-skeleton>` card layout |
| **Error state** | `<app-alert>` or 404 page |
| **Responsive** | Single column, stacked sections |
| **Sections** | Header (name, rating, verified badge, specialties), About, Service Areas (zip chips), Reviews, Portfolio (future) |

---

### CUSTOMER SCREENS

---

#### I.6 Customer Dashboard

| Field | Value |
|-------|-------|
| **Route** | `/customer/dashboard` |
| **Role** | CUSTOMER |
| **Purpose** | Overview of service requests and upcoming appointments |
| **Primary CTA** | "Request HVAC Service" → /customer/request/new |
| **Secondary CTA** | View all requests → /customer/requests |
| **Data source** | `GET /service-requests/my-requests`, `GET /appointments/my-appointments` |
| **API dependency** | `GET /service-requests/my-requests` ✅, `GET /appointments/my-appointments` ✅ |
| **States** | Loading → Has data → Empty (no requests) |
| **Empty state** | "No service requests yet" + CTA to create one |
| **Loading state** | 3x `<app-skeleton>` cards |
| **Error state** | `<app-alert>` error |
| **Responsive** | 3-column stats row → 2-column list + sidebar → single column |
| **Content** | Stats cards (active requests, upcoming appointments, completed), recent requests list, upcoming appointments |

---

#### I.7 New Service Request

| Field | Value |
|-------|-------|
| **Route** | `/customer/request/new` |
| **Role** | CUSTOMER |
| **Purpose** | Submit HVAC service need |
| **Primary CTA** | "Submit Request" |
| **Secondary CTA** | "Cancel" → back |
| **Data source** | User input |
| **API dependency** | `POST /service-requests` ✅ |
| **States** | Step 1 → Step 2 → Step 3 → Review → Submitting → Success (redirect to /customer/request/:id) / Error |
| **Empty state** | N/A |
| **Loading state** | Spinner on submit button |
| **Error state** | `<app-alert>` inline per step |
| **Responsive** | Single column stepper on all sizes |
| **Form steps** | 1: Service type (select), Urgency (radio) — 2: Problem description (textarea), Property type, Sq ft, HVAC system type — 3: Zip code, Address, Preferred date — 4: Review & Submit |

---

#### I.8 Request Detail (Customer View)

| Field | Value |
|-------|-------|
| **Route** | `/customer/request/:id` |
| **Role** | CUSTOMER |
| **Purpose** | Track service request progress and lead responses |
| **Primary CTA** | Depends on status: "View Quotes" / "Accept Quote" |
| **Secondary CTA** | "Cancel Request" |
| **Data source** | `GET /service-requests/{id}`, `GET /leads/{id}` (via SR) |
| **API dependency** | `GET /service-requests/{id}` ✅ |
| **States** | Loading → NEW (no leads) → MATCHED (leads pending) → ACCEPTED (quote received) → SCHEDULED (appointment set) → COMPLETED → CANCELLED |
| **Empty state** | "No contractors have responded yet" (for NEW) |
| **Loading state** | `<app-skeleton>` detail layout |
| **Error state** | `<app-alert>` error |
| **Responsive** | 2-column (detail + sidebar) → single column |
| **Content** | Status timeline, service details, lead cards (contractor name, quote, status), appointment info when scheduled |

---

#### I.9 My Requests (Customer)

| Field | Value |
|-------|-------|
| **Route** | `/customer/requests` |
| **Role** | CUSTOMER |
| **Purpose** | View all service request history |
| **Primary CTA** | "New Request" → /customer/request/new |
| **Secondary CTA** | Filter by status |
| **Data source** | `GET /service-requests/my-requests` |
| **API dependency** | `GET /service-requests/my-requests` ✅ |
| **States** | Loading → Has requests → Empty |
| **Empty state** | "No requests yet" + CTA |
| **Loading state** | `<app-skeleton>` list items |
| **Error state** | `<app-alert>` error |
| **Responsive** | Table on desktop, cards on mobile |
| **Content** | Filterable list: service type, status badge, zip, date, contractor name |

---

#### I.10 Customer Appointments

| Field | Value |
|-------|-------|
| **Route** | `/customer/appointments` |
| **Role** | CUSTOMER |
| **Purpose** | View scheduled HVAC appointments |
| **Primary CTA** | None (read-only) |
| **Secondary CTA** | "Request Service" (if no appointments) |
| **Data source** | `GET /appointments/my-appointments` |
| **API dependency** | `GET /appointments/my-appointments` ✅ |
| **States** | Loading → Has appointments → Empty |
| **Empty state** | "No upcoming appointments" |
| **Loading state** | `<app-skeleton>` list |
| **Error state** | `<app-alert>` error |
| **Responsive** | List view, stacks on mobile |
| **Content** | Date/time, contractor name + rating, service type, status badge, address |

---

#### I.11 Customer Profile

| Field | Value |
|-------|-------|
| **Route** | `/customer/profile` |
| **Role** | CUSTOMER |
| **Purpose** | Edit personal information |
| **Primary CTA** | "Save Changes" |
| **Secondary CTA** | None |
| **Data source** | `GET /auth/me`, User input |
| **API dependency** | `GET /auth/me` ✅, `PUT /users/me` **NOT YET IMPLEMENTED** |
| **States** | Loading → Loaded → Saving → Saved / Error |
| **Empty state** | N/A |
| **Loading state** | Form skeleton |
| **Error state** | `<app-alert>` error |
| **Responsive** | Single column form, max-width 600px |
| **Fields** | First name, Last name, Email (read-only), Phone |

---

#### I.12 Review Form

| Field | Value |
|-------|-------|
| **Route** | `/customer/review/:contractorId` |
| **Role** | CUSTOMER |
| **Purpose** | Rate contractor after completed service |
| **Primary CTA** | "Submit Review" |
| **Secondary CTA** | "Cancel" → back |
| **Data source** | `GET /contractor-profile/{id}`, User input |
| **API dependency** | `POST /reviews/service-request/{serviceRequestId}` ✅ |
| **States** | Loading → Form → Submitting → Success / Error |
| **Empty state** | N/A |
| **Loading state** | Form skeleton |
| **Error state** | `<app-alert>` error |
| **Responsive** | Single column |
| **Fields** | Overall rating (1-5 stars), Quality, Professionalism, Punctuality, Communication (all 1-5), Comment textarea |

---

### CONTRACTOR SCREENS

---

#### I.13 Contractor Dashboard

| Field | Value |
|-------|-------|
| **Route** | `/contractor/dashboard` |
| **Role** | CONTRACTOR |
| **Purpose** | Overview of leads, appointments, and business metrics |
| **Primary CTA** | "View Leads" → /contractor/leads |
| **Secondary CTA** | "Complete Your Profile" (if setup incomplete) |
| **Data source** | `GET /leads/my-leads`, `GET /appointments/my-appointments`, `GET /contractor-profile/me` |
| **API dependency** | `GET /leads/my-leads` ✅, `GET /appointments/my-appointments` ✅, `GET /contractor-profile/me` ✅ |
| **States** | Loading → Has data → Setup incomplete → Empty |
| **Empty state** | "No leads yet — complete your profile to start receiving leads" |
| **Loading state** | `<app-skeleton>` cards |
| **Error state** | `<app-alert>` error |
| **Responsive** | 3-column stats → 2-column content → single column |
| **Content** | Stats cards (new leads, today's appointments, completed jobs), recent leads list, today's appointments |

---

#### I.14 Contractor Leads

| Field | Value |
|-------|-------|
| **Route** | `/contractor/leads` |
| **Role** | CONTRACTOR |
| **Purpose** | View all assigned leads |
| **Primary CTA** | None (passive view) |
| **Secondary CTA** | Filter by status (All / New / Accepted / Rejected) |
| **Data source** | `GET /leads/my-leads` |
| **API dependency** | `GET /leads/my-leads` ✅ |
| **States** | Loading → Has leads → Empty |
| **Empty state** | "No leads assigned yet" |
| **Loading state** | `<app-skeleton>` list |
| **Error state** | `<app-alert>` error |
| **Responsive** | Table on desktop, cards on mobile |
| **Content** | Lead cards: service type, urgency badge, zip, date, status, quoted price (if accepted) |

---

#### I.15 Contractor Lead Detail

| Field | Value |
|-------|-------|
| **Route** | `/contractor/leads/:id` |
| **Role** | CONTRACTOR |
| **Purpose** | View lead details and respond |
| **Primary CTA** | "Accept Lead" → quote modal / "Reject Lead" → reason modal |
| **Secondary CTA** | "View Customer Profile" (future) |
| **Data source** | `GET /leads/{id}`, `GET /service-requests/{id}` (via lead) |
| **API dependency** | `GET /leads/{id}` ✅, `POST /leads/{id}/accept` ✅, `POST /leads/{id}/reject` ✅ |
| **States** | Loading → SENT (can respond) → ACCEPTED/REJECTED (read-only) |
| **Empty state** | N/A |
| **Loading state** | `<app-skeleton>` detail |
| **Error state** | `<app-alert>` error |
| **Responsive** | 2-column → single column |
| **Content** | Service request details, customer info (anonymized), urgency, property info, action buttons |

---

#### I.16 Contractor Appointments

| Field | Value |
|-------|-------|
| **Route** | `/contractor/appointments` |
| **Role** | CONTRACTOR |
| **Purpose** | Manage scheduled appointments |
| **Primary CTA** | None (passive view) |
| **Secondary CTA** | Filter by status / date |
| **Data source** | `GET /appointments/my-appointments` |
| **API dependency** | `GET /appointments/my-appointments` ✅, `PATCH /appointments/{id}/status` ✅ |
| **States** | Loading → Has appointments → Empty |
| **Empty state** | "No upcoming appointments" |
| **Loading state** | `<app-skeleton>` list |
| **Error state** | `<app-alert>` error |
| **Responsive** | List/calendar view, stacks on mobile |
| **Content** | Date/time, customer name, service type, status, action buttons (Complete / Cancel / No Show) |

---

#### I.17 Contractor Profile

| Field | Value |
|-------|-------|
| **Route** | `/contractor/profile` |
| **Role** | CONTRACTOR |
| **Purpose** | Manage business information |
| **Primary CTA** | "Save Profile" |
| **Secondary CTA** | None |
| **Data source** | `GET /contractor-profile/me`, User input |
| **API dependency** | `GET /contractor-profile/me` ✅, `PUT /contractor-profile/me` ✅ |
| **States** | Loading → Loaded → Saving → Saved / Error |
| **Empty state** | N/A (new contractors get empty form) |
| **Loading state** | Form skeleton |
| **Error state** | `<app-alert>` error |
| **Responsive** | Single column form, max-width 700px |
| **Fields** | Business name, Description, License number, Specialties (multi-select chips), Base rate, Response time (hours), Accepts emergency (toggle), Logo URL |

---

#### I.18 Service Areas

| Field | Value |
|-------|-------|
| **Route** | `/contractor/service-areas` |
| **Role** | CONTRACTOR |
| **Purpose** | Manage zip code coverage |
| **Primary CTA** | "Add Zip Code" |
| **Secondary CTA** | Remove individual zip |
| **Data source** | `GET /service-areas/my-areas` |
| **API dependency** | `GET /service-areas/my-areas` ✅, `POST /service-areas` ✅, `DELETE /service-areas/{id}` ✅ |
| **States** | Loading → Has areas → Empty |
| **Empty state** | "No service areas set — add zip codes where you operate" |
| **Loading state** | `<app-skeleton>` chips |
| **Error state** | `<app-alert>` error |
| **Responsive** | Chip list with input |
| **Content** | Zip code chips with remove button, input field with "Add" button, map preview (future) |

---

#### I.19 Availability

| Field | Value |
|-------|-------|
| **Route** | `/contractor/availability` |
| **Role** | CONTRACTOR |
| **Purpose** | Set weekly working hours |
| **Primary CTA** | "Save Schedule" |
| **Secondary CTA** | None |
| **Data source** | `GET /availability/my-availability` |
| **API dependency** | `GET /availability/my-availability` ✅, `POST /availability` ✅, `PUT /availability/{id}` ✅, `DELETE /availability/{id}` ✅ |
| **States** | Loading → Loaded → Saving → Saved / Error |
| **Empty state** | "No availability set — add your working hours" |
| **Loading state** | Form skeleton |
| **Error state** | `<app-alert>` error |
| **Responsive** | Weekly grid, stacks on mobile |
| **Content** | Day-of-week rows with start/end time pickers, emergency toggle per day |

---

#### I.20 Contractor Reviews

| Field | Value |
|-------|-------|
| **Route** | `/contractor/reviews` |
| **Role** | CONTRACTOR |
| **Purpose** | View customer reviews and ratings |
| **Primary CTA** | None (read-only) |
| **Secondary CTA** | None |
| **Data source** | `GET /reviews/contractor/{id}`, `GET /contractor-profile/me` |
| **API dependency** | `GET /reviews/contractor/{contractorId}` ✅ |
| **States** | Loading → Has reviews → Empty |
| **Empty state** | "No reviews yet" |
| **Loading state** | `<app-skeleton>` list |
| **Error state** | `<app-alert>` error |
| **Responsive** | Single column |
| **Content** | Overall rating card (average, breakdown bar chart), individual review cards (customer name, date, 5-axis breakdown, comment) |

---

#### I.21 Contractor Portfolio List

| Field | Value |
|-------|-------|
| **Route** | `/contractor/portfolio` |
| **Role** | CONTRACTOR |
| **Purpose** | Showcase completed HVAC projects |
| **Primary CTA** | "Add Project" → /contractor/portfolio/new |
| **Secondary CTA** | Filter by service type |
| **Data source** | `GET /contractor-portfolio/my-projects` (**NOT YET IMPLEMENTED**) |
| **API dependency** | **Backend not yet implemented** |
| **States** | Loading → Has projects → Empty |
| **Empty state** | "No projects yet — add your best work to build trust with homeowners" |
| **Loading state** | `<app-skeleton>` card grid |
| **Error state** | `<app-alert>` error |
| **Responsive** | 3-column grid → 2-column → single column |
| **Content** | Project cards with thumbnail, title, service type, date |

---

#### I.22 Portfolio Project Form (Add/Edit)

| Field | Value |
|-------|-------|
| **Route** | `/contractor/portfolio/new` or `/contractor/portfolio/:id/edit` |
| **Role** | CONTRACTOR |
| **Purpose** | Create or edit a portfolio project |
| **Primary CTA** | "Save Project" |
| **Secondary CTA** | "Cancel" → back |
| **Data source** | User input, existing project data (for edit) |
| **API dependency** | `POST /contractor-portfolio` (**NOT YET IMPLEMENTED**), `PUT /contractor-portfolio/{id}` (**NOT YET IMPLEMENTED**) |
| **States** | Loading → Form → Submitting → Success / Error |
| **Empty state** | N/A |
| **Loading state** | Form skeleton (edit only) |
| **Error state** | `<app-alert>` error |
| **Responsive** | Single column form |
| **Fields** | Title, Service type (select), Description, Problem description, Solution description, Before photo (upload), After photo (upload), WIP photo (optional upload), Location/area, Completion date |

---

#### I.23 Portfolio Project Detail

| Field | Value |
|-------|-------|
| **Route** | `/contractor/portfolio/:id` |
| **Role** | CONTRACTOR (owner) / PUBLIC (view) |
| **Purpose** | View portfolio project with before/after photos |
| **Primary CTA** | "Edit Project" (owner) |
| **Secondary CTA** | "Delete Project" (owner, with confirm) |
| **Data source** | `GET /contractor-portfolio/{id}` (**NOT YET IMPLEMENTED**) |
| **API dependency** | **Backend not yet implemented** |
| **States** | Loading → Loaded → Error |
| **Empty state** | "Project not found" |
| **Loading state** | `<app-skeleton>` layout |
| **Error state** | `<app-alert>` or 404 |
| **Responsive** | 2-column (images + details) → single column |
| **Content** | Before/After image comparison, project metadata, description sections |

---

### ADMIN SCREENS

---

#### I.24 Admin Dashboard

| Field | Value |
|-------|-------|
| **Route** | `/admin/dashboard` |
| **Role** | ADMIN |
| **Purpose** | Platform health overview |
| **Primary CTA** | Navigate to management sections |
| **Secondary CTA** | None |
| **Data source** | `GET /users` (count), `GET /service-requests` (count + status), demo data |
| **API dependency** | `GET /users` ✅, `GET /service-requests` ✅ |
| **States** | Loading → Loaded → Error |
| **Empty state** | N/A (seed data ensures data exists) |
| **Loading state** | `<app-skeleton>` stat cards |
| **Error state** | `<app-alert>` error |
| **Responsive** | 4-column stats → 2-column content → single column |
| **Content** | Stats cards (total users, active requests, completed jobs, total contractors), recent activity feed, quick links |

---

#### I.25 Admin User Management

| Field | Value |
|-------|-------|
| **Route** | `/admin/users` |
| **Role** | ADMIN |
| **Purpose** | View and manage platform users |
| **Primary CTA** | None (management view) |
| **Secondary CTA** | Toggle active/inactive |
| **Data source** | `GET /users` |
| **API dependency** | `GET /users` ✅, `PUT /users/{id}` ✅, `DELETE /users/{id}` ✅ |
| **States** | Loading → Has users → Error |
| **Empty state** | N/A |
| **Loading state** | `<app-skeleton>` table rows |
| **Error state** | `<app-alert>` error |
| **Responsive** | Table on desktop, cards on mobile |
| **Content** | User table: name, email, role, status, joined date, actions |

---

#### I.26 Admin Contractor Management

| Field | Value |
|-------|-------|
| **Route** | `/admin/contractors` |
| **Role** | ADMIN |
| **Purpose** | Verify and manage contractors |
| **Primary CTA** | None |
| **Secondary CTA** | Toggle verified status |
| **Data source** | `GET /users` (filter CONTRACTOR), `GET /contractor-profile/{id}` |
| **API dependency** | `GET /users` ✅, `GET /contractor-profile/{id}` ✅, `PUT /contractor-profile/{id}` ✅ (via admin update) |
| **States** | Loading → Has contractors → Error |
| **Empty state** | N/A |
| **Loading state** | `<app-skeleton>` table rows |
| **Error state** | `<app-alert>` error |
| **Responsive** | Table on desktop, cards on mobile |
| **Content** | Contractor table: business name, owner name, license, verified status, avg rating, actions |

---

#### I.27 Admin Request Management

| Field | Value |
|-------|-------|
| **Route** | `/admin/requests` |
| **Role** | ADMIN |
| **Purpose** | Oversee all service requests |
| **Primary CTA** | None |
| **Secondary CTA** | Override status, cancel request |
| **Data source** | `GET /service-requests` |
| **API dependency** | `GET /service-requests` ✅, `PUT /service-requests/{id}` ✅ |
| **States** | Loading → Has requests → Error |
| **Empty state** | N/A |
| **Loading state** | `<app-skeleton>` table rows |
| **Error state** | `<app-alert>` error |
| **Responsive** | Table on desktop, cards on mobile |
| **Content** | Request table: customer, service type, zip, status, urgency, created date, actions |

---

## J. Customer Journey

```
1. Visit /home
   → Hero: "Trusted HVAC Service in Phoenix"
   → Search bar: service type + zip
   → Click "Get a Free Quote"

2. Redirect to /register/customer
   → Fill: firstName, lastName, email, password
   → Auto-login → /customer/dashboard

3. Dashboard: empty state
   → CTA: "Request HVAC Service"

4. /customer/request/new
   Step 1: Service type (AC Repair, Installation, Heating, Emergency, Maintenance)
           Urgency (Routine, Urgent, Emergency)
   Step 2: Problem description, Property type, Sq ft, HVAC system type
   Step 3: Zip code, Address, Preferred date
   Step 4: Review & Submit

5. POST /service-requests → backend creates SR + auto-assigns leads to matching contractors
   → Redirect to /customer/request/:id

6. Request detail shows status timeline:
   NEW → "Searching for contractors..."
   MATCHED → Lead cards appear (contractor name, status)
   ACCEPTED → Quote displayed (price, notes)
   SCHEDULED → Appointment details (date, time, contractor)

7. View appointments at /customer/appointments

8. After COMPLETED job:
   → Prompt to leave review at /customer/review/:contractorId
   → 5-axis rating + comment
```

---

## K. Contractor Journey

```
1. Visit /home → click "Join as a Contractor"

2. /register/contractor
   → Fill: firstName, lastName, email, password
   → Auto-login → /contractor/dashboard

3. Dashboard: setup checklist
   □ Complete profile (/contractor/profile)
   □ Set service areas (/contractor/service-areas)
   □ Set availability (/contractor/availability)

4. When customer creates ServiceRequest in their zip:
   → LeadAssignment created (status=SENT)
   → Dashboard shows "New Lead" notification

5. /contractor/leads → see assigned leads

6. /contractor/leads/:id → view service request details
   → Click "Accept Lead" → enter quotedPrice + notes → submit
   → OR "Reject Lead" → enter reason → submit

7. After acceptance: create appointment
   → POST /appointments/service-request/{id}
   → Set scheduledStart, scheduledEnd, notes

8. /contractor/appointments → manage schedule
   → Click appointment → mark Complete / Cancel / No Show

9. After completion: customer leaves review
   → Review appears at /contractor/reviews

10. /contractor/portfolio → add completed projects with before/after photos
```

---

## L. Admin Journey

```
1. Login → /admin/dashboard
   → Stats: Total users (9), Active requests (5), Completed (1), Contractors (5)

2. /admin/users → manage all users
   → Toggle active/inactive, view details

3. /admin/contractors → verify contractors
   → Toggle verified status, view profiles

4. /admin/requests → oversee requests
   → Override status (demo/sales), cancel requests
```

---

## M. Public Marketing Journey

```
1. /home → HVAC branded landing page
   → Hero with search (service type + zip)
   → "How it Works": 3 steps (Request → Match → Book)
   → Stats: Response time, customers, services
   → Featured contractors (top-rated, verified)
   → Testimonials
   → CTA: "Get Started" / "Join as Contractor"

2. /contractor/:id → Public contractor profile
   → Business info, rating, verified badge
   → Specialties, service areas
   → Reviews with 5-axis breakdown
   → Portfolio (future)
   → CTA: "Request Service"
```

---

## N. Contractor Portfolio UX

### N.1 Portfolio as Trust Mechanism

The portfolio is the primary visual trust-builder for homeowners. It answers: "What does this contractor's work actually look like?"

### N.2 Portfolio Card Design

```
┌─────────────────────────────┐
│  [Before Image]             │
│  ─────────────────────────  │
│  [After Image]              │
│                             │
│  Title: AC Unit Replacement │
│  Type: AC Installation      │
│  Date: Aug 2026             │
│  Area: Phoenix, AZ 85016    │
│                             │
│  ★★★★☆ (4.5)               │
└─────────────────────────────┘
```

### N.3 Project Detail Layout

```
┌────────────────────────────────────────────────────────┐
│  [Before Image]  ←→  [After Image]                    │
│  (slider or side-by-side comparison)                   │
├────────────────────────────────────────────────────────┤
│  Project Title                                         │
│  Service Type · Area · Completion Date                 │
├────────────────────────────────────────────────────────┤
│  PROBLEM                                               │
│  Customer's original issue description                 │
├────────────────────────────────────────────────────────┤
│  SOLUTION                                              │
│  What was done to resolve the issue                    │
├────────────────────────────────────────────────────────┤
│  Associated Review (if available)                      │
│  ★★★★★ "Excellent work!" — John D.                    │
└────────────────────────────────────────────────────────┘
```

### N.4 Before/After UX Pattern

- **Card view:** Before image on top, After on bottom, with visual divider
- **Detail view:** Side-by-side on desktop, stacked on mobile
- **Missing photo behavior:** Show placeholder with camera icon + "Photo not available"
- **Empty state:** "No projects yet — add your best work to build trust"
- **Filter:** By service type (AC Repair, Installation, Heating, Maintenance)

### N.5 Image Upload Dependency

Portfolio image upload requires a file storage backend (S3, local storage, etc.) which does not yet exist. Portfolio MVP should support:
- URL input for images (contractor provides hosted image URLs)
- Future: native file upload component

---

## O. Before/After UX

### O.1 The Story Pattern

The before/after flow tells a story:

```
"When we arrived" → "What we fixed" → "How it looks now"
```

### O.2 Visual Treatment

- **Before image:** Slightly desaturated, labeled "Before"
- **After image:** Full color, labeled "After"
- **Divider:** Animated line or slider handle
- **Mobile:** Stacked vertically (Before on top, After below)

### O.3 Empty/Missing Photo States

- No before photo: Show gray placeholder with "Before photo not uploaded"
- No after photo: Show gray placeholder with "After photo not uploaded"
- No photos at all: Card shows text-only project info

---

## P. Lead Management UX

### P.1 Lead Lifecycle (Backend-Driven)

```
ServiceRequest created (CUSTOMER)
    ↓
LeadAssignment auto-created (SENT) for each matching contractor
    ↓
Contractor views lead at /contractor/leads/:id
    ↓
Contractor ACCEPTS (sets quotedPrice) → LeadAssignment.status = ACCEPTED
  OR
Contractor REJECTS (sets reason) → LeadAssignment.status = REJECTED
```

### P.2 Lead States in UI

| Status | Color | Label | Contractor Action |
|--------|-------|-------|-------------------|
| SENT | Blue (`--ch-info`) | New Lead | Accept / Reject |
| ACCEPTED | Green (`--ch-success`) | Accepted | View details |
| REJECTED | Red (`--ch-error`) | Rejected | Read-only |
| EXPIRED | Gray (`--ch-text-muted`) | Expired | Read-only |

### P.3 Customer View of Leads

Customer sees lead status on Request Detail page. They do NOT see individual contractor names until a contractor accepts. This protects contractor privacy during the matching phase.

---

## Q. Matching UX

### Q.1 Current Matching (Backend-Driven)

When a customer creates a `ServiceRequest`:
- Backend's `ServiceRequestService.createServiceRequest()` is called
- **No automatic matching currently exists in the service layer** — `LeadAssignment` records are created only by the `DemoDataSeeder`
- In production, matching would be a service-layer job that finds contractors whose:
  - `ServiceArea` includes the request's `zipCode`
  - `ContractorProfile.specialties` includes the request's `serviceType`
  - `Availability` covers the preferred date/time

### Q.2 Matching UX States (Frontend)

| State | Customer Sees | Contractor Sees |
|-------|---------------|-----------------|
| NEW | "Searching for contractors..." | Nothing yet |
| MATCHED | "X contractors notified" | "New lead" in dashboard |
| ACCEPTED | "Quote received: $X" | Lead in "Accepted" tab |
| SCHEDULED | "Appointment confirmed" | Appointment in schedule |

### Q.3 Future Matching Enhancement

Backend will need a matching endpoint or automatic trigger after ServiceRequest creation. For the demo, this can be simulated via DemoDataSeeder or a manual admin action.

---

## R. Quote UX

### R.1 Current Quote Mechanism

The quote is embedded in `LeadAssignment`:
- `quotedPrice` (Double) — set when contractor accepts
- `contractorNotes` (String) — optional message

There is NO separate Quote entity.

### R.2 Quote Flow

```
Contractor views lead → clicks "Accept"
  → Modal: Enter quoted price ($) + notes (optional)
  → Submit → LeadAssignment.status = ACCEPTED, quotedPrice set
  → Customer sees quote on Request Detail page
```

### R.3 Quote Display

```
┌────────────────────────────────┐
│  Quote from Cool Air Solutions │
│  ★★★★★ 4.9 · Verified         │
│                                │
│  $450.00                       │
│  "Standard AC repair service.  │
│   Parts included."             │
│                                │
│  Responded: 2 hours ago        │
└────────────────────────────────┘
```

### R.4 Customer Quote Actions

The current backend does NOT support customer-side quote acceptance as a discrete action. The flow is:
- Contractor accepts lead (with quote) → creates appointment
- Customer sees appointment appear

**Future enhancement needed:** Customer acceptance endpoint for quote approval before appointment creation.

---

## S. Appointment UX

### S.1 Current Appointment Flow

```
Contractor accepts lead (with quote)
    ↓
Contractor creates appointment (POST /appointments/service-request/{id})
    ↓
Appointment.status = SCHEDULED
    ↓
Contractor updates status: COMPLETED / CANCELLED / NO_SHOW
```

### S.2 Customer Does NOT Create Appointments

The backend restricts `POST /appointments` to `CONTRACTOR` or `ADMIN` roles. Customers view appointments but do not create them.

### S.3 Appointment States

| Status | Color | Label | Who Changes |
|--------|-------|-------|-------------|
| SCHEDULED | Blue | Scheduled | Contractor (on creation) |
| COMPLETED | Green | Completed | Contractor |
| CANCELLED | Red | Cancelled | Contractor |
| NO_SHOW | Orange | No Show | Contractor |

### S.4 Appointment Display

```
┌────────────────────────────────┐
│  📅 Aug 28, 2026 · 10:00 AM   │
│  Cool Air Solutions            │
│  AC Repair · Residential       │
│  123 E Camelback Rd            │
│  Status: Scheduled             │
│  Notes: "Gate code: 1234"      │
└────────────────────────────────┘
```

---

## T. Review UX

### T.1 Review Submission

Customer submits review after a COMPLETED appointment:
- `POST /reviews/service-request/{serviceRequestId}`
- 5-axis rating: overall, quality, professionalism, punctuality, communication
- Comment (text)

### T.2 Review Display

```
┌────────────────────────────────┐
│  ★★★★★ 5.0                    │
│  John D. · Aug 25, 2026        │
│                                │
│  "Excellent emergency service! │
│   Technician arrived quickly   │
│   and fixed the issue."        │
│                                │
│  Quality: ★★★★★               │
│  Professionalism: ★★★★★       │
│  Punctuality: ★★★★☆           │
│  Communication: ★★★★★         │
└────────────────────────────────┘
```

### T.3 Review Aggregation

`ContractorProfile` has `averageRating` and `totalReviews` — updated when review is created.

---

## U. Navigation Architecture

### U.1 Three Navigation Shells

| Shell | Used By | Structure |
|-------|---------|-----------|
| **Public Nav** | Landing, Login, Register, Public Profile | Logo + "Log In" + "Sign Up" buttons |
| **Customer Nav** | All `/customer/*` routes | Logo + Dashboard + Requests + Appointments + Profile dropdown + Logout |
| **Contractor Nav** | All `/contractor/*` routes | Logo + Dashboard + Leads + Appointments + Portfolio + Profile dropdown + Logout |
| **Admin Nav** | All `/admin/*` routes | Logo + Dashboard + Users + Contractors + Requests + Profile dropdown + Logout |

### U.2 Implementation

F1 creates three layout components:
- `CustomerLayoutComponent` — top bar + `<router-outlet>`
- `ContractorLayoutComponent` — top bar + `<router-outlet>`
- `AdminLayoutComponent` — top bar + `<router-outlet>`

Each layout contains a role-aware `TopBarComponent` (shared, driven by `AuthService.currentUser$`).

### U.3 Current Nav Issues to Fix

1. French text ("nom d'utilisateur", "Modifier mon profil", "Mes missions", "Mes annonces", "Déconnexion")
2. Logout button not wired
3. No role-based menu items
4. Notifications hardcoded
5. Uses old `<app-nav>` everywhere — needs role-specific replacement

---

## V. Responsive Strategy

### V.1 Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 640px | Single column, stacked, hamburger nav |
| Tablet | 640px–1024px | 2-column where appropriate |
| Desktop | > 1024px | Full layout, sidebar optional |

### V.2 Key Responsive Patterns

- **Auth pages (login, register):** 2-column on desktop → stacked on mobile (brand on top)
- **Dashboards:** Stats row → 3-col / 2-col / 1-col based on width
- **Lists:** Table on desktop → cards on mobile
- **Forms:** Single column, max-width container
- **Nav:** Full menu on desktop → hamburger on mobile
- **Portfolio grid:** 3-col → 2-col → 1-col

---

## W. Accessibility Strategy

### W.1 Requirements

- All form fields have associated `<mat-label>` or `aria-label`
- Error messages linked via `aria-describedby`
- Color is never the sole indicator of status (always paired with text/icons)
- Focus management on route changes
- Keyboard navigation for all interactive elements
- `mat-error` for form validation messages
- `alt` text on all images
- `role` attributes where Angular Material doesn't provide them

### W.2 Already Implemented

- Login form: password visibility toggle with `aria-label` and `aria-pressed`
- `app-alert`: dismissible with button
- `app-skeleton`: loading placeholder

---

## X. Backend API Mapping

### X.1 Current Endpoints (Verified)

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | `/auth/login` | Public | Authenticate, return JWT |
| 2 | POST | `/auth/register/customer` | Public | Register customer (returns user, NO token) |
| 3 | POST | `/auth/register/contractor` | Public | Register contractor (returns user, NO token) |
| 4 | GET | `/auth/me` | Authenticated | Get current user info |
| 5 | GET | `/users` | ADMIN | List all users |
| 6 | GET | `/users/{id}` | ADMIN | Get user by ID |
| 7 | PUT | `/users/{id}` | ADMIN | Update user |
| 8 | DELETE | `/users/{id}` | ADMIN | Delete user |
| 9 | POST | `/service-requests` | CUSTOMER | Create service request |
| 10 | GET | `/service-requests/{id}` | C+T+A | Get service request |
| 11 | GET | `/service-requests/my-requests` | CUSTOMER | Get my requests |
| 12 | PUT | `/service-requests/{id}` | C+T+A | Update service request |
| 13 | GET | `/service-requests` | ADMIN | Get all requests |
| 14 | GET | `/leads/{id}` | C+T+A | Get lead assignment |
| 15 | GET | `/leads/my-leads` | CONTRACTOR | Get my leads |
| 16 | POST | `/leads/{id}/accept` | CONTRACTOR | Accept lead |
| 17 | POST | `/leads/{id}/reject` | CONTRACTOR | Reject lead |
| 18 | POST | `/appointments/service-request/{id}` | T+A | Create appointment |
| 19 | GET | `/appointments/{id}` | C+T+A | Get appointment |
| 20 | GET | `/appointments/my-appointments` | C+T | Get my appointments |
| 21 | PATCH | `/appointments/{id}/status` | T+A | Update appointment status |
| 22 | POST | `/reviews/service-request/{id}` | CUSTOMER | Create review |
| 23 | GET | `/reviews/contractor/{id}` | C+T+A | Get contractor reviews |
| 24 | GET | `/reviews/my-reviews` | C+T | Get my reviews |
| 25 | POST | `/availability` | CONTRACTOR | Create availability |
| 26 | GET | `/availability/my-availability` | CONTRACTOR | Get my availability |
| 27 | PUT | `/availability/{id}` | CONTRACTOR | Update availability |
| 28 | DELETE | `/availability/{id}` | CONTRACTOR | Delete availability |
| 29 | POST | `/service-areas` | CONTRACTOR | Create service area |
| 30 | GET | `/service-areas/my-areas` | CONTRACTOR | Get my areas |
| 31 | DELETE | `/service-areas/{id}` | CONTRACTOR | Delete service area |
| 32 | GET | `/service-areas/zip/{zipCode}` | Public | Find areas by zip |
| 33 | GET | `/contractor-profile/me` | CONTRACTOR | Get my profile |
| 34 | PUT | `/contractor-profile/me` | CONTRACTOR | Update my profile |
| 35 | GET | `/contractor-profile/{id}` | Public | Get contractor profile |

---

## Y. Backend Gap Analysis

### Y.1 SUPPORTED NOW (Verified via actual controller inspection)

| Capability | Endpoint | Status |
|-----------|----------|--------|
| Customer create service request | `POST /service-requests` | ✅ |
| Customer view my requests | `GET /service-requests/my-requests` | ✅ |
| Customer view request detail | `GET /service-requests/{id}` | ✅ |
| Customer view my appointments | `GET /appointments/my-appointments` | ✅ |
| Customer view contractor reviews | `GET /reviews/contractor/{id}` | ✅ |
| Customer create review | `POST /reviews/service-request/{id}` | ✅ |
| Contractor view my leads | `GET /leads/my-leads` | ✅ |
| Contractor view lead detail | `GET /leads/{id}` | ✅ |
| Contractor accept lead (with quote) | `POST /leads/{id}/accept` | ✅ |
| Contractor reject lead | `POST /leads/{id}/reject` | ✅ |
| Contractor create appointment | `POST /appointments/service-request/{id}` | ✅ |
| Contractor view my appointments | `GET /appointments/my-appointments` | ✅ |
| Contractor update appointment status | `PATCH /appointments/{id}/status` | ✅ |
| Contractor profile CRUD | `GET/PUT /contractor-profile/me` | ✅ |
| Contractor availability CRUD | Full CRUD | ✅ |
| Contractor service areas CRUD | Full CRUD | ✅ |
| Contractor view my reviews | `GET /reviews/my-reviews` | ✅ |
| Admin user management | Full CRUD | ✅ |
| Admin view all requests | `GET /service-requests` | ✅ |
| Admin update any request | `PUT /service-requests/{id}` | ✅ |
| Public contractor profile | `GET /contractor-profile/{id}` | ✅ |
| Public find areas by zip | `GET /service-areas/zip/{zipCode}` | ✅ |

### Y.2 BACKEND GAPS (Required by target UX but missing)

| # | Gap | Required By | Priority |
|---|-----|------------|----------|
| 1 | **Customer self-profile update** — No `PUT /users/me` or `PUT /users/{id}` for own profile | Customer Profile screen | HIGH |
| 2 | **Automatic contractor matching** — No service logic to auto-create LeadAssignments after ServiceRequest creation | Lead flow (currently only seeded) | HIGH |
| 3 | **Contractor portfolio entity + CRUD** — No `ContractorPortfolio` entity, no controller, no repository | Portfolio screens | HIGH |
| 4 | **File/image upload** — No file storage endpoint (S3, local, etc.) | Portfolio photos, service request photos | MEDIUM |
| 5 | **Customer quote acceptance** — No endpoint for customer to formally accept/reject a quote | Quote acceptance flow | MEDIUM |
| 6 | **Contractor search/discovery** — No public endpoint to search contractors by zip + service type | Public contractor search, landing page search | MEDIUM |
| 7 | **Admin analytics/stats** — No aggregate stats endpoint | Admin dashboard | LOW |
| 8 | **Notifications** — No notification entity or endpoints | Real-time notifications | FUTURE |
| 9 | **Password recovery** — No forgot-password flow | Forget password screen | FUTURE |
| 10 | **Review aggregation** — ContractorProfile.averageRating is updated manually in seeder; needs service-layer aggregation | Review display accuracy | LOW |

### Y.3 FUTURE FEATURES (Not needed for demo MVP)

| Feature | Notes |
|---------|-------|
| Real-time notifications (WebSocket) | Nice-to-have for demo |
| Photo upload (S3/local) | URL-based for portfolio MVP |
| Customer-initiated appointment scheduling | Currently contractor-only |
| Multi-photo before/after comparison | Slider component |
| Email confirmations | Not needed for demo |
| Payment processing | Not needed for demo |
| Map view of service areas | Nice-to-have |
| Contractor availability calendar view | Can be simple list initially |

---

## Z. Frontend Service Architecture

### Z.1 Services to Create

| # | Service | API Base | Purpose |
|---|---------|----------|---------|
| 1 | `CustomerRequestService` | `/service-requests` | CRUD for customer service requests |
| 2 | `LeadService` | `/leads` | View leads, accept, reject |
| 3 | `AppointmentService` | `/appointments` | View appointments, update status |
| 4 | `ContractorProfileService` | `/contractor-profile` | Get/update contractor profile |
| 5 | `AvailabilityService` | `/availability` | CRUD for weekly schedule |
| 6 | `ServiceAreaService` | `/service-areas` | CRUD for zip codes |
| 7 | `ReviewService` | `/reviews` | Get reviews, create review |
| 8 | `UserService` | `/users` | Admin user management |
| 9 | `PortfolioService` | `/contractor-portfolio` | **Future** — CRUD for portfolio projects |

### Z.2 Service Pattern

All services follow the `AuthService` pattern:
- Injectable, `providedIn: 'root'`
- Constructor injects `HttpClient`
- Base URL: `http://localhost:8081/api/v1`
- Return `Observable<T>` from HTTP calls
- Handle errors in component (not in service)

---

## AA. Legacy Cleanup Plan

### AA.1 Classification

| File | Action | Process |
|------|--------|---------|
| `components/missions/` | DELETE CANDIDATE | 1. Verify no references in routing module or other components 2. Remove route from `app-routing.module.ts` 3. Remove import from `app.module.ts` declarations 4. Delete 4 files (ts, html, css, spec) 5. Build 6. Test |
| `components/annonces/` | DELETE CANDIDATE | Same process |
| `components/annonceform/` | DELETE CANDIDATE | Same process |
| `components/unauthnav/` | DELETE CANDIDATE | Same process — no component uses `<app-unauthnav>` in current routing |
| `components/forget/` | DEPRECATE | Keep as stub with "Coming soon" text; no route in new architecture |
| `services/annonce.service.ts` | DELETE CANDIDATE | Only used by annonces component — delete together |
| `controller/AnnonceController.java` | DELETE CANDIDATE | No frontend will call this after cleanup |
| `controller/EvaluationController.java` | DELETE CANDIDATE | No frontend will call this after cleanup |
| `entity/Annonce.java` | DELETE CANDIDATE | Only used by AnnonceController |
| `entity/Evaluation.java` | DELETE CANDIDATE | Only used by EvaluationController |
| `service/AnnonceService.java` | DELETE CANDIDATE | Only used by AnnonceController |
| `service/AnnonceServiceImp.java` | DELETE CANDIDATE | Only used by AnnonceController |
| `service/EvaluationService.java` | DELETE CANDIDATE | Only used by EvaluationController |
| `repository/AnnonceRepository.java` | DELETE CANDIDATE | Only used by AnnonceService |
| `components/home/` | REWRITE | Full rewrite for HVAC landing page |
| `components/nav/` | REWRITE | Role-aware top bar |
| `components/profile/` | REWRITE | Role-specific profile editing |
| `components/footer/` | REWRITE | Updated copyright, remove French |

### AA.2 Safe Cleanup Process (for each DELETE CANDIDATE)

```
1. grep for all references in frontend/
2. Remove from app-routing.module.ts (if route exists)
3. Remove from app.module.ts declarations (if declared)
4. Remove any imports from other components
5. Delete component files
6. npm run build — verify clean
7. npm run test — verify no regressions
8. Manual smoke test
```

### AA.3 Backend Cleanup

Same process for Annonce/Evaluation files:
1. Remove from DemoDataSeeder if referenced
2. Remove controller
3. Remove service
4. Remove repository
5. Remove entity
6. Build backend
7. Run tests

---

## AB. MVP vs Future Scope

### AB.1 MVP Scope (Demo-Ready)

| Feature | Screens | Backend | Status |
|---------|---------|---------|--------|
| Auth (login, register) | 3 | ✅ | DONE |
| Core layout (3 shells + nav) | 3 | — | NEXT |
| Customer dashboard | 1 | ✅ endpoints exist | F2 |
| Service request creation | 1 | ✅ `POST /service-requests` | F3 |
| Request detail + lead timeline | 1 | ✅ endpoints exist | F4 |
| Customer requests list | 1 | ✅ `GET /my-requests` | F4 |
| Contractor dashboard | 1 | ✅ endpoints exist | F5 |
| Contractor leads + accept/reject | 2 | ✅ endpoints exist | F6 |
| Contractor profile setup | 1 | ✅ `PUT /contractor-profile/me` | F7 |
| Service areas | 1 | ✅ full CRUD | F7 |
| Availability | 1 | ✅ full CRUD | F7 |
| Appointments (both views) | 2 | ✅ endpoints exist | F8 |
| Reviews (submit + view) | 2 | ✅ endpoints exist | F9 |
| Admin dashboard + management | 3 | ✅ endpoints exist | F12 |
| Landing page (HVAC branded) | 1 | — | F13 |
| Public contractor profile | 1 | ✅ `GET /contractor-profile/{id}` | F11 |

**Total MVP screens:** 22

### AB.2 Future Scope (After MVP)

| Feature | Notes |
|---------|-------|
| Portfolio CRUD | Requires new backend entity |
| Image upload | Requires file storage service |
| Customer quote acceptance | Requires new endpoint |
| Automatic matching | Requires service-layer logic |
| Notifications | Requires WebSocket |
| Password recovery | Requires email service |
| Map view | Requires mapping API |

---

## AC. Micro Slice Roadmap

### AC.1 Dependency Graph

```
F1 Core Layout Shell ─────────────────────────┐
    │                                          │
    ├── F2 Customer Dashboard                  │
    │   └── F3 Service Request Form            │
    │       └── F4 Request Detail / Leads      │
    │                                           │
    ├── F5 Contractor Dashboard                │
    │   ├── F6 Leads + Accept/Reject           │
    │   ├── F7 Profile + Availability + Areas  │
    │   └── F8 Appointments                    │
    │                                           │
    ├── F9 Reviews                             │
    │                                           │
    ├── F10 Public Contractor Profile          │
    │                                           │
    ├── F11 Admin Dashboard + Management       │
    │                                           │
    └── F12 Landing Page                       │

F13 Legacy Cleanup + QA + Responsive + A11y
```

### AC.2 Slice Definitions

---

#### F1 — Core Layout Shell

| Field | Value |
|-------|-------|
| **Goal** | Create role-based layout shells and navigation |
| **Inputs** | Current AuthService, guards, ROLE_DASHBOARDS |
| **Files to create** | `layouts/customer-layout/`, `layouts/contractor-layout/`, `layouts/admin-layout/`, `components/top-bar/` |
| **Files to modify** | `app-routing.module.ts`, `app.module.ts`, `nav.component` (rewrite) |
| **UI** | Three layout shells with role-aware top bar, `<router-outlet>`, mobile hamburger |
| **Backend deps** | None (uses existing `GET /auth/me`) |
| **Tests** | Route guard tests, layout rendering, responsive nav |
| **DoD** | Login as each role → see correct layout + nav → navigate to all role routes |
| **Stop** | Layout renders correctly for all 3 roles. No business logic. |

---

#### F2 — Customer Dashboard

| Field | Value |
|-------|-------|
| **Goal** | Customer sees overview of requests and appointments |
| **Inputs** | `GET /service-requests/my-requests`, `GET /appointments/my-appointments` |
| **Files to create** | `components/customer/dashboard/`, `services/customer-request.service.ts` |
| **UI** | Stats cards, recent requests list, upcoming appointments |
| **Backend deps** | ✅ Endpoints exist |
| **Tests** | Dashboard loads, empty state, stats calculation |
| **DoD** | Customer dashboard shows real data from seed data |
| **Stop** | Dashboard renders with correct stats. |

---

#### F3 — Service Request Form

| Field | Value |
|-------|-------|
| **Goal** | Customer submits HVAC service request |
| **Inputs** | `POST /service-requests` |
| **Files to create** | `components/customer/new-request/` |
| **UI** | Multi-step stepper: Service type → Problem details → Location → Review |
| **Backend deps** | ✅ `POST /service-requests` |
| **Tests** | Form validation, step navigation, submit flow |
| **DoD** | Customer can create request → redirected to request detail |
| **Stop** | Request creation works end-to-end. |

---

#### F4 — Request Detail + Customer Requests List

| Field | Value |
|-------|-------|
| **Goal** | Customer tracks request progress and views all requests |
| **Inputs** | `GET /service-requests/{id}`, `GET /service-requests/my-requests` |
| **Files to create** | `components/customer/request-detail/`, `components/customer/requests/` |
| **UI** | Status timeline, lead cards, request list with filters |
| **Backend deps** | ✅ Endpoints exist |
| **Tests** | Detail loads, list loads, status display correct |
| **DoD** | Customer can view request detail and list all requests |
| **Stop** | Request tracking works. |

---

#### F5 — Contractor Dashboard

| Field | Value |
|-------|-------|
| **Goal** | Contractor sees overview of leads and appointments |
| **Inputs** | `GET /leads/my-leads`, `GET /appointments/my-appointments`, `GET /contractor-profile/me` |
| **Files to create** | `components/contractor/dashboard/` |
| **UI** | Stats cards, recent leads, today's appointments, setup checklist |
| **Backend deps** | ✅ Endpoints exist |
| **Tests** | Dashboard loads, setup checklist state |
| **DoD** | Contractor dashboard shows real data |
| **Stop** | Dashboard renders with correct stats. |

---

#### F6 — Leads + Accept/Reject

| Field | Value |
|-------|-------|
| **Goal** | Contractor views and responds to leads |
| **Inputs** | `GET /leads/my-leads`, `GET /leads/{id}`, `POST /leads/{id}/accept`, `POST /leads/{id}/reject` |
| **Files to create** | `components/contractor/leads/`, `components/contractor/lead-detail/`, `services/lead.service.ts` |
| **UI** | Lead list with filters, lead detail with accept/reject modals |
| **Backend deps** | ✅ All endpoints exist |
| **Tests** | Lead list loads, accept flow, reject flow, quote entry |
| **DoD** | Contractor can view leads, accept with quote, reject with reason |
| **Stop** | Lead management works end-to-end. |

---

#### F7 — Contractor Profile + Availability + Service Areas

| Field | Value |
|-------|-------|
| **Goal** | Contractor sets up business profile, schedule, and coverage |
| **Inputs** | `GET/PUT /contractor-profile/me`, `GET/POST/PUT/DELETE /availability`, `GET/POST/DELETE /service-areas` |
| **Files to create** | `components/contractor/profile/`, `components/contractor/availability/`, `components/contractor/service-areas/`, `services/contractor-profile.service.ts`, `services/availability.service.ts`, `services/service-area.service.ts` |
| **UI** | Profile form, weekly schedule grid, zip code chip list |
| **Backend deps** | ✅ All endpoints exist |
| **Tests** | Profile save, availability CRUD, service area add/remove |
| **DoD** | Contractor can complete full profile setup |
| **Stop** | Profile setup works end-to-end. |

---

#### F8 — Appointments (Customer + Contractor)

| Field | Value |
|-------|-------|
| **Goal** | Both roles view and manage appointments |
| **Inputs** | `GET /appointments/my-appointments`, `PATCH /appointments/{id}/status`, `POST /appointments/service-request/{id}` |
| **Files to create** | `components/customer/appointments/`, `components/contractor/appointments/`, `services/appointment.service.ts` |
| **UI** | Appointment lists, status management (contractor), read-only (customer) |
| **Backend deps** | ✅ All endpoints exist |
| **Tests** | List loads, status update, contractor create appointment |
| **DoD** | Appointments visible to both roles, contractor can update status |
| **Stop** | Appointment management works. |

---

#### F9 — Reviews

| Field | Value |
|-------|-------|
| **Goal** | Customer submits reviews, contractor views them |
| **Inputs** | `POST /reviews/service-request/{id}`, `GET /reviews/contractor/{id}`, `GET /reviews/my-reviews` |
| **Files to create** | `components/customer/review-form/`, `components/contractor/reviews/`, `services/review.service.ts` |
| **UI** | 5-axis star rating form, review cards with breakdown |
| **Backend deps** | ✅ All endpoints exist |
| **Tests** | Review submission, review display, rating calculation |
| **DoD** | Customer can submit review, contractor sees reviews with ratings |
| **Stop** | Review flow works end-to-end. |

---

#### F10 — Public Contractor Profile

| Field | Value |
|-------|-------|
| **Goal** | Homeowners view contractor profile without login |
| **Inputs** | `GET /contractor-profile/{id}`, `GET /reviews/contractor/{id}` |
| **Files to create** | `components/public/contractor-profile/` |
| **UI** | Business info, rating, reviews, specialties, service areas |
| **Backend deps** | ✅ Endpoints exist |
| **Tests** | Profile loads, reviews display, 404 for missing contractor |
| **DoD** | Public profile accessible without auth |
| **Stop** | Public profile works. |

---

#### F11 — Admin Dashboard + Management

| Field | Value |
|-------|-------|
| **Goal** | Admin manages users, contractors, and requests |
| **Inputs** | `GET /users`, `GET /service-requests`, `PUT /users/{id}`, `PUT /service-requests/{id}` |
| **Files to create** | `components/admin/dashboard/`, `components/admin/users/`, `components/admin/contractors/`, `components/admin/requests/`, `services/user.service.ts` |
| **UI** | Stats dashboard, data tables with actions |
| **Backend deps** | ✅ All endpoints exist |
| **Tests** | Dashboard stats, user list, contractor list, request list, status override |
| **DoD** | Admin can manage all platform resources |
| **Stop** | Admin management works. |

---

#### F12 — Landing Page

| Field | Value |
|-------|-------|
| **Goal** | HVAC-branded public landing page |
| **Inputs** | Static content |
| **Files to modify** | `components/home/` (full rewrite) |
| **UI** | Hero, how-it-works, stats, featured contractors, testimonials, CTA |
| **Backend deps** | None (static for demo) |
| **Tests** | Page renders, responsive, links work |
| **DoD** | Landing page is HVAC-branded and professional |
| **Stop** | Landing page looks production-ready. |

---

#### F13 — Legacy Cleanup + QA + Responsive + Accessibility

| Field | Value |
|-------|-------|
| **Goal** | Remove legacy code, polish responsive, accessibility pass |
| **Inputs** | All previous slices complete |
| **Files** | Delete legacy components, fix responsive issues, add ARIA |
| **UI** | Visual polish pass |
| **Backend deps** | None |
| **Tests** | Full build, full test suite, manual responsive testing |
| **DoD** | Clean codebase, no legacy, responsive on all breakpoints, accessible |
| **Stop** | Demo-ready release. |

---

## AD. NEXT MICRO SLICE — F1: Core Layout Shell

### Why F1

Every subsequent slice depends on having:
- A role-aware layout that wraps all protected pages
- A navigation bar that shows the correct menu items per role
- Protected route groups that redirect unauthorized users
- A consistent `<router-outlet>` structure

Without F1, no dashboard, no profile page, no lead management can be built in a reusable way.

### Scope

**CREATE:**
1. `layouts/customer-layout/` — top bar + `<router-outlet>` for `/customer/*`
2. `layouts/contractor-layout/` — top bar + `<router-outlet>` for `/contractor/*`
3. `layouts/admin-layout/` — top bar + `<router-outlet>` for `/admin/*`
4. `components/top-bar/` — shared role-aware navigation component
5. Child route modules: `customer.routes.ts`, `contractor.routes.ts`, `admin.routes.ts`

**MODIFY:**
1. `app-routing.module.ts` — add role route groups with layout components
2. `app.module.ts` — declare new layout and top-bar components
3. `nav.component` — full rewrite to become the top bar (or create new `top-bar` component and deprecate `nav`)

**DO NOT TOUCH:**
- `log-in.component` ✅
- `register.component` ✅
- `register-contractor.component` ✅
- `core/services/auth.service.ts` ✅
- `core/guards/*` ✅
- `core/interceptors/*` ✅
- `shared/*` ✅
- `styles.css` / `theme.scss` ✅
- Any backend files
- Any business logic components

### Routes

```ts
const routes: Routes = [
  // Public
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LogInComponent, canActivate: [PublicGuard] },
  { path: 'register/customer', component: RegisterComponent, canActivate: [PublicGuard] },
  { path: 'register/contractor', component: RegisterContractorComponent, canActivate: [PublicGuard] },

  // Customer (guarded)
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { role: 'CUSTOMER' },
    children: [
      { path: 'dashboard', component: CustomerDashboardPlaceholderComponent },
      // Future slices add children here
    ]
  },

  // Contractor (guarded)
  {
    path: 'contractor',
    component: ContractorLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { role: 'CONTRACTOR' },
    children: [
      { path: 'dashboard', component: ContractorDashboardPlaceholderComponent },
    ]
  },

  // Admin (guarded)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', component: AdminDashboardPlaceholderComponent },
    ]
  },

  // Wildcard
  { path: '**', redirectTo: 'home' }
];
```

### Guards

- `AuthGuard` — already exists, redirects to `/login` if not authenticated
- `RoleGuard` — already exists, redirects to role dashboard if wrong role
- `data: { role: 'CUSTOMER' }` on each layout group

### UI Structure

```
┌─────────────────────────────────────────────────────┐
│  TopBarComponent                                    │
│  [Logo]  [Nav Links based on role]  [Profile ▼]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  <router-outlet>                                    │
│  (placeholder dashboard for F1)                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**TopBar nav items per role:**

| CUSTOMER | CONTRACTOR | ADMIN |
|----------|-----------|-------|
| Dashboard | Dashboard | Dashboard |
| My Requests | Leads | Users |
| Appointments | Appointments | Contractors |
| Profile | Portfolio | Requests |
| | Profile | |
| | Availability | |
| | Service Areas | |
| | Reviews | |

### Placeholder Components

For F1, dashboard screens are placeholders only:
```html
<div class="ch-container" style="padding-top: var(--ch-space-8);">
  <h1 class="ch-page-header">Dashboard</h1>
  <div class="ch-card">
    <p>Dashboard content coming in F2/F5/F11.</p>
  </div>
</div>
```

### Tests

1. Navigate to `/login` while authenticated → redirected to role dashboard
2. Navigate to `/customer/dashboard` while logged out → redirected to `/login`
3. Navigate to `/customer/dashboard` as CONTRACTOR → redirected to `/contractor/dashboard`
4. Navigate to `/contractor/dashboard` as CUSTOMER → redirected to `/customer/dashboard`
5. Navigate to `/admin/dashboard` as CUSTOMER → redirected to `/customer/dashboard`
6. Top bar shows correct nav items for each role
7. Logout button clears token and redirects to `/login`
8. Mobile: hamburger menu opens/closes
9. Build passes with no errors

### Code Review Checklist

- [ ] No `alert()` anywhere
- [ ] No `localStorage` in components (only in AuthService)
- [ ] All new components use OnPush or explicit change detection
- [ ] All subscriptions managed (no leaks)
- [ ] CSS uses design tokens (no hardcoded colors)
- [ ] Responsive at 640px, 1024px breakpoints
- [ ] ARIA labels on interactive elements
- [ ] French strings removed
- [ ] No legacy component references remain

### Stop Condition

**STOP when:**
- All three layouts render correctly
- Navigation works for all three roles
- Login → correct dashboard redirect works
- Unauthorized access redirects to login
- Build passes clean
- No business logic implemented (dashboards are placeholders)

**DO NOT continue to F2 until explicitly prompted.**

---

*End of Final Product / UX Master Plan*
