# PRE-F5 IMPLEMENTATION PLAN

## 1. Executive Summary

F5 will add three contractor settings features — Profile Editor, Service Areas Manager, and Availability Manager — to the existing contractor layout. All three have fully working backend endpoints with no backend changes required. The frontend needs 9 new files (3 components × 3 files each), 1 new model file, and modifications to 4 existing files (contractor-data.service.ts, contractor-layout.component.ts, angular-material.module.ts, app.module.ts).

**Key finding from audit:** The backend `updateAvailability` method has a bug — it can only set `emergencyAvailable` to `true`, never back to `false`. This must be fixed before F5 implementation (1-line backend change).

**Architecture decision:** F5 uses **separate pages** (not tabs) because:
- Matches existing contractor layout pattern (each route = full page in sidebar)
- Simpler to implement and maintain
- Better mobile experience (no nested scrolling)
- Future-proof for portfolio integration

**Total estimated scope:** 10 new files, 5 modified files, 1 backend fix.

## 2. Current Project Checkpoint

### Files Verified (from direct source code inspection)

**Frontend — Contractor Components (all exist and work):**
- `contractor-layout.component.ts` (64 lines) — sidebar with `navItems` (Dashboard, Leads, Appointments, Portfolio-Soon, Reviews-Soon) + `settingsItems` (Profile-Soon, Service Areas-Soon, Availability-Soon)
- `contractor-layout.component.html` (130 lines) — mobile overlay sidenav + desktop persistent sidenav, both render settings section with disabled badge
- `contractor-layout.component.css` (119 lines) — `ch-layout__sidenav-link--disabled` with opacity: 0.5
- `contractor-dashboard.component.ts` (157 lines) — forkJoin loading, KPI computed getters, recentLeads, upcomingAppointments
- `contractor-dashboard.component.html` (222 lines) — loading/error/success states, 4 KPI cards, lead list, appointment list
- `contractor-dashboard.component.css` (347 lines) — responsive grid, `ch-dashboard__*` naming convention
- `lead-inbox.component.ts/html` — filterable list with mat-tabs
- `lead-detail.component.ts/html` — two-column, accept/reject with ConfirmDialog
- `appointment-list.component.ts/html` — three sections (Upcoming/Completed/Other)

**Frontend — Services:**
- `contractor-data.service.ts` (45 lines) — 6 methods: `getMyLeads`, `getLead`, `acceptLead`, `rejectLead`, `getMyAppointments`, `updateAppointmentStatus`, `getMyProfile` (returns `any`)
- `customer-data.service.ts` (40 lines) — 4 methods

**Frontend — Models:**
- `user.model.ts` (28 lines) — `User`, `MeResponse`, `ROLE_DASHBOARDS`
- `lead-assignment.model.ts` (14 lines) — `LeadAssignment`
- `service-request.model.ts` (27 lines) — `ServiceRequest`, `ServiceRequestUser`
- `appointment.model.ts` (13 lines) — `Appointment`
- **MISSING:** No `ContractorProfile`, `ServiceArea`, or `Availability` frontend models

**Frontend — Routing:**
- `app-routing.module.ts` (83 lines) — contractor children: dashboard, leads, leads/:id, appointments. No profile/service-areas/availability routes.

**Frontend — Module:**
- `app.module.ts` (96 lines) — 4 contractor components declared. Legacy NavComponent, FooterComponent, ProfileComponent still present.
- `angular-material.module.ts` (83 lines) — `MatSlideToggleModule` is NOT imported. All other needed modules (MatChipsModule, MatTableModule, MatSelectModule, etc.) ARE imported.

**Frontend — Shared:**
- `shared.module.ts` (46 lines) — BadgeComponent, EmptyStateComponent, SkeletonComponent, AlertComponent, ConfirmDialogComponent. Exports CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule.
- `badge.component.ts` — STATUS_LABELS map (no NO_SHOW yet)
- `empty-state.component.ts` — icon, message, actionText, actionClick
- `skeleton.component.ts` — variant: card | text | list | avatar
- `alert.component.ts` — type: success | error | warning | info
- `confirm-dialog.component.ts` — title, message, confirmText, type, showReasonInput

**Frontend — Design System:**
- `styles.css` (132 lines) — 40+ CSS tokens, `.ch-container`, `.ch-card`, `.ch-page-header` utility classes

### Backend Verified (from direct source code inspection)

**Entities:**
- `ContractorProfile.java` (50 lines) — `@Id userId` (OneToOne with User via @MapsId), 13 fields
- `ServiceArea.java` (25 lines) — `@Id auto`, contractor (ManyToOne LAZY), zipCode, city, state
- `Availability.java` (34 lines) — `@Id auto`, contractor (ManyToOne LAZY), dayOfWeek (DayOfWeek enum), startTime (LocalTime), endTime (LocalTime), isEmergencyAvailable
- `User.java` (121 lines) — implements UserDetails, has contractorProfile relationship

**Controllers (all at `/api/v1` prefix):**
- `ContractorProfileController` — `GET /me` (CONTRACTOR), `PUT /me` (CONTRACTOR), `GET /{id}` (public)
- `ServiceAreaController` — `POST /` (CONTRACTOR), `GET /my-areas` (CONTRACTOR), `DELETE /{id}` (CONTRACTOR), `GET /zip/{zipCode}` (public)
- `AvailabilityController` — `POST /` (CONTRACTOR), `GET /my-availability` (CONTRACTOR), `PUT /{id}` (CONTRACTOR), `DELETE /{id}` (CONTRACTOR)

**Services:**
- `ContractorProfileService` — partial update (null-checks each field, never clears to null)
- `ServiceAreaService` — validates 5-digit ZIP regex, sets contractor from auth context
- `AvailabilityService` — **BUG:** line 68-69 `if (availabilityDetails.isEmergencyAvailable()) availability.setEmergencyAvailable(true)` — can only toggle ON, never OFF

**Repositories:**
- `ContractorProfileRepository` — `findByUserId(Long userId)`
- `ServiceAreaRepository` — `findByContractorId(Long contractorId)`, `findByZipCode(String zipCode)`
- `AvailabilityRepository` — `findByContractorId(Long contractorId)`, `findByContractorIdAndIsEmergencyAvailableTrue(Long contractorId)`

**Security:**
- `SecurityConfig.java` (81 lines) — `/api/v1/contractor-profile/**` is permitAll, `/api/v1/service-areas/zip/**` is permitAll, everything else `/api/v1/**` requires auth
- All F5 endpoints have `@PreAuthorize("hasRole('CONTRACTOR')")` except public GET endpoints
- Backend ownership enforcement: ServiceAreaService.deleteServiceArea checks `contractor.getId().equals(currentUser.getId())`; AvailabilityService.updateAvailability and deleteAvailability do the same

**Seeder:**
- `DemoDataSeeder.java` (320 lines) — creates 5 contractors, each with profile (businessName, description, licenseNumber, specialties as comma-separated string, baseRate, responseTimeHours, acceptsEmergency), 6 service areas per contractor (Phoenix ZIPs), 5 days availability per contractor (Mon-Fri 8:00-18:00)

**Error handling:**
- `GlobalExceptionHandler.java` — maps ResourceNotFoundException → 404, UnauthorizedException → 403, IllegalArgumentException → 400. Response body: `{timestamp, status, error, message}`

## 3. Backend Contract Audit

### 3.1 ContractorProfile Endpoints

#### GET /contractor-profile/me
- **Auth:** `@PreAuthorize("hasRole('CONTRACTOR')")` + SecurityConfig permitAll on `/contractor-profile/**`
- **Request body:** None
- **Response:** `ContractorProfile` JSON (200)
- **Error:** 404 "Contractor profile not found" if no profile exists for the authenticated user
- **Response fields:**
  ```
  userId: number (same as user.id)
  businessName: string | null
  description: string | null
  licenseNumber: string | null
  insuranceProvider: string | null
  insuranceExpiry: string (LocalDate) | null
  specialties: string | null (comma-separated, e.g. "AC Repair,AC Installation")
  baseRate: number | null
  responseTimeHours: number | null
  acceptsEmergency: boolean
  logoUrl: string | null
  averageRating: number (default 0.0)
  totalReviews: number (default 0)
  isVerified: boolean
  ```
- **Note:** `user` field is `@JsonIgnore`. Only `userId` is exposed.

#### PUT /contractor-profile/me
- **Auth:** `@PreAuthorize("hasRole('CONTRACTOR')")`
- **Request body:** `ContractorProfile` JSON — **PARTIAL UPDATE** (null fields are skipped)
- **Response:** Updated `ContractorProfile` JSON (200)
- **Updatable fields (null = skip):** businessName, description, licenseNumber, specialties, baseRate, responseTimeHours, logoUrl
- **NOT updatable via this endpoint:** acceptsEmergency, insuranceProvider, insuranceExpiry, averageRating, totalReviews, isVerified
- **Error:** 404 if profile not found
- **Critical limitation:** Cannot clear a field to null. Once `businessName` is set, sending `{businessName: null}` will NOT clear it.

#### GET /contractor-profile/{contractorId}
- **Auth:** None (public endpoint, SecurityConfig permitAll)
- **Request body:** None
- **Response:** `ContractorProfile` JSON (200)
- **Error:** 404 if not found
- **Use case:** Future public contractor profile

### 3.2 ServiceArea Endpoints

#### POST /service-areas
- **Auth:** `@PreAuthorize("hasRole('CONTRACTOR')")`
- **Request body:**
  ```json
  {
    "zipCode": "85001",     // REQUIRED, must match /^\d{5}$/
    "city": "Phoenix",      // optional
    "state": "AZ"           // optional
  }
  ```
- **Response:** Created `ServiceArea` JSON (200)
- **Backend behavior:** Sets `contractor` from auth context (ignores any `contractor` field in body)
- **Errors:** 400 "ZIP code is required" or "Invalid ZIP code format"
- **No duplicate check:** Can add the same ZIP code multiple times (no `unique` constraint on zipCode+contractor_id)

#### GET /service-areas/my-areas
- **Auth:** `@PreAuthorize("hasRole('CONTRACTOR')")`
- **Response:** `List<ServiceArea>` JSON (200)
- **Each item:**
  ```json
  {
    "id": 1,
    "zipCode": "85001",
    "city": "Phoenix",
    "state": "AZ"
  }
  ```
- **Note:** `contractor` field is `@JsonIgnore` (ManyToOne LAZY), not included in response

#### DELETE /service-areas/{id}
- **Auth:** `@PreAuthorize("hasRole('CONTRACTOR')")`
- **Ownership check:** `serviceArea.getContractor().getId().equals(currentUser.getId())`
- **Response:** 204 No Content
- **Errors:** 404 "Service area not found", 403 "You can only delete your own service areas"

#### GET /service-areas/zip/{zipCode}
- **Auth:** None (public endpoint)
- **Response:** `List<ServiceArea>` JSON (all contractors serving that ZIP)

### 3.3 Availability Endpoints

#### POST /availability
- **Auth:** `@PreAuthorize("hasRole('CONTRACTOR')")`
- **Request body:**
  ```json
  {
    "dayOfWeek": "MONDAY",         // REQUIRED (DayOfWeek enum string)
    "startTime": "08:00:00",       // REQUIRED (LocalTime)
    "endTime": "18:00:00",         // REQUIRED (LocalTime)
    "isEmergencyAvailable": true   // optional (default false)
  }
  ```
- **Response:** Created `Availability` JSON (200)
- **Backend behavior:** Sets `contractor` from auth context
- **No validation:** Does not check for duplicate dayOfWeek entries. Does not validate endTime > startTime.

#### GET /availability/my-availability
- **Auth:** `@PreAuthorize("hasRole('CONTRACTOR')")`
- **Response:** `List<Availability>` JSON (200)
- **Each item:**
  ```json
  {
    "id": 1,
    "dayOfWeek": "MONDAY",
    "startTime": "08:00:00",
    "endTime": "18:00:00",
    "isEmergencyAvailable": true
  }
  ```

#### PUT /availability/{id}
- **Auth:** `@PreAuthorize("hasRole('CONTRACTOR')")`
- **Ownership check:** `availability.getContractor().getId().equals(currentUser.getId())`
- **Request body:** Same as POST — partial update (null fields skipped)
- **Response:** Updated `Availability` JSON (200)
- **BUG:** `isEmergencyAvailable` can only be set to `true`, never back to `false`. Line 68: `if (availabilityDetails.isEmergencyAvailable()) availability.setEmergencyAvailable(true);` — there is no `else` branch.

#### DELETE /availability/{id}
- **Auth:** `@PreAuthorize("hasRole('CONTRACTOR')")`
- **Ownership check:** Same as above
- **Response:** 204 No Content

### 3.4 Seeder Data (per contractor)

Each of the 5 demo contractors has:
- **Profile:** businessName, description, licenseNumber, specialties (comma-separated string), baseRate (70-90), responseTimeHours (1-4), acceptsEmergency (boolean), isVerified=true
- **Service Areas:** 6 Phoenix ZIP codes each (non-overlapping ranges)
- **Availability:** Mon-Fri, 08:00-18:00, emergencyAvailable = profile.acceptsEmergency

## 4. Frontend Audit

### Existing Components
| Component | Location | Status | Pattern |
|-----------|----------|--------|---------|
| ContractorLayoutComponent | core/layouts/contractor-layout/ | Active | mat-sidenav, responsive |
| ContractorDashboardComponent | components/contractor/contractor-dashboard/ | Active | forkJoin, ch-container, ch-card |
| LeadInboxComponent | components/contractor/lead-inbox/ | Active | mat-tabs, filter |
| LeadDetailComponent | components/contractor/lead-detail/ | Active | two-column, ConfirmDialog |
| AppointmentListComponent | components/contractor/appointment-list/ | Active | three-section list |

### Existing Services
| Service | Methods | F5 Relevance |
|---------|---------|-------------|
| ContractorDataService | getMyLeads, getLead, acceptLead, rejectLead, getMyAppointments, updateAppointmentStatus, getMyProfile | `getMyProfile` exists but returns `any`. Missing: updateMyProfile, getMyServiceAreas, createServiceArea, deleteServiceArea, getMyAvailability, createAvailability, updateAvailability, deleteAvailability |
| CustomerDataService | getMyServiceRequests, getMyAppointments, createServiceRequest, getServiceRequest | Not needed for F5 |
| AuthService | login, register, logout, getCurrentUser, currentUser$ | Used for user info |

### Existing Models
| Model | File | Fields |
|-------|------|--------|
| User | user.model.ts | id, email, firstName, lastName, role, phone, isActive, siret |
| ServiceRequest | service-request.model.ts | id, customer, serviceType, problemDescription, urgency, propertyType, squareFootage, hvacSystemType, zipCode, address, status, estimatedPrice, preferredDate, createdAt, completedAt, photoUrl |
| LeadAssignment | lead-assignment.model.ts | id, serviceRequest, contractor, status, sentAt, respondedAt, quotedPrice, contractorNotes |
| Appointment | appointment.model.ts | id, serviceRequest, contractor, scheduledStart, scheduledEnd, status, notes, completionNotes, completedAt |
| **MISSING** | — | ContractorProfile, ServiceArea, Availability |

### Existing Shared Components (reusable in F5)
| Component | Selector | Reuse in F5 |
|-----------|----------|-------------|
| BadgeComponent | `<app-badge>` | Yes — verification badge |
| EmptyStateComponent | `<app-empty-state>` | Yes — empty states for areas/availability |
| SkeletonComponent | `<app-skeleton>` | Yes — loading states |
| AlertComponent | `<app-alert>` | Yes — success/error messages |
| ConfirmDialogComponent | `<app-confirm-dialog>` | Yes — delete confirmations |

### Missing Angular Material Module
- `MatSlideToggleModule` — **NOT** in angular-material.module.ts. Available in node_modules (`@angular/material/slide-toggle`). Must be added.

## 5. Frontend ↔ Backend Reconciliation

| Backend Capability | Endpoint | Frontend Support | Missing Work |
|-------------------|----------|-----------------|-------------|
| Get own profile | GET /contractor-profile/me | ✅ `getMyProfile()` exists | Model type needed (currently returns `any`) |
| Update own profile | PUT /contractor-profile/me | ❌ Not implemented | New method in ContractorDataService |
| Get public profile | GET /contractor-profile/{id} | ❌ Not implemented | Not needed for F5 |
| Get own service areas | GET /service-areas/my-areas | ❌ Not implemented | New method + model |
| Create service area | POST /service-areas | ❌ Not implemented | New method |
| Delete service area | DELETE /service-areas/{id} | ❌ Not implemented | New method |
| Find by ZIP | GET /service-areas/zip/{zipCode} | ❌ Not implemented | Not needed for F5 (future matching) |
| Get own availability | GET /availability/my-availability | ❌ Not implemented | New method + model |
| Create availability | POST /availability | ❌ Not implemented | New method |
| Update availability | PUT /availability/{id} | ❌ Not implemented | New method |
| Delete availability | DELETE /availability/{id} | ❌ Not implemented | New method |

**Summary:** 0 of 8 F5 management endpoints have frontend support. 8 new service methods needed. 3 new models needed. 3 new components needed.

## 6. Recommended F5 UX Architecture

### Option A: Single Page with Tabs
```
/contractor/settings
  ├── Tab 1: Profile
  ├── Tab 2: Service Areas
  └── Tab 3: Availability
```

### Option B: Separate Pages (RECOMMENDED)
```
/contractor/profile        → ContractorProfileComponent
/contractor/service-areas  → ServiceAreasComponent
/contractor/availability   → AvailabilityComponent
```

### Comparison

| Criteria | Option A (Tabs) | Option B (Separate Pages) |
|----------|-----------------|--------------------------|
| **UX Clarity** | Medium — tabs imply equal weight | High — each feature gets full screen |
| **Scalability** | Low — adding Portfolio tabs makes nav cluttered | High — new features = new sidebar items |
| **Implementation** | Simpler (1 component) | Slightly more (3 components) |
| **Mobile** | Problematic — tabs + content on small screens | Better — each page independent |
| **Consistency with app** | Low — app uses sidebar + separate routes everywhere | High — matches existing pattern |
| **Future Portfolio** | Hard — Portfolio doesn't fit "settings" metaphor | Easy — Portfolio gets its own route |
| **Demo narrative** | Weak — "let me show you my settings tabs" | Strong — "let me show you my profile, my areas, my hours" |

### Decision: Option B — Separate Pages

**Rationale:** The entire application uses sidebar navigation with dedicated routes. Introducing tabs for F5 would break the established pattern. Separate pages are consistent with Dashboard/Leads/Appointments and better support the demo narrative of walking through each setting.

## 7. Contractor Profile Specification

### Page Header
- **Title:** "Business Profile"
- **Subtitle:** "Manage your business information that customers see."
- **Pattern:** Same as contractor dashboard header (`ch-dashboard__header`)

### Form Structure

Single card, max-width 700px, two visual sections:

#### Section 1: Business Identity
| Field | Type | Required | Validation | Backend Field | Mobile |
|-------|------|----------|-----------|---------------|--------|
| Business Name | `mat-input` text | Yes | Min 2 chars, max 100 | businessName | Full width |
| Description | `textarea` (mat-input) | No | Max 500 chars | description | Full width |
| License Number | `mat-input` text | No | Alphanumeric + dash | licenseNumber | Full width |
| Logo URL | `mat-input` text | No | Valid URL format (optional) | logoUrl | Full width |

#### Section 2: Services & Rates
| Field | Type | Required | Validation | Backend Field | Mobile |
|-------|------|----------|-----------|---------------|--------|
| Specialties | Multi-checkbox group | Yes (min 1) | From predefined list | specialties (JSON string) | Grid 2-col → 1-col |
| Base Rate ($/hr) | `mat-input` number | No | Min 0, max 500 | baseRate | Half width |
| Response Time (hours) | `mat-input` number | No | Min 1, max 72 | responseTimeHours | Half width |

#### Section 3: Emergency
| Field | Type | Required | Validation | Backend Field | Mobile |
|-------|------|----------|-----------|---------------|--------|
| Accepts Emergency | `mat-slide-toggle` | No | — | acceptsEmergency | Full width |

#### Read-Only Display
| Field | Display | Source |
|-------|---------|--------|
| Verification Status | Green badge "Verified" or grey "Not Verified" | isVerified |
| Average Rating | Star icon + number (if totalReviews > 0) | averageRating, totalReviews |

### Predefined Specialties
```typescript
const SPECIALTIES = [
  { value: 'AC Repair', label: 'AC Repair' },
  { value: 'AC Installation', label: 'AC Installation' },
  { value: 'Heating Repair', label: 'Heating Repair' },
  { value: 'HVAC Maintenance', label: 'HVAC Maintenance' },
  { value: 'Emergency AC Repair', label: 'Emergency AC Repair' },
];
```
(Matches `serviceTypes` in NewRequestComponent for consistency)

### Actions
- **Save Changes** — `mat-flat-button color="primary"` — calls `PUT /contractor-profile/me`
- **Reset** — `mat-stroked-button` — reverts form to last saved state

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton placeholders for each form section |
| Loaded | Form pre-filled with current values |
| Saving | Button shows `mat-spinner`, form disabled |
| Save Success | Green `<app-alert type="success">` "Profile updated successfully" (auto-dismiss 5s) |
| Save Error | Red `<app-alert type="error">` with message from backend |

### Validation Rules
- Business Name: required, minLength(2), maxLength(100)
- Specialties: at least one checked (custom validator)
- Base Rate: optional, min(0), max(500)
- Response Time Hours: optional, min(1), max(72)
- All other fields: optional, no validation beyond type

### Data Flow
```
ngOnInit:
  GET /contractor-profile/me → populate form (patchValue)

onSave:
  PUT /contractor-profile/me with form.value → success/error alert

onReset:
  form.patchValue(lastSavedValue)
```

### Backend Note
The PUT endpoint does partial updates (null fields skipped). The frontend must send ALL fields on save (including current values) to avoid accidental data loss. The form should use `patchValue` on load, and `value` on save.

## 8. Service Areas Specification

### Page Header
- **Title:** "Service Areas"
- **Subtitle:** "Define the ZIP codes where you provide HVAC services."
- **Pattern:** Same as profile header

### UI Structure

#### Add Area Row
- `mat-form-field` with `matInput` — placeholder "Enter ZIP code (e.g. 85001)"
- Validation: 5-digit pattern `/^\d{5}$/`, required
- **Add** button: `mat-flat-button color="primary"` — disabled until input valid
- Optional: city and state inputs (can be pre-filled to "Phoenix", "AZ" for demo)

#### Current Areas Display
- `mat-chip-list` (or `mat-chip-listbox`) showing each area as a chip
- Each chip: `85001 · Phoenix, AZ` with delete icon (`mat-icon > close`)
- Click delete → ConfirmDialog: "Remove 85001 from your service areas?"
- Pattern: follows Angular Material chip list pattern

#### States
| State | Behavior |
|-------|----------|
| Loading | `<app-skeleton variant="list">` |
| Empty | `<app-empty-state icon="location_off" message="No service areas defined" actionText="Add Your First Area">` |
| Loaded | Chip list + add form |
| Adding | Input disabled, button shows spinner |
| Add Success | New chip appears, input cleared, success snackbar |
| Add Duplicate | Red `<app-alert type="warning">` "This ZIP code is already in your service areas" (frontend check) |
| Add Error | Red `<app-alert type="error">` with backend message |
| Deleting | Chip shows loading state |
| Delete Success | Chip removed |
| Delete Error | Red alert |

### Data Flow
```
ngOnInit:
  GET /service-areas/my-areas → populate chip list

onAdd:
  Frontend check: duplicate ZIP? → show warning
  POST /service-areas { zipCode, city, state } → add to list, clear input

onDelete(area):
  ConfirmDialog → confirmed?
    DELETE /service-areas/{id} → remove from list
```

### Duplicate Prevention
Frontend-only: check `existingAreas.some(a => a.zipCode === newZip)` before posting. Backend does NOT enforce uniqueness.

### Validation
- ZIP Code: required, pattern `/^\d{5}$/`
- City: optional text
- State: optional text, 2-char max

## 9. Availability Specification

### Page Header
- **Title:** "Weekly Availability"
- **Subtitle:** "Set your working hours for each day of the week."
- **Pattern:** Same as profile header

### UI Structure

**Decision: Card-based weekly editor (NOT table)**

Rationale:
- Tables don't work well on mobile
- Cards are consistent with the app's `ch-card` pattern
- Each day is a distinct visual unit
- Emergency toggle integrates naturally as a card action

#### Each Day Card
```
┌─────────────────────────────────────────────┐
│  Monday                          [toggle]   │
│  ┌─────────┐  to  ┌─────────┐   Emergency   │
│  │ 08:00 AM │     │ 06:00 PM │              │
│  └─────────┘      └─────────┘              │
│                              [Delete]       │
└─────────────────────────────────────────────┘
```

- Day name: bold, left-aligned
- Start Time: `<input type="time">` (native, not Material — simpler, works everywhere)
- End Time: `<input type="time">`
- Emergency Toggle: `mat-slide-toggle` — "Emergency"
- Delete: icon button `mat-icon > delete` — only if day was loaded from backend (not for newly added unsaved days)

#### Add Day Button
- Below the card list: `mat-stroked-button color="primary" + mat-icon > add`
- Opens a day selector (mat-select) showing only days not yet configured
- After selecting day, shows time inputs for that day

### Validation
- End time must be after start time (custom validator)
- Day of week required
- At least one day should be configured (warning, not blocking)

### States
| State | Behavior |
|-------|----------|
| Loading | 5 `<app-skeleton variant="card">` placeholders |
| Empty | `<app-empty-state icon="event_busy" message="No availability set" actionText="Set Your Hours">` |
| Loaded | Day cards list |
| Saving | Individual card shows spinner on save |
| Save Success | Green checkmark animation or success alert |
| Save Error | Red alert on the specific card |
| Delete Success | Card removed from list |
| Conflict Warning | If endTime <= startTime, show inline error |

### Data Flow
```
ngOnInit:
  GET /availability/my-availability → populate day cards
  Sort by DayOfWeek order (MON→FRI)

onSaveDay(dayCard):
  If day has id → PUT /availability/{id} { dayOfWeek, startTime, endTime, isEmergencyAvailable }
  If day is new → POST /availability { dayOfWeek, startTime, endTime, isEmergencyAvailable }

onDeleteDay(dayCard):
  ConfirmDialog → confirmed?
    DELETE /availability/{id} → remove from list

onToggleEmergency(dayCard):
  PUT /availability/{id} { isEmergencyAvailable: newValue }
  Note: Backend bug — cannot toggle OFF. Must fix backend first.
```

### Backend Bug: Emergency Toggle
**File:** `AvailabilityService.java` line 68-69
**Current code:**
```java
if (availabilityDetails.isEmergencyAvailable())
    availability.setEmergencyAvailable(true);
```
**Required fix:**
```java
availability.setEmergencyAvailable(availabilityDetails.isEmergencyAvailable());
```
This is a 1-line change. Without it, once emergency is toggled ON, it can never be toggled OFF from the frontend.

## 10. Routing Architecture

### New Routes

```typescript
// contractor children (inside existing ContractorLayoutComponent)
{ path: 'profile', component: ContractorProfileComponent },
{ path: 'service-areas', component: ServiceAreasComponent },
{ path: 'availability', component: AvailabilityComponent },
```

All three routes inherit the parent guard configuration:
- `canActivate: [AuthGuard, RoleGuard]`
- `data: { role: 'CONTRACTOR' }`

### Route Hierarchy
```
/contractor (ContractorLayoutComponent, guarded)
  ├── /dashboard (ContractorDashboardComponent)
  ├── /leads (LeadInboxComponent)
  ├── /leads/:id (LeadDetailComponent)
  ├── /appointments (AppointmentListComponent)
  ├── /profile (ContractorProfileComponent) ← F5 NEW
  ├── /service-areas (ServiceAreasComponent) ← F5 NEW
  └── /availability (AvailabilityComponent) ← F5 NEW
```

### Route Guard Chain
Each F5 route passes through:
1. `AuthGuard` — checks JWT exists in localStorage
2. `RoleGuard` — checks `currentUser.role === 'CONTRACTOR'`
3. Parent `ContractorLayoutComponent` — provides sidebar shell

No additional guards needed for F5.

## 11. Component Architecture

### File Structure

```
frontend/src/app/
├── core/
│   ├── models/
│   │   ├── contractor-profile.model.ts    ← NEW
│   │   ├── service-area.model.ts          ← NEW
│   │   └── availability.model.ts          ← NEW
│   └── services/
│       └── contractor-data.service.ts     ← MODIFY (add 7 methods)
├── components/
│   └── contractor/
│       ├── contractor-profile/            ← NEW directory
│       │   ├── contractor-profile.component.ts
│       │   ├── contractor-profile.component.html
│       │   └── contractor-profile.component.css
│       ├── service-areas/                 ← NEW directory
│       │   ├── service-areas.component.ts
│       │   ├── service-areas.component.html
│       │   └── service-areas.component.css
│       └── availability/                  ← NEW directory
│           ├── availability.component.ts
│           ├── availability.component.html
│           └── availability.component.css
├── app-routing.module.ts                  ← MODIFY (add 3 routes)
├── app.module.ts                          ← MODIFY (add 3 component declarations)
└── angular-material.module.ts             ← MODIFY (add MatSlideToggleModule)
```

### Models

#### contractor-profile.model.ts
```typescript
export interface ContractorProfile {
  userId: number;
  businessName?: string;
  description?: string;
  licenseNumber?: string;
  insuranceProvider?: string;
  insuranceExpiry?: string;
  specialties?: string;       // comma-separated string
  baseRate?: number;
  responseTimeHours?: number;
  acceptsEmergency: boolean;
  logoUrl?: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
}
```

#### service-area.model.ts
```typescript
export interface ServiceArea {
  id: number;
  zipCode: string;
  city?: string;
  state?: string;
}
```

#### availability.model.ts
```typescript
export interface Availability {
  id: number;
  dayOfWeek: string;         // "MONDAY" | "TUESDAY" | etc.
  startTime: string;         // "08:00:00"
  endTime: string;           // "18:00:00"
  isEmergencyAvailable: boolean;
}
```

### ContractorDataService — New Methods

```typescript
// Profile
updateMyProfile(data: Partial<ContractorProfile>): Observable<ContractorProfile>

// Service Areas
getMyServiceAreas(): Observable<ServiceArea[]>
createServiceArea(data: { zipCode: string; city?: string; state?: string }): Observable<ServiceArea>
deleteServiceArea(id: number): Observable<void>

// Availability
getMyAvailability(): Observable<Availability[]>
createAvailability(data: Omit<Availability, 'id'>): Observable<Availability>
updateAvailability(id: number, data: Partial<Availability>): Observable<Availability>
deleteAvailability(id: number): Observable<void>
```

**Total:** 7 new methods added to ContractorDataService (10 total after F5).

### Component Responsibilities

| Component | Responsibility | Data Flow |
|-----------|---------------|-----------|
| ContractorProfileComponent | Load, edit, save business profile | GET → patchValue → PUT on save |
| ServiceAreasComponent | List, add, delete service areas | GET → chip list, POST to add, DELETE to remove |
| AvailabilityComponent | List, add, edit, delete daily availability | GET → card list, POST/PUT/DELETE per day |

### Shared/Reusable Components
No new shared components needed for F5. All three components use existing shared components:
- `<app-skeleton>` for loading
- `<app-alert>` for success/error
- `<app-empty-state>` for empty lists
- `<app-confirm-dialog>` for delete confirmation

## 12. Design System Reuse

### CSS Tokens to Use
| Token | Value | Usage in F5 |
|-------|-------|-------------|
| `--ch-primary` | #1E40AF | Primary buttons, links |
| `--ch-primary-light` | #DBEAFE | Verified badge background |
| `--ch-success` | #059669 | Success alerts, verified badge |
| `--ch-success-light` | #D1FAE5 | Success alert background |
| `--ch-error` | #DC2626 | Error alerts |
| `--ch-error-light` | #FEE2E2 | Error alert background |
| `--ch-warning` | #D97706 | Duplicate warning |
| `--ch-warning-light` | #FEF3C7 | Warning alert background |
| `--ch-text` | #1E293B | Primary text |
| `--ch-text-secondary` | #64748B | Labels, secondary text |
| `--ch-text-muted` | #94A3B8 | Helper text |
| `--ch-surface` | #FFFFFF | Card backgrounds |
| `--ch-bg` | #F8FAFC | Page background |
| `--ch-divider` | #F1F5F9 | Section separators |
| `--ch-border` | #E2E8F0 | Input borders |
| `--ch-radius` | 8px | Card radius |
| `--ch-radius-lg` | 12px | Button radius |
| `--ch-shadow` | 0 1px 3px... | Card shadows |
| `--ch-space-1` through `--ch-space-16` | 4px-64px | All spacing |

### CSS Classes to Reuse
| Class | From | Usage |
|-------|------|-------|
| `.ch-container` | styles.css | Page wrapper |
| `.ch-card` | styles.css | Form sections, day cards |
| `.ch-page-header` | styles.css | Page title (alternative to custom header) |

### Naming Convention
All F5 CSS classes follow the `ch-{feature}__{element}` pattern established in F1-F4:
- `.ch-profile__*` for profile component
- `.ch-areas__*` for service areas component
- `.ch-availability__*` for availability component

### Responsive Breakpoints
Follow the same breakpoints as contractor-dashboard.component.css:
- `@media (max-width: 1024px)` — tablet adjustments
- `@media (max-width: 640px)` — mobile adjustments (stack elements vertically)

## 13. Security Review

### Backend Security (Verified)

| Endpoint | Auth | Ownership Check | Role Restriction |
|----------|------|-----------------|-----------------|
| GET /contractor-profile/me | JWT | Implicit (gets own profile) | CONTRACTOR only |
| PUT /contractor-profile/me | JWT | Implicit (updates own profile) | CONTRACTOR only |
| GET /contractor-profile/{id} | None | N/A (public) | None |
| GET /service-areas/my-areas | JWT | Implicit (gets own areas) | CONTRACTOR only |
| POST /service-areas | JWT | Sets contractor from auth | CONTRACTOR only |
| DELETE /service-areas/{id} | JWT | Explicit check | CONTRACTOR only |
| GET /availability/my-availability | JWT | Implicit (gets own) | CONTRACTOR only |
| POST /availability | JWT | Sets contractor from auth | CONTRACTOR only |
| PUT /availability/{id} | JWT | Explicit check | CONTRACTOR only |
| DELETE /availability/{id} | JWT | Explicit check | CONTRACTOR only |

### Frontend Security
- All F5 routes inherit `AuthGuard + RoleGuard` from parent contractor route
- No additional frontend security needed
- Frontend guards are defense-in-depth — backend enforces the real security

### Potential Issues
1. **PUT /contractor-profile/me does NOT check acceptsEmergency** — The service method doesn't update it. This is fine for F5 since we don't intend to update it via this endpoint.
2. **No admin override** — Admin cannot update contractor profiles via this endpoint. This is acceptable.
3. **Service area POST doesn't check for duplicates** — Could create duplicate ZIP entries. Frontend check recommended.
4. **Availability POST doesn't check for duplicate dayOfWeek** — Could have multiple entries for Monday. Frontend should check.

### Verified: No Cross-User Access
- `ServiceAreaService.deleteServiceArea` checks `serviceArea.getContractor().getId().equals(currentUser.getId())`
- `AvailabilityService.updateAvailability` checks `availability.getContractor().getId().equals(currentUser.getId())`
- `AvailabilityService.deleteAvailability` same check
- `ContractorProfileService.updateMyProfile` uses `findByUserId(currentUser.getId())` — only returns own profile

## 14. Demo Experience

### Demo Narrative

**Setup:** Contractor logs in as `contractor1@hvacmarketplace.com` / `contractor123`

**Step 1: "Here is my HVAC business profile."**
- Navigate to sidebar → Settings → Profile
- Shows pre-filled profile: "Cool Air Solutions", "Expert AC repair and installation with 15+ years experience in Phoenix area.", License: AZ-ROC-123456, Specialties: AC Repair, AC Installation, Emergency AC Repair, HVAC Maintenance, Base Rate: $85/hr
- Highlight: "This is what customers see when they view my business."
- Demo action: Change description or base rate → Save → Success message

**Step 2: "I define where I work."**
- Navigate to sidebar → Settings → Service Areas
- Shows 6 Phoenix ZIP codes: 85001, 85003, 85004, 85006, 85007, 85008
- Highlight: "These are the areas where I accept jobs."
- Demo action: Add a new ZIP code (85009) → chip appears → Delete an old one → chip removed

**Step 3: "I define when I am available."**
- Navigate to sidebar → Settings → Availability
- Shows Mon-Fri cards: 8:00 AM to 6:00 PM, Emergency toggle ON
- Highlight: "Customers can see my availability when booking."
- Demo action: Change Monday hours to 7:00 AM - 7:00 PM → Save

**Step 4: "Now I am ready to receive and handle leads."**
- Navigate to Dashboard → shows KPIs
- Navigate to Leads → shows lead inbox
- The full story: "I set up my profile, defined my service area, set my hours. Now the platform sends me qualified leads."

### Demo Flow Duration
- Profile: 1-2 minutes
- Service Areas: 1 minute
- Availability: 1 minute
- Total: ~4 minutes

### Demo Tips
- Have the backend already seeded (demo profile data pre-filled)
- Show mobile view briefly (sidebar collapses)
- Highlight the verification badge

## 15. Testing Matrix

### Backend API Tests (12)
| # | Test | Endpoint | Expected |
|---|------|----------|----------|
| T1 | GET profile | GET /contractor-profile/me | 200 + profile JSON |
| T2 | PUT profile | PUT /contractor-profile/me | 200 + updated profile |
| T3 | GET profile (customer) | GET /contractor-profile/me | 403 |
| T4 | GET service areas | GET /service-areas/my-areas | 200 + array |
| T5 | POST service area | POST /service-areas | 200 + area JSON |
| T6 | POST service area (invalid ZIP) | POST /service-areas | 400 |
| T7 | DELETE service area | DELETE /service-areas/{id} | 204 |
| T8 | DELETE service area (wrong user) | DELETE /service-areas/{id} | 403 |
| T9 | GET availability | GET /availability/my-availability | 200 + array |
| T10 | POST availability | POST /availability | 200 + availability JSON |
| T11 | PUT availability | PUT /availability/{id} | 200 + updated |
| T12 | DELETE availability | DELETE /availability/{id} | 204 |

### UI Tests (10)
| # | Test | Priority |
|---|------|----------|
| U1 | Profile loads with existing data | HIGH |
| U2 | Profile save shows success | HIGH |
| U3 | Service areas list loads | HIGH |
| U4 | Add service area shows new chip | HIGH |
| U5 | Delete service area removes chip | HIGH |
| U6 | Availability list loads | HIGH |
| U7 | Add availability day works | HIGH |
| U8 | Toggle emergency saves correctly | HIGH |
| U9 | Empty states display correctly | MEDIUM |
| U10 | Loading skeletons display | MEDIUM |

### Responsive Tests (4)
| # | Test | Breakpoint |
|---|------|-----------|
| R1 | Profile form stacks vertically | < 640px |
| R2 | Service areas chip list wraps | < 640px |
| R3 | Availability cards stack | < 640px |
| R4 | Sidebar collapses on mobile | < 768px |

### Regression Tests (5)
| # | Test | Verify |
|---|------|--------|
| G1 | Contractor dashboard still loads | F4 works |
| G2 | Lead inbox still loads | F4 works |
| G3 | Lead detail still works | F4 works |
| G4 | Appointment list still works | F4 works |
| G5 | Sidebar navigation works for all items | F1 + F5 |

### Build Test
| # | Command | Expected |
|---|---------|----------|
| B1 | `npx ng build --configuration development` | Clean build, 0 errors |

## 16. Implementation Order

| Step | Action | Files Created | Files Modified | Depends On | Risk |
|------|--------|---------------|----------------|------------|------|
| 1 | Create frontend models | 3 | 0 | None | Low |
| 2 | Extend ContractorDataService | 0 | 1 | Step 1 | Low |
| 3 | Add MatSlideToggleModule | 0 | 1 | None | Low |
| 4 | Create ContractorProfileComponent | 3 | 0 | Steps 1-3 | Low |
| 5 | Create ServiceAreasComponent | 3 | 0 | Steps 1-3 | Low |
| 6 | Create AvailabilityComponent | 3 | 0 | Steps 1-3 | Medium |
| 7 | Add routes to app-routing | 0 | 1 | Steps 4-6 | Low |
| 8 | Register in app.module | 0 | 1 | Steps 4-6 | Low |
| 9 | Enable sidebar items | 0 | 1 | Steps 4-8 | Low |
| 10 | Fix backend emergency toggle bug | 0 | 1 | None | Low |
| 11 | Test all endpoints | 0 | 0 | Steps 1-10 | Low |
| 12 | Regression test F1-F4 | 0 | 0 | Steps 1-10 | Low |
| 13 | Build verification | 0 | 0 | All | Low |

### Step Details

**Step 1: Create models** — Write 3 new model files. No dependencies. Pure TypeScript interfaces.

**Step 2: Extend ContractorDataService** — Add 7 new methods. Depends on models from Step 1.

**Step 3: Add MatSlideToggleModule** — Add import to angular-material.module.ts. Needed for emergency toggle in profile and availability.

**Step 4: Create ContractorProfileComponent** — Full ReactiveForm with 3 sections. Uses getMyProfile() existing method + new updateMyProfile().

**Step 5: Create ServiceAreasComponent** — Chip list + add form. Uses 3 new service methods.

**Step 6: Create AvailabilityComponent** — Card list with time inputs + emergency toggle. Uses 4 new service methods. Most complex component.

**Step 7: Add routes** — 3 new child routes under contractor path in app-routing.module.ts.

**Step 8: Register in app.module** — Add 3 new component imports to declarations array.

**Step 9: Enable sidebar** — Set `disabled: false` on Profile, Service Areas, Availability in contractor-layout.component.ts.

**Step 10: Fix backend** — 1-line change in AvailabilityService.java line 68-69.

## 17. Files To Create

### Models (3)
| File | Lines (est) | Description |
|------|-------------|-------------|
| `frontend/src/app/core/models/contractor-profile.model.ts` | 20 | ContractorProfile interface |
| `frontend/src/app/core/models/service-area.model.ts` | 10 | ServiceArea interface |
| `frontend/src/app/core/models/availability.model.ts` | 12 | Availability interface |

### Components (9)
| File | Lines (est) | Description |
|------|-------------|-------------|
| `frontend/src/app/components/contractor/contractor-profile/contractor-profile.component.ts` | 120 | Profile form logic |
| `frontend/src/app/components/contractor/contractor-profile/contractor-profile.component.html` | 130 | Profile form template |
| `frontend/src/app/components/contractor/contractor-profile/contractor-profile.component.css` | 100 | Profile styles |
| `frontend/src/app/components/contractor/service-areas/service-areas.component.ts` | 100 | Service areas logic |
| `frontend/src/app/components/contractor/service-areas/service-areas.component.html` | 80 | Service areas template |
| `frontend/src/app/components/contractor/service-areas/service-areas.component.css` | 60 | Service areas styles |
| `frontend/src/app/components/contractor/availability/availability.component.ts` | 140 | Availability logic |
| `frontend/src/app/components/contractor/availability/availability.component.html` | 100 | Availability template |
| `frontend/src/app/components/contractor/availability/availability.component.css` | 80 | Availability styles |

**Total new files:** 12 (3 models + 9 component files)
**Total estimated lines:** ~842

## 18. Files To Modify

| File | Change | Lines Changed (est) |
|------|--------|-------------------|
| `frontend/src/app/core/services/contractor-data.service.ts` | Add 7 methods, import 3 models | +40 lines |
| `frontend/src/app/angular-material.module.ts` | Add MatSlideToggleModule import + to arrays | +2 lines |
| `frontend/src/app/app-routing.module.ts` | Add 3 routes + 3 imports | +10 lines |
| `frontend/src/app/app.module.ts` | Add 3 component declarations + 3 imports | +8 lines |
| `frontend/src/app/core/layouts/contractor-layout/contractor-layout.component.ts` | Set `disabled: false` on 3 items | 3 lines changed |
| `back/.../service/AvailabilityService.java` | Fix emergency toggle bug | 1 line changed |

**Total modified files:** 6
**Total estimated changes:** ~64 lines

## 19. Files To Leave Untouched

The following files must NOT be modified during F5:

- `frontend/src/styles.css` — design tokens are sufficient
- `frontend/src/app/core/guards/auth.guard.ts` — working correctly
- `frontend/src/app/core/guards/role.guard.ts` — working correctly
- `frontend/src/app/core/services/auth.service.ts` — no changes needed
- `frontend/src/app/core/layouts/contractor-layout/contractor-layout.component.html` — no changes needed (uses *ngFor with disabled flag)
- `frontend/src/app/core/layouts/contractor-layout/contractor-layout.component.css` — no changes needed
- `frontend/src/app/components/contractor/contractor-dashboard/*` — no changes needed
- `frontend/src/app/components/contractor/lead-inbox/*` — no changes needed
- `frontend/src/app/components/contractor/lead-detail/*` — no changes needed
- `frontend/src/app/components/contractor/appointment-list/*` — no changes needed
- `frontend/src/app/shared/shared.module.ts` — no new shared components needed
- `frontend/src/app/shared/components/*` — no changes to existing shared components
- `back/src/main/java/com/example/projet/config/DemoDataSeeder.java` — seeder already creates all needed data
- `back/src/main/java/com/example/projet/entity/*` — no entity changes needed
- `back/src/main/java/com/example/projet/controller/*` — no controller changes needed
- `back/src/main/java/com/example/projet/repository/*` — no repository changes needed
- `back/src/main/java/com/example/projet/security/SecurityConfig.java` — no security changes needed

## 20. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Backend emergency toggle bug (confirmed) | N/A (exists) | Medium | Fix in Step 10 — 1-line change |
| `getMyProfile` returns `any` type | Low | Low | Type the return as `Observable<ContractorProfile>` |
| Service area duplicate ZIP | Medium | Low | Frontend check before POST |
| Availability duplicate dayOfWeek | Medium | Low | Frontend check before POST |
| Profile PUT partial update confusion | Low | Medium | Always send full form value, never partial |
| `<input type="time">` styling inconsistency | Low | Low | Use native input, consistent across browsers |
| Form not resetting to server state after save | Low | Low | Re-fetch profile after successful save |
| Availability `isEmergencyAvailable` cannot be toggled OFF (backend bug) | N/A (exists) | High | Must fix backend before F5 |

## 21. Dependencies

### Internal Dependencies
| Dependency | Required By | Status |
|------------|-------------|--------|
| F1 (Layout Shell) | All F5 routes | ✅ Complete |
| F4 (Contractor Dashboard) | F5 sidebar nav context | ✅ Complete |
| Auth Infrastructure (B) | All F5 authenticated endpoints | ✅ Complete |
| Design System (A) | All F5 styling | ✅ Complete |
| Shared Components (F1) | Skeleton, Alert, EmptyState, ConfirmDialog | ✅ Complete |

### External Dependencies
| Dependency | Required By | Status |
|------------|-------------|--------|
| Angular Material 16.2.11 | MatSlideToggleModule, MatChipsModule, MatSelectModule | ✅ Installed |
| `@angular/cdk/layout` | BreakpointObserver (already used in layout) | ✅ Installed |
| Backend on port 8081 | All API calls | ✅ Running |

### No New Dependencies Required
F5 does not require any new npm packages or backend changes (except the 1-line bug fix).

## 22. Definition of Done

F5 is complete when ALL of the following are true:

### Profile
- [ ] Contractor can view their profile with all existing data pre-filled
- [ ] Contractor can edit business name, description, license, specialties, base rate, response time
- [ ] Contractor can toggle emergency availability on/off
- [ ] Save button sends PUT to backend and shows success feedback
- [ ] Verification badge displays correctly
- [ ] Rating displays when reviews exist
- [ ] Form validation prevents invalid submissions
- [ ] Loading state shows skeleton
- [ ] Error state shows alert with retry

### Service Areas
- [ ] Contractor can see all their service areas as chips
- [ ] Contractor can add a new ZIP code (validated 5 digits)
- [ ] Contractor can delete a service area with confirmation
- [ ] Duplicate ZIP is blocked with frontend warning
- [ ] Empty state shows when no areas exist
- [ ] Loading state shows skeleton

### Availability
- [ ] Contractor can see their weekly schedule
- [ ] Contractor can add a new day with start/end times
- [ ] Contractor can edit existing day times
- [ ] Contractor can toggle emergency availability per day
- [ ] Contractor can delete a day with confirmation
- [ ] Backend emergency toggle bug is fixed
- [ ] Empty state shows when no availability exists
- [ ] Loading state shows skeleton

### Sidebar
- [ ] Profile, Service Areas, Availability links are enabled in sidebar
- [ ] "Soon" badges are removed from these 3 items
- [ ] Navigation to each route works correctly
- [ ] Active state highlights correctly in sidebar

### Cross-cutting
- [ ] Build passes: `npx ng build --configuration development` — 0 errors
- [ ] All contractor F4 features still work (dashboard, leads, appointments)
- [ ] Mobile responsive for all 3 new pages
- [ ] All 12 backend API tests pass
- [ ] All 10 UI tests pass
- [ ] All 4 responsive tests pass
- [ ] All 5 regression tests pass

## 23. Final Recommendation

1. **Is F5 ready to implement?** YES. All backend endpoints exist and work. All frontend patterns are established. 12 new files + 6 modified files.

2. **Is backend ready?** YES, with one 1-line bug fix needed (`AvailabilityService.java` line 68-69 — emergency toggle cannot be set to false).

3. **Is frontend architecture ready?** YES. The contractor layout, sidebar, routing, module, shared components, and design system all support F5 without structural changes.

4. **Are backend changes required?** Only the emergency toggle bug fix. No new endpoints, entities, controllers, services, or repositories.

5. **Should F5 include Profile + Service Areas + Availability together?** YES. They share the same contractor settings context, the same sidebar section, and the same form patterns. Implementing them together is more efficient than separately and creates a complete "contractor setup" experience.

6. **Should any part be moved to another slice?** NO. All three features are tightly coupled (profile provides identity, areas define coverage, availability defines schedule). They form the complete contractor settings experience.

7. **What is the smallest coherent F5 scope?** Profile + Service Areas + Availability as three separate pages under the contractor sidebar Settings section, with 1 new model file, 7 new service methods, 9 new component files, 3 modified config files, and 1 backend bug fix.

---

*Plan produced: August 27, 2026*
*Based on direct source code inspection of all backend controllers, services, repositories, entities, security config, seeder, and all frontend components, services, models, routing, modules, shared components, and design system.*
