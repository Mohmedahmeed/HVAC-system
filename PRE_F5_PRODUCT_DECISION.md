# PRE-F5 PRODUCT DECISION

## 1. Executive Summary

After completing slices A through F4, the application has a functional customer request flow and a functional contractor lead/appointment flow. The next slice should maximize the combination of real product value, demo value, UX coherence, and architectural readiness.

**Recommended next slice: F5 — Contractor Profile + Availability + Service Areas**

This is the highest-value next slice because:
- Backend is 100% ready (full CRUD for profile, availability, service areas)
- The contractor sidebar already has these items marked "Soon"
- Profile data is already seeded in the demo database
- A demo to HVAC companies requires showing a professional, customizable contractor identity
- This completes the contractor onboarding experience (register → fill profile → receive leads)
- It unlocks the public contractor profile view (future slice) which is the customer-facing trust layer

## 2. Current Project Checkpoint

### Completed Slices
| Slice | Description | Status |
|-------|-------------|--------|
| A | Design System (40+ tokens, Material theme, Inter font) | ✅ |
| B | Auth Infrastructure (JWT, AuthGuard, RoleGuard, PublicGuard) | ✅ |
| C | Login Page | ✅ |
| D | Customer Registration | ✅ |
| E | Contractor Registration | ✅ |
| F1 | Core Application Layout Shell | ✅ |
| F2 | Customer Dashboard | ✅ |
| F3 | Customer Service Request Form | ✅ |
| F4 | Contractor Dashboard + Lead Management | ✅ |

### Total Component Count
- **Frontend components:** 16 (4 contractor, 2 customer, 3 layouts, 3 auth, 1 top-bar, 5 shared)
- **Backend controllers:** 11
- **Backend entities:** 10
- **Backend services:** 14
- **Backend repositories:** 9

## 3. Customer Experience Status

### What Works
| Screen | Route | Status |
|--------|-------|--------|
| Dashboard | `/customer/dashboard` | ✅ KPIs, request list, appointment list |
| New Request | `/customer/request/new` | ✅ 4-step stepper, POST to backend |
| Success Screen | (inline in new-request) | ✅ |

### What's Missing (from Master Plan)
| Screen | Route | Backend Ready? |
|--------|-------|----------------|
| Request Detail | `/customer/request/:id` | ✅ `GET /service-requests/{id}` |
| My Requests | `/customer/requests` | ✅ `GET /service-requests/my-requests` |
| Appointments | `/customer/appointments` | ✅ `GET /appointments/my-appointments` |
| Profile Edit | `/customer/profile` | ❌ No `PUT /users/me` endpoint |
| Review Form | `/customer/review/:contractorId` | ✅ `POST /reviews/service-request/{id}` |

### Customer Journey Gap Analysis
After submitting a service request, the customer sees a success screen with only "Go to Dashboard." They cannot:
- View the request they just submitted
- See which contractors have been matched
- Track the request status over time
- Cancel a NEW request
- View their appointment details
- Leave a review after a completed job

**Severity: HIGH** — The customer cannot track what they submitted. This is the most critical customer-facing gap.

## 4. Contractor Experience Status

### What Works
| Screen | Route | Status |
|--------|-------|--------|
| Dashboard | `/contractor/dashboard` | ✅ KPIs, recent leads, upcoming appointments |
| Lead Inbox | `/contractor/leads` | ✅ Filterable list with status tabs |
| Lead Detail | `/contractor/leads/:id` | ✅ Full detail, accept/reject actions |
| Appointments | `/contractor/appointments` | ✅ List with mark-complete |

### What's Missing (from Master Plan)
| Screen | Route | Backend Ready? |
|--------|-------|----------------|
| Profile Edit | `/contractor/profile` | ✅ `GET/PUT /contractor-profile/me` |
| Service Areas | `/contractor/service-areas` | ✅ `GET/POST/DELETE /service-areas` |
| Availability | `/contractor/availability` | ✅ `GET/POST/PUT/DELETE /availability` |
| Portfolio | `/contractor/portfolio` | ❌ No backend entity or API |
| Reviews | `/contractor/reviews` | ✅ `GET /reviews/my-reviews` |

### Contractor Journey Gap Analysis
The contractor can receive and respond to leads, but has no way to:
- Edit their business profile (name, description, license, specialties, rate)
- Set their service area ZIP codes
- Define their weekly availability schedule
- Showcase completed work (portfolio)
- View their own reviews

**Severity: MEDIUM-HIGH** — The contractor experience is functional but feels incomplete. A demo to HVAC companies requires showing a professional, customizable profile.

## 5. Admin Experience Status

### What Works
| Screen | Route | Status |
|--------|-------|--------|
| Dashboard | `/admin/dashboard` | ❌ Placeholder only |

### What's Missing
| Screen | Route | Backend Ready? |
|--------|-------|----------------|
| Dashboard | `/admin/dashboard` | ✅ Can aggregate from existing endpoints |
| User Management | `/admin/users` | ✅ `GET/PUT/DELETE /users` |
| Contractor Verification | `/admin/contractors` | ✅ `GET /users` (filter by role) |
| All Requests | `/admin/requests` | ✅ `GET /service-requests` |

### Admin Journey Gap Analysis
Admin has zero functional pages. However, the admin experience is less critical for the HVAC company demo than the customer/contractor experience.

**Severity: LOW-MEDIUM** — Important for completeness but not blocking the demo.

## 6. Backend Capability Matrix

| Capability | Entity | Controller | Service | Repository | Frontend Uses? |
|------------|--------|------------|---------|------------|----------------|
| Auth | User | ✅ | ✅ | ✅ | ✅ |
| Service Requests | ServiceRequest | ✅ | ✅ | ✅ | ✅ (create, list) |
| Leads | LeadAssignment | ✅ | ✅ | ✅ | ✅ (list, detail, accept, reject) |
| Appointments | Appointment | ✅ | ✅ | ✅ | ✅ (list, complete) |
| Contractor Profile | ContractorProfile | ✅ | ✅ | ✅ | ❌ READ ONLY |
| Service Areas | ServiceArea | ✅ | ✅ | ✅ | ❌ NOT USED |
| Availability | Availability | ✅ | ✅ | ✅ | ❌ NOT USED |
| Reviews | Review | ✅ | ✅ | ✅ | ❌ NOT USED |
| User Admin | User | ✅ | ✅ | ✅ | ❌ NOT USED |

## 7. Frontend Capability Matrix

| Feature | Components | Service | Model | Routing | Status |
|---------|------------|---------|-------|---------|--------|
| Auth Flow | 3 | AuthService | ✅ | ✅ | Complete |
| Customer Dashboard | 1 | CustomerDataService | ✅ | ✅ | Complete |
| Customer Request | 1 | CustomerDataService | ✅ | ✅ | Complete |
| Contractor Dashboard | 1 | ContractorDataService | ✅ | ✅ | Complete |
| Contractor Leads | 2 | ContractorDataService | ✅ | ✅ | Complete |
| Contractor Appointments | 1 | ContractorDataService | ✅ | ✅ | Complete |
| Contractor Profile | 0 | — | ❌ | ❌ | Not started |
| Service Areas | 0 | — | ❌ | ❌ | Not started |
| Availability | 0 | — | ❌ | ❌ | Not started |
| Customer Request Detail | 0 | — | ❌ | ❌ | Not started |
| Customer Appointments | 0 | — | ❌ | ❌ | Not started |
| Reviews | 0 | — | ❌ | ❌ | Not started |
| Portfolio | 0 | — | ❌ | ❌ | Not started (no backend) |
| Admin Dashboard | 0 | — | ❌ | ❌ | Not started |

## 8. Current End-to-End Business Flow

```
CUSTOMER                          BACKEND                        CONTRACTOR
    │                                │                                │
    ├─ Login ────────────────────────►│                                │
    │                                │                                │
    ├─ Create Service Request ───────►│ ServiceRequest (NEW)           │
    │                                │                                │
    │                                ├─ LeadAssignment (SENT) ────────►│
    │                                │                                │
    │                                │◄── Accept Lead ────────────────┤
    │                                │ LeadAssignment (ACCEPTED)       │
    │                                │                                │
    │                                │◄── Create Appointment ─────────┤
    │                                │ Appointment (SCHEDULED)         │
    │                                │ ServiceRequest (SCHEDULED)      │
    │                                │                                │
    │                                │◄── Mark Complete ──────────────┤
    │                                │ Appointment (COMPLETED)         │
    │                                │ ServiceRequest (COMPLETED)      │
    │                                │                                │
    │ ◄── View Appointments ─────────│                                │
    │                                │                                │
    │ ◄── [CANNOT view request       │                                │
    │      detail or track status]   │                                │
    │                                │                                │
    │ ◄── [CANNOT leave review]      │                                │
```

**Flow gap:** The customer has no visibility into what happens after they submit a request. The contractor does all the work, but the customer cannot see it.

## 9. Product Gaps

### Critical Gaps
1. **Customer cannot view request detail** — After submitting, the customer has no way to track their request
2. **Contractor has no profile editor** — Cannot customize business identity
3. **No service area management** — Contractor cannot define coverage ZIPs
4. **No availability management** — Contractor cannot set working hours
5. **No review system on frontend** — Backend works, no UI
6. **No admin dashboard** — Admin has zero functional pages

### Important Gaps
7. **No portfolio system** — No backend entity, no frontend UI
8. **No public contractor profile** — Customers cannot browse contractors
9. **No customer profile editor** — No `PUT /users/me` endpoint
10. **No appointment creation UI** — Contractor can complete but not create appointments
11. **No auto-matching** — Leads must be seeded manually

### Minor Gaps
12. **No customer "My Requests" list page** — Dashboard shows recent 5 only
13. **No customer "My Appointments" list page** — Dashboard shows upcoming only
14. **No NO_SHOW badge** — Missing from badge component STATUS_LABELS

## 10. Portfolio / Before-After Deep Analysis

### Backend Support
**No backend support exists.** There is no `Portfolio` entity, no `PortfolioController`, no `PortfolioService`, no `PortfolioRepository`. The demo seeder does not create any portfolio data.

### What Would Be Needed

#### New Entity: `PortfolioProject`
```java
@Entity
public class PortfolioProject {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne
    private User contractor;
    
    private String title;
    private String serviceType;
    private String problemDescription;
    private String solutionDescription;
    private String propertyType;
    private Integer squareFootage;
    private String zipCode;
    
    // Photo storage
    private String beforePhotoUrl;
    private String afterPhotoUrl;
    
    // Connection to completed work
    @OneToOne
    private ServiceRequest serviceRequest;
    
    @OneToOne
    private Review review;
    
    private LocalDateTime createdAt;
}
```

#### New Controller Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/portfolio` | CONTRACTOR | Create project |
| GET | `/portfolio/my-projects` | CONTRACTOR | List own projects |
| GET | `/portfolio/contractor/{id}` | Public | View contractor portfolio |
| PUT | `/portfolio/{id}` | CONTRACTOR | Edit project |
| DELETE | `/portfolio/{id}` | CONTRACTOR | Delete project |

#### Photo Storage Options
1. **URL-based (recommended for demo):** Store external image URLs. Simple, no file upload needed. Can use placeholder images.
2. **Base64 in DB:** Store encoded images directly. Works for demo but bad for production.
3. **File upload to server:** Requires Spring multipart config, storage directory, serving endpoint. Most realistic but highest complexity.

**Recommendation:** Use URL-based storage for the demo. Create a few placeholder portfolio projects in the seeder with before/after image URLs from a free image service.

### Frontend Screens Needed
1. **Portfolio List** (`/contractor/portfolio`) — Grid of project cards
2. **Portfolio Form** (`/contractor/portfolio/new`) — Create/edit project
3. **Portfolio Detail** (`/contractor/portfolio/:id`) — View project with before/after slider
4. **Public Portfolio** (on public contractor profile) — Read-only view

### Portfolio ↔ Contractor Profile Connection
- Portfolio projects are linked to contractor via `User contractor` field
- Public contractor profile would show portfolio as a section
- Portfolio items can optionally link to completed `ServiceRequest` and `Review`

### Complexity Assessment
- **Backend:** Medium — New entity, controller, service, repository, seeder updates
- **Frontend:** High — 3-4 new components, photo display logic, grid layout, form with image preview
- **No blocking dependencies** — Can be built independently of other features

### Verdict
Portfolio is a valuable feature but requires significant new backend work. It should NOT be the next slice because:
1. It requires creating a new entity, controller, service, repository from scratch
2. It requires photo storage decisions
3. It requires seeder updates
4. The contractor profile (which portfolio connects to) doesn't have a frontend editor yet
5. The demo can function without portfolio — profile + reviews + ratings provide sufficient trust signals

## 11. Contractor Profile Analysis

### Backend Status: FULLY READY

| Endpoint | Method | Auth | Body | Status |
|----------|--------|------|------|--------|
| `/contractor-profile/me` | GET | CONTRACTOR | None | ✅ Working |
| `/contractor-profile/me` | PUT | CONTRACTOR | ContractorProfile JSON | ✅ Working |
| `/contractor-profile/{id}` | GET | Public | None | ✅ Working |

### ContractorProfile Entity Fields
| Field | Type | Required | Seeded? |
|-------|------|----------|---------|
| businessName | String | No | ✅ "Cool Air Solutions" |
| description | TEXT | No | ✅ "Expert AC repair..." |
| licenseNumber | String | No | ✅ "AZ-ROC-123456" |
| insuranceProvider | String | No | ❌ null |
| insuranceExpiry | LocalDate | No | ❌ null |
| specialties | TEXT | No | ✅ "AC Repair,AC Installation,..." |
| baseRate | Double | No | ✅ 85.0 |
| responseTimeHours | Integer | No | ✅ 2 |
| acceptsEmergency | boolean | No | ✅ true |
| logoUrl | String | No | ❌ null |
| averageRating | double | Auto | ✅ 5.0 |
| totalReviews | int | Auto | ✅ 1 |
| isVerified | boolean | No | ✅ true |

### What the Profile Editor Needs
A form with fields for:
- Business Name (text input)
- Description (textarea)
- License Number (text input)
- Specialties (multi-select or tag input from service types)
- Base Rate ($/hr number input)
- Response Time Hours (number input)
- Accepts Emergency (toggle)
- Logo URL (text input for URL, or future file upload)

### Why Profile Should Come First
1. It's the foundation for all other contractor features
2. The backend is 100% ready — zero new backend code needed
3. It's a relatively simple form component
4. It completes the contractor onboarding flow
5. The sidebar already has "Profile" marked "Soon"
6. Profile data is already seeded — the editor will show pre-filled data
7. It's prerequisite for the public contractor profile view
8. It's prerequisite for the portfolio (portfolio connects to profile)

## 12. Customer Request Detail Analysis

### Backend Status: FULLY READY

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/service-requests/{id}` | GET | CUSTOMER (own only) | ✅ Working |
| `/service-requests/my-requests` | GET | CUSTOMER | ✅ Working |
| `/appointments/my-appointments` | GET | CUSTOMER | ✅ Working |

### What Request Detail Needs
A page showing:
- Status timeline (NEW → MATCHED → ACCEPTED → SCHEDULED → COMPLETED)
- Service request details (type, description, urgency, property, zip, address)
- Lead cards showing contractor responses (name, quote, status)
- Appointment info when scheduled
- Cancel button (for NEW status only — backend supports this)

### Why Request Detail Is Important but Should Come After Profile
- It's the most critical customer-facing gap
- However, the contractor profile is prerequisite for a complete demo
- The demo story is: customer submits → contractor sees → contractor responds → customer tracks → customer reviews
- Right now, steps 1-2-3 work, but step 4 (customer tracks) doesn't
- Profile is simpler to implement and unlocks more downstream features

## 13. Appointment Scheduling Analysis

### Backend Status: FULLY READY

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/appointments/service-request/{id}` | POST | CONTRACTOR | ✅ Working |
| `/appointments/my-appointments` | GET | CUSTOMER/CONTRACTOR | ✅ Working |
| `/appointments/{id}` | GET | CUSTOMER/CONTRACTOR | ✅ Working |
| `/appointments/{id}/status` | PATCH | CONTRACTOR | ✅ Working |

### What's Missing
- **Appointment creation UI** — After accepting a lead, the contractor has no way to schedule an appointment from the frontend
- The backend supports `POST /appointments/service-request/{serviceRequestId}` with `{ scheduledStart, scheduledEnd, notes }`

### Why Appointment Scheduling Should Come Later
- The contractor can currently mark appointments as complete
- Appointment creation requires a date/time picker, which is more complex
- The demo data already has seeded appointments
- Profile and request detail are higher priority for the demo

## 14. Review System Analysis

### Backend Status: FULLY READY

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/reviews/service-request/{id}` | POST | CUSTOMER | ✅ Working |
| `/reviews/contractor/{id}` | GET | Any | ✅ Working |
| `/reviews/my-reviews` | GET | CUSTOMER/CONTRACTOR | ✅ Working |

### Review Entity Fields
- overallRating (1-5)
- qualityRating (1-5)
- professionalismRating (1-5)
- punctualityRating (1-5)
- communicationRating (1-5)
- comment (text)

### Why Reviews Should Come Later
- The backend is ready, but the frontend review form requires star rating components
- Reviews are only meaningful after completed jobs
- The demo already has 1 seeded review
- Profile and request detail are higher priority

## 15. Admin Analysis

### Backend Status: MOSTLY READY

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/users` | GET | ADMIN | ✅ Working |
| `/users/{id}` | GET/PUT/DELETE | ADMIN | ✅ Working |
| `/service-requests` | GET | ADMIN | ✅ Working |

### Why Admin Should Come Last
- The demo targets HVAC companies (contractors), not platform admins
- Admin features are important for production but not critical for the demo
- The admin experience is the simplest to implement (mostly tables and lists)

## 16. Candidate Next Slices Comparison

| Criteria | F5A: Contractor Profile | F5B: Portfolio | F5C: Customer Request Detail | F5D: Appointment Scheduling | F5E: Reviews | F5F: Admin |
|----------|------------------------|----------------|------------------------------|----------------------------|--------------|------------|
| **Business Value** | HIGH | HIGH | HIGH | MEDIUM | MEDIUM | LOW-MEDIUM |
| **Demo Value** | HIGH | HIGH | HIGH | MEDIUM | MEDIUM | LOW |
| **UX Importance** | HIGH | MEDIUM | HIGH | MEDIUM | MEDIUM | LOW |
| **Backend Ready** | ✅ 100% | ❌ 0% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 90% |
| **Frontend Complexity** | LOW-MEDIUM | HIGH | MEDIUM | MEDIUM-HIGH | MEDIUM | LOW-MEDIUM |
| **Dependency Risk** | LOW | HIGH (needs profile) | LOW | LOW | LOW | LOW |
| **Product Completeness** | HIGH | MEDIUM | HIGH | MEDIUM | MEDIUM | MEDIUM |

### Detailed Scoring (1-5)

| Slice | Business | Demo | UX | Backend | Complexity | Dependencies | Total |
|-------|----------|------|----|---------|------------|--------------|-------|
| **F5A: Profile** | 5 | 5 | 5 | 5 (easy) | 4 (simple form) | 5 (no deps) | **29** |
| F5B: Portfolio | 5 | 5 | 3 | 1 (new backend) | 2 (complex) | 2 (needs profile) | 18 |
| **F5C: Request Detail** | 5 | 4 | 5 | 5 (easy) | 3 (medium) | 5 (no deps) | **27** |
| F5D: Appointment Scheduling | 3 | 3 | 3 | 5 (easy) | 3 (medium) | 4 (minor) | 21 |
| F5E: Reviews | 3 | 3 | 3 | 5 (easy) | 3 (medium) | 4 (minor) | 21 |
| F5F: Admin | 2 | 2 | 2 | 4 (mostly ready) | 3 (medium) | 5 (no deps) | 18 |

## 17. Dependency Graph

```
                    ┌─────────────────────┐
                    │   Contractor Profile │ ← F5A (RECOMMENDED)
                    │   (Backend Ready)    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐
    │  Service Areas  │ │ Availability │ │   Portfolio  │
    │  (Backend Ready)│ │(Backend Ready)│ │(No Backend)  │
    └────────────────┘ └──────────────┘ └──────────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │ Public Profile   │
                                              │ (Read-only view) │
                                              └─────────────────┘

    ┌──────────────────────┐     ┌──────────────────────┐
    │ Customer Request     │     │  Review System        │
    │ Detail               │     │  (Backend Ready)      │
    │ (Backend Ready)      │     │                       │
    └──────────┬───────────┘     └──────────┬────────────┘
               │                            │
               └────────────┬───────────────┘
                            │
                  ┌─────────▼─────────┐
                  │  Complete Demo     │
                  │  Flow              │
                  └───────────────────┘
```

## 18. Recommended Next Slice

### **F5 — Contractor Profile + Service Areas + Availability**

This is a compound slice that bundles three closely related contractor settings features. They share the same layout (contractor settings section), the same sidebar navigation, and the same form patterns.

### Why This Compound Slice
1. All three features use the same contractor settings layout pattern
2. All three have fully ready backend endpoints
3. All three are marked "Soon" in the contractor sidebar
4. Together they complete the contractor onboarding experience
5. They're simpler individually but more impactful together
6. The sidebar navigation update is shared work

## 19. Why This Slice Should Come Next

### Reason 1: Backend Is 100% Ready
Zero new backend code needed. All three features have working controllers, services, and repositories. The seeder already creates profile, availability, and service area data for all 5 contractors.

### Reason 2: Contractor Onboarding Flow
The natural contractor journey is:
1. Register (✅ F4 complete)
2. Fill profile (← F5)
3. Set service areas (← F5)
4. Set availability (← F5)
5. Start receiving leads (✅ F4 complete)

Without F5, the contractor experience feels hollow — they can respond to leads but have no professional identity.

### Reason 3: Demo Value
When demoing to HVAC companies, the first thing they'll ask is "Can I customize my profile?" and "Can I set my service area?" These are the most natural questions for a business owner evaluating a platform.

### Reason 4: Unlocks Future Features
- Public contractor profile (requires profile data to display)
- Portfolio (connects to profile)
- Customer browsing contractors (requires profile + service areas)
- Auto-matching (requires service areas)

### Reason 5: Architecture Readiness
The contractor layout already has a settings section in the sidebar. Adding three settings pages follows the established pattern perfectly.

## 20. Exact Scope

### F5A: Contractor Profile Editor
**Route:** `/contractor/profile`

**Component:** `ContractorProfileComponent`

**Form Fields:**
- Business Name (text input, required)
- Description (textarea, max 500 chars)
- License Number (text input)
- Specialties (multi-select checkboxes from predefined service types)
- Base Rate ($/hr, number input)
- Response Time Hours (number input, 1-72)
- Accepts Emergency (mat-slide-toggle)
- Logo URL (text input, optional)

**Data Flow:**
1. `ngOnInit`: `GET /contractor-profile/me` → populate form
2. On save: `PUT /contractor-profile/me` → success feedback
3. Show loading skeleton while fetching
4. Show success banner after save
5. Show error alert on failure

**Design:**
- Single column form, max-width 700px
- Card-based layout with sections
- "Business Information" section
- "Services & Pricing" section
- "Emergency Availability" section
- Save button at bottom

### F5B: Service Areas Manager
**Route:** `/contractor/service-areas`

**Component:** `ServiceAreasComponent`

**Features:**
- List of current service areas (ZIP codes with city/state)
- Add new ZIP code (text input with validation)
- Remove ZIP code (with confirmation dialog)
- Display as chip/tag list

**Data Flow:**
1. `ngOnInit`: `GET /service-areas/my-areas` → populate list
2. Add: `POST /service-areas` with `{ zipCode, city, state }` → refresh list
3. Remove: `DELETE /service-areas/{id}` → refresh list

**Design:**
- Header with "Add ZIP Code" input + button
- Card showing current areas as mat-chip-list
- Each chip has delete icon
- Empty state: "No service areas defined"

### F5C: Availability Manager
**Route:** `/contractor/availability`

**Component:** `AvailabilityComponent`

**Features:**
- Weekly schedule display (Mon-Fri)
- Each day shows start time, end time, emergency toggle
- Edit mode for each day
- Save individual day or all at once

**Data Flow:**
1. `ngOnInit`: `GET /availability/my-availability` → populate schedule
2. Update: `PUT /availability/{id}` with updated times
3. Create: `POST /availability` for new day entries
4. Delete: `DELETE /availability/{id}` to remove

**Design:**
- 5-row table (Mon-Fri)
- Each row: Day name, Start time (time picker), End time (time picker), Emergency toggle, Actions
- Save All button
- Empty state: "No availability set"

### Shared Work
- Update contractor sidebar: Enable Profile, Service Areas, Availability links
- Add route configuration for all 3 new routes
- Add components to app.module.ts declarations
- Add methods to ContractorDataService

## 21. Out of Scope

The following are explicitly excluded from F5:

- Portfolio / Before-After photos (requires new backend entity)
- Customer Request Detail (separate slice)
- Customer Appointments page (separate slice)
- Review form (separate slice)
- Admin dashboard (separate slice)
- Public contractor profile view (separate slice)
- Appointment creation UI (separate slice)
- Auto-matching backend logic
- File upload / image storage
- Customer profile editor (no backend `PUT /users/me`)
- Any backend changes

## 22. Estimated Implementation Complexity

| Sub-slice | Frontend Files | Complexity | Estimated Time |
|-----------|----------------|------------|----------------|
| Contractor Profile Editor | 1 component (3 files) + service method | Low-Medium | Small |
| Service Areas Manager | 1 component (3 files) + service method | Low | Small |
| Availability Manager | 1 component (3 files) + service method | Medium | Medium |
| Shared (sidebar, routing, module) | 3 files modified | Low | Small |
| **Total** | **12 new files + 3 modified** | **Medium** | **Medium** |

### Angular Material Modules Needed
- `MatSlideToggleModule` — for emergency toggle (may need adding to AngularMaterialModule)
- `MatChipsModule` — for service area chips (already imported)
- `MatTableModule` — for availability table (already imported)
- `MatTimepickerModule` or native `<input type="time">` — for time selection

## 23. Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| `PUT /contractor-profile/me` rejects partial updates | Low | Medium | Service already handles null checks for each field |
| Availability time picker complexity | Low | Low | Use native `<input type="time">` instead of Material timepicker |
| Service area ZIP validation conflicts | Low | Low | Backend already validates 5-digit ZIP format |
| Profile entity lazy loading issues | Low | Medium | Already has `@JsonIgnoreProperties` for hibernate proxies |

## 24. UX Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Profile form too long | Low | Low | Use sections with clear visual hierarchy |
| Availability editor confusing | Medium | Medium | Use clear day-by-day layout with familiar time inputs |
| Service area removal accidental | Low | Low | Confirmation dialog before delete |
| No unsaved changes warning | Medium | Low | Can add later; not critical for demo |

## 25. Testing Requirements

| Test | Description | Priority |
|------|-------------|----------|
| T1: Profile load | GET /contractor-profile/me returns data | HIGH |
| T2: Profile save | PUT /contractor-profile/me updates fields | HIGH |
| T3: Service areas load | GET /service-areas/my-areas returns list | HIGH |
| T4: Service area add | POST /service-areas creates new area | HIGH |
| T5: Service area delete | DELETE /service-areas/{id} removes area | HIGH |
| T6: Availability load | GET /availability/my-availability returns list | HIGH |
| T7: Availability update | PUT /availability/{id} updates times | HIGH |
| T8: Unauthorized access | Customer cannot access contractor profile endpoints | HIGH |
| T9: Routing | All 3 routes protected by AuthGuard+RoleGuard | HIGH |
| T10: Build success | `npx ng build --configuration development` passes | HIGH |
| T11: Sidebar navigation | All 3 links work and highlight correctly | MEDIUM |
| T12: Empty states | Proper empty states when no data | MEDIUM |
| T13: Loading states | Skeleton loaders during data fetch | MEDIUM |
| T14: Responsive | Forms work on mobile | MEDIUM |

## 26. Roadmap After Recommended Slice

### After F5 (Profile + Service Areas + Availability)

| Slice | Description | Backend Ready? | Priority |
|-------|-------------|----------------|----------|
| F6 | Customer Request Detail + Cancel | ✅ | HIGH |
| F7 | Customer Appointments + Review Form | ✅ | HIGH |
| F8 | Contractor Appointment Creation | ✅ | MEDIUM |
| F9 | Admin Dashboard + User Management | ✅ | MEDIUM |
| F10 | Contractor Reviews View | ✅ | MEDIUM |
| F11 | Public Contractor Profile | ✅ | MEDIUM |
| F12 | Portfolio (requires new backend) | ❌ | MEDIUM |
| F13 | Customer Profile Editor | ❌ (needs endpoint) | LOW |
| F14 | Auto-matching Backend | ❌ | LOW |
| F15 | Landing Page Rewrite | N/A | LOW |

### Long-Term Portfolio Path
After F5, the portfolio can be built as a later slice:
1. F5 establishes the profile foundation
2. F12 adds the Portfolio entity and API
3. F12 adds portfolio list, form, and detail components
4. F11 (Public Profile) displays portfolio as a section

## 27. Master Project Checkpoint

### Application State Summary
- **Total frontend components:** 16 → will be 19 after F5
- **Total backend controllers:** 11 (unchanged)
- **Total routes:** 10 → will be 13 after F5
- **Completed business flows:** Customer request creation, Contractor lead management, Contractor appointment completion
- **Business flows after F5:** Above + Contractor profile management, Service area management, Availability management

### Git State
- Branch: `main`
- Last commit: F4 implementation
- Remote: `https://github.com/Mohmedahmeed/HVAC-system.git`

### Demo Readiness
| Scenario | Before F5 | After F5 |
|----------|-----------|----------|
| Customer submits request | ✅ | ✅ |
| Contractor views leads | ✅ | ✅ |
| Contractor accepts lead | ✅ | ✅ |
| Contractor completes job | ✅ | ✅ |
| Contractor edits profile | ❌ | ✅ |
| Contractor sets service area | ❌ | ✅ |
| Contractor sets availability | ❌ | ✅ |
| Customer tracks request | ❌ | ❌ |
| Customer leaves review | ❌ | ❌ |
| Admin manages users | ❌ | ❌ |
| Portfolio display | ❌ | ❌ |

---

*Report generated: August 27, 2026*
*Analysis based on: Direct source code inspection of all 11 controllers, 10 entities, 14 services, 9 repositories, all frontend components, routing, models, design system, and master plan documentation.*
