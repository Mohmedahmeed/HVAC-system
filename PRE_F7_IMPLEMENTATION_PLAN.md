# PRE-F7 IMPLEMENTATION PLAN — Customer Reviews & Contractor Ratings

> **Phase:** PRE-F7 RECONNAISSANCE (READ-ONLY)
> **Baseline HEAD:** `24e85d2` (`main`, synced with `origin/main`, working tree clean)
> **Backend verified live:** `http://localhost:8081/api/v1` — Spring profile `demo` (restarted this session with `SPRING_PROFILES_ACTIVE=demo` because the running process had an empty H2 instance; **no code changed**)

---

## 1. Executive Summary

After F1–F6 the platform has a working request lifecycle for customers (create → list → detail → cancel) and a working contractor workspace (leads → accept/reject → appointments → complete → profile → service areas → availability). The repository audit uncovered **one fully-built, fully-functional backend domain that has zero frontend: Customer Reviews / Ratings** (`Review` entity + `ReviewController` + aggregate on `ContractorProfile.averageRating/totalReviews`), plus a verified **public contractor-profile endpoint** that no screen consumes.

**Recommended F7 = Customer Reviews & Ratings (give + view):**
- **Customer:** rate a completed job inline (5 dimensions: overall, quality, professionalism, punctuality, communication + comment), reusing the existing request-detail screen.
- **Contractor:** new `/contractor/reviews` screen listing received reviews with an aggregate rating summary (enables the currently-disabled "Reviews" nav item).

This is the only candidate that completes the business lifecycle (COMPLETED job → rating → aggregate trust signal), needs **zero backend logic changes**, reuses the existing component/state patterns, and directly supports the product's goal of a credible U.S. HVAC marketplace (ratings are the trust currency of lead-gen platforms).

**Decision: PROCEED WITH F7.**

---

## 2. Current Project Checkpoint

- Branch `main`, clean tree, synced with `origin/main`, HEAD `24e85d2`.
- Latest commits:
  - `8e17aa9 feat(F6): customer request detail and cancellation`
  - `24e85d2 chore(cleanup): remove AI tooling artifacts and internal documents`
- Backend running with demo profile on `:8081`; dev server on `:4200`. No files modified during this reconnaissance.

---

## 3. Existing Roadmap Discovery

- No `F7` marker, roadmap doc, or slicing document exists in the repo (all planning docs were removed in the cleanup commit).
- The only legitimate roadmap signal is **disabled nav items in the running UI** — these are the product's own declared "next" surface:
  - Customer: "Appointments" disabled (`top-bar.component.ts:23`)
  - Contractor: "Portfolio" and "Reviews" disabled (`contractor-layout.component.ts:22-23`)
  - Admin: "Users / Contractors / Requests" disabled (`admin-layout.component.ts:19-22`)
- Backend search for `review|rating|portfolio|booking|matching` found the real capabilities are: **Reviews (complete), Appointment creation (complete), Admin user CRUD (complete), public contractor profile (complete)**. Matching/auto-assign **does not exist**.

---

## 4. Frontend Audit

### Screens by state
| State | Screens |
|---|---|
| Built (feature) | Customer: dashboard, new request, requests list, request detail. Contractor: dashboard, leads, lead detail, appointments, profile, service areas, availability |
| Placeholder | `admin/dashboard` (`AdminDashboardPlaceholderComponent`, "Coming in the next slice") |
| Disabled nav (no route/component) | `customer/appointments`; `contractor/portfolio`, `contractor/reviews`; admin users/contractors/requests |
| Legacy (unrouted, chrome) | `home`, `nav`, `footer`, `profile`, `annonceform`, `annonces`, `missions`, `forget`, `unauthnav`, login/register |

### Key facts for F7
- **No `Review`/`Rating` frontend model, service method, component, or route exists.** The only touches are read-only: `averageRating`/`totalReviews` shown in `contractor-profile.component.html:99-102` and hardcoded fake reviews on the landing page (`home.component.ts:20-24`).
- **Contractor "Reviews" nav item already declared but disabled** — wiring it on is trivial (`contractor-layout.component.ts:23`).
- Established patterns to reuse (consistent across every feature screen): `isLoading/hasError/errorMessage` + `destroy$`/`takeUntil`/`finalize`; skeleton → alert+retry → empty-state → success; `ConfirmDialogComponent` for destructive actions; `app-badge`, `app-empty-state`, `app-alert`, `app-skeleton`; CSS tokens (`--ch-*`) + `.ch-card`, `.ch-container`, `.ch-page-header`.
- **Global Material imports already give a new component everything needed** (`angular-material.module.ts`): icon, button, card, progress-spinner, snack-bar, tooltip, etc. `MatDialogModule` + shared components come via `SharedModule` (already global in `AppModule`).
- `customer-data.service.ts` has `getMyServiceRequests`, `getMyAppointments`, `getServiceRequest(id)`, `createServiceRequest`, `cancelServiceRequest`. No review method.
- `contractor-data.service.ts` has leads/appointments/profile/areas/availability. No review method.

---

## 5. Backend Audit (verified from source `back/src/main/java/com/example/projet`)

### Review domain — COMPLETE and functional
**Entity `Review`** (`entity/Review.java:13-48`): `id`, `customer` (ManyToOne User), `contractor` (ManyToOne User), `serviceRequest` (OneToOne), `overallRating`, `qualityRating`, `professionalismRating`, `punctualityRating`, `communicationRating` (all Integer 1–5), `comment` (TEXT), `createdAt`.

| Method | Path | Role | Body | Response | Rules (`service/ReviewService.java`) |
|---|---|---|---|---|---|
| POST | `/reviews/service-request/{serviceRequestId}` | CUSTOMER | `Review` (ratings + comment) | `Review` | customer owns request (`:55-56`); request must be **COMPLETED** (`:59-60`); no duplicate review per request (`:62-65`); ratings validated 1–5 (`:104-107`); contractor = request's **ACCEPTED** lead (`:76-80`); recomputes `averageRating` (mean of overall) + `totalReviews` on `ContractorProfile` (`:90-99`) |
| GET | `/reviews/contractor/{contractorId}` | CUSTOMER/CONTRACTOR/ADMIN (authenticated) | — | `List<Review>` | reviews for given contractor (`:109-115`) |
| GET | `/reviews/my-reviews` | CUSTOMER/CONTRACTOR | — | `List<Review>` | customer → given reviews; contractor → received reviews (`:117-125`) |

Status enum: `ServiceRequestStatus` `NEW, MATCHED, ACCEPTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED`. A request reaches `COMPLETED` when its appointment is marked COMPLETED (`service/AppointmentService.java:118-122`).

### Public endpoints that support F7
- `GET /contractor-profile/{contractorId}` — **public** (`SecurityConfig.java:47` permitAll) — returns businessName, specialties, baseRate, `averageRating`, `totalReviews`, verified, etc. (verified live, anonymous).

### Dead / unrelated (excluded)
- `EvaluationController` — hardcoded `return 0` stub (`service/EvaluationService.java:20-33`), non-entity. Ignore.
- `Annonce` module — legacy classified-ad domain unrelated to the HVAC marketplace. Leave as-is.

---

## 6. Domain / Lifecycle Map (current real behavior)

```
Customer ──create──▶ ServiceRequest (NEW)
                          │  (auto-matching NOT implemented at runtime —
                          │   leads only exist via seeder)
                          ▼
                  LeadAssignment (SENT) ──contractor──▶ ACCEPTED / REJECTED
                          │ ACCEPTED
                          ▼
                  Appointment (SCHEDULED)  ← creation (POST /appointments/...)
                          │                    has NO frontend UI yet
                          ▼
                  Appointment COMPLETED ──▶ ServiceRequest COMPLETED
                          │
                          ▼
                  Review (by owning customer)   ←  BACKEND READY, NO UI  ◀── F7
                          │
                          ▼
              Contractor.averageRating/totalReviews  (surfaced on public
                  profile endpoint + own profile read-only)
```

Broken/incomplete UX seams today: (1) **no review UI**, (2) no contractor appointment-creation UI, (3) no auto-matching, (4) statuses `MATCHED/ACCEPTED/IN_PROGRESS` never produced by code, (5) admin is an empty placeholder.

---

## 7. Security Audit

Rulégime for Reviews (from `ReviewService.java`, verified live):
- **Create** — CUSTOMER only; must own the service request; request must be COMPLETED; must not already have reviewed it; contractor resolved from ACCEPTED lead (not client-supplied) — no cross-user injection possible.
- **Read** — contractor-specific and my-reviews read endpoints restricted by role + ownership in service logic.
- **Public surface** — only the profile GET is public; reviews themselves require auth.
- **No destructive review operations exist** (no update/delete endpoints) → nothing to protect.
- **Admin** — user CRUD + all-requests list verified role-locked (`@PreAuthorize("hasRole('ADMIN')")`).

No security gaps found in the F7 surface. Live checks: non-owner → 403, duplicate → 403, not-COMPLETED → 403, customer appoint-create → 403.

---

## 8. Real API Verification (live, read-only; no seeded record mutated)

Backend restarted with demo profile; all checks against `:8081/api/v1`:

| Check | Result |
|---|---|
| `POST /auth/login` (all 5 demo accounts) | 200, token ✓ |
| `GET /reviews/contractor/5` (contractor1) as customer | 200 — 1 review (overall 5, quality 5, prof 5, punct 4, comm 5, "Excellent emergency service! …", req 3, by customer3) |
| `GET /reviews/my-reviews` as customer3 | 200 — 1 (given) |
| `GET /reviews/my-reviews` as contractor1 | 200 — 1 (received) |
| `POST /reviews/service-request/3` as non-owner (customer1) | **403** "You can only review your own service requests" (no mutation) |
| `POST /reviews/service-request/3` as owner (customer3, duplicate) | **403** "You have already reviewed this service request" |
| `POST /reviews/service-request/1` as owner (customer1, SR1 not COMPLETED) | **403** (review requires completed request) |
| `GET /contractor-profile/5` **anonymous** | 200 — businessName, avgRating **5.0**, totalReviews **1**, verified true |
| `GET /service-areas/zip/85016` anonymous | 200 |
| `GET /users` admin / customer | 200 (9) / 403 |
| `GET /service-requests` admin | 200 (5) |
| Empty-body POSTs (`-X POST` no JSON) | 500 (argument parsing — see Risks) |

Seed state for F7 demo: SR3 = COMPLETED for customer3, already reviewed (good for the "already reviewed" state); contractor1 carries rating 5.0 / 1 review. **No other demo record is suitable for the give-flow** (SR1/SR2 are SCHEDULED; SR4/SR5 NEW).

---

## 9. Frontend ↔ Backend Reconciliation

| Backend capability | Endpoint | Frontend support | Missing work | F7 relevance |
|---|---|---|---|---|
| Create review | `POST /reviews/service-request/{id}` | **None** | review form + customer-data service | ★ core |
| My reviews (given/received) | `GET /reviews/my-reviews` | **None** | contractor reviews screen + service method | ★ core |
| Contractor reviews | `GET /reviews/contractor/{id}` | **None** | (used by review summary later) | support |
| Public contractor profile | `GET /contractor-profile/{id}` | **None** (public) | future public profile page | future (F8+) |
| Appointment creation | `POST /appointments/service-request/{id}` | **None** | contractor scheduling UI | future slice |
| Admin user CRUD | `/users/**` | **None** | full admin module | future slice |
| Admin all-requests | `GET /service-requests` | **None** | admin requests screen | future slice |
| Customer appointment list | `GET /appointments/my-appointments` | partial (dashboard + request-detail filter) | dedicated `customer/appointments` route | future slice |
| Zip availability | `GET /service-areas/zip/{zip}` | None | matching/search UX | future |

---

## 10. F7 Product Decision

**F7 = Customer Reviews & Ratings (give) + Contractor Reviews (view).**

Rationale against the alternatives:
- **Customer Reviews** — the ONLY complete-backend capability; closes the life-cycle loop (the last UX seam); trust signal on every contractor; zero backend logic changes → LOW risk; coherent as one slice.
- Customer Appointment Details — partially exists; smaller value; deferred.
- Contractor Appointment Creation — valuable, but a lead-book workflow that presupposes reviews exist for trust; also touches the appointment status machine. Deferred.
- Admin Dashboard — no stats endpoint on backend; requires new backend code; HIGHER risk. Deferred.
- Auto-matching — **not implemented at all** on the backend; a large backend-first slice. Deferred (note: statuses `MATCHED/ACCEPTED/IN_PROGRESS` unused).
- Contractor Portfolio / public directory — no portfolio entity; requires new backend. Public profile surfacing (F8) builds on reviews. Deferred.

**User journey completed:** Customer completes a job → is invited to rate the contractor → contractor sees their rating summary + reviews (Customers trust the reported average; Contractor profile shows the earned rating, replacing the meaningless seed 0.0 on fresh profiles).

**Does it require backend work?** No for the feature. One **optional** demo-seeder addition (a second COMPLETED-but-unreviewed request) is recommended so the happy path is demoable — demo profile only, no behavior change.

**Risk:** LOW.

---

## 11. F7 UX Specification

### 11.1 Customer — Rate a completed job (inside existing `request-detail`)
- Entry points: request-detail page for a `COMPLETED` request; a compact "Rate this job" card/CTA on the request-list row for `COMPLETED` items navigates to the detail.
- States of the review block on request detail:
  - `COMPLETED` + not reviewed → **"Rate your experience"** card: 5 star-inputs (Overall experience, Quality of work, Professionalism, Punctuality, Communication), optional comment textarea, Submit button, "This helps other homeowners choose a reliable contractor." helper text.
  - `COMPLETED` + already reviewed → **"Thanks for your review"** card showing the submitted stars + comment (read-only replay).
  - Any other status → no review UI (hidden).
- Submission: disable button + inline spinner ("Submitting…"); success → swap to the "thanks" card + snackbar "Review submitted — thank you!". Failure → inline `app-alert` error with retry; keep entered values.
- Star control: 5-star picker, keyboard accessible (radio-group semantics, arrow keys), `aria-label` per dimension.

### 11.2 Contractor — Reviews screen (`/contractor/reviews`, nav "Reviews" enabled)
- Header: aggregate card — average overall rating (large number, e.g. 4.7/5), total reviews, per-dimension averages.
- List: each review card = stars, comment, request service type, customer name, date. Empty state via `app-empty-state` ("No reviews yet — complete jobs to earn ratings.").
- Loading skeletons / error alert + retry identical to other screens.

### 11.3 Trust/consistency
- Reuse `formatServiceType`-style mapping for service labels; show "Verified contractor" marker where available; never show other customers' private data (only first name + last initial for the reviewer).

---

## 12. Status / State UX Matrix

| State | Where | UX |
|---|---|---|
| Loading | both views | `app-skeleton` cards / rows, `role="status" aria-busy` |
| Error | both views | `app-alert` error + Retry button |
| Empty | contractor reviews | `app-empty-state` ("No reviews yet…") |
| Empty (customer) | request has no review yet | show the rate card (default state) |
| Success submit | review form | thank-you card + snackbar |
| Non-COMPLETED request | customer detail | review block hidden entirely |
| Already reviewed | customer detail | read-only replay card |
| Submit in-flight | review form | disabled button + spinner, no double-submit |
| Server rejects (403 non-owner, dup, stale) | form | inline alert with the backend message |

---

## 13. Route Architecture

```
No new customer route (review lives inside existing /customer/requests/:id)
New contractor route (new child under contractor layout):
  /contractor/reviews  →  ContractorReviewsComponent
Route registered after /contractor/appointments in app-routing.module.ts children (:66),
guarded already by Customer/Contractor layout guards.
```

---

## 14. Component Architecture

**New files:**
- `frontend/src/app/core/models/review.model.ts` — `Review` (+ `ReviewDimension` keys, label map).
- `frontend/src/app/shared/components/rating-stars/` (ts+html+css) — reusable `ch-rating` control: `@Input() value`, `@Input() readonly`, `@Input() max=5`, `@Input() ariaLabel`, `@Output() valueChange`. Renders 5 star icons (filled/outline via `mat-icon` `star`/`star_border`), keyboard-operable when editable.
- `frontend/src/app/components/customer/requests/request-detail/` — **modify**, not create: add `<app-review-form>` block + "already reviewed" replay (inline, no separate form component needed) — or a small `review-section.component` local to the requests folder. Prefer inline sections reusing `app-rating-stars` to keep the slice small.
- `frontend/src/app/components/contractor/reviews/contractor-reviews/` (ts+html+css) — aggregate header + review list.

**Services (modify):**
- `customer-data.service.ts`: `createReview(serviceRequestId, review)` → `POST /reviews/service-request/{id}`; `getMyReviews()` → `GET /reviews/my-reviews` (customer, for replay freshness).
- `contractor-data.service.ts`: `getMyReviews()` → `GET /reviews/my-reviews`.

**Wiring (modify):** `app.module.ts` (declare ReviewFormSection + ContractorReviews), `app-routing.module.ts` (route), `contractor-layout.component.ts` (enable Reviews nav item, keep Portfolio disabled).

**Reuse (no new deps):** `app-badge`, `app-empty-state`, `app-skeleton`, `app-alert`, `ConfirmDialogComponent` (not needed here), shared tokens, `MatSnackBar` (already imported globally). No new Angular Material modules and no `MatDialogModule` additions required (SharedModule already global).

---

## 15. API Integration Plan

| Call | Client | Method → Endpoint | Notes |
|---|---|---|---|
| Submit review | customer | `POST /reviews/service-request/{id}` body `{overallRating, qualityRating, professionalismRating, punctualityRating, communicationRating, comment}` | success returns saved Review (use for replay state) |
| Customer replay / freshness | customer | `GET /reviews/my-reviews` | optional; can also trust the POST response + local flag |
| Contractor reviews | contractor | `GET /reviews/my-reviews` | compute aggregates client-side from list |
| (future) public profile | public | `GET /contractor-profile/{id}` | untouched this slice |

All through `AuthInterceptor` (Bearer header attached automatically); endpoints require auth.

---

## 16. Responsive Specification

- Contractor reviews list: single column on mobile; 2-column grid across **lg** (`--ch-breakpoint`) using CSS grid + existing spacing tokens; aggregate card stays full-width.
- Review content blocks on request-detail: full width once below 720px; inline labels above star rows on narrow screens.
- Touch targets ≥ 44px for star buttons; no horizontal scroll introduced.

---

## 17. Accessibility

- Star rating: implemented as a focusable group with `role="radiogroup"` / arrow-key + Home/End handling, `aria-label` per dimension, `aria-required`, visual focus ring via existing `:focus-visible` pattern.
- Read-only replay: `aria-hidden=true` stars + `aria-label="Rated 4 out of 5"` text alternative.
- Review cards: semantic `article`/heading hierarchy, comment text readable at 4.5:1 (uses `--ch-text-secondary`), `role="status"` for submit success/failure announcements.
- Keep existing reduced-motion handling (`styles.css:124-131`).

---

## 18. Testing Matrix

| Type | Tests |
|---|---|
| Frontend build | `npx ng build --configuration development` exit 0 |
| Unit (component) | rating-stars interaction & a11y (value emit, readonly, keyboard); review section visibility logic (COMPLETED / reviewed / other) |
| Service tests | createReview + getMyReviews URL/body wiring |
| API (live) | POST create OK on a completed+unreviewed throwaway; 403 non-owner / duplicate / non-COMPLETED; GET my-reviews both roles; aggregate recomputation on profile |
| Security | cross-customer create blocked; contractor cannot create; no auth → 401/403 |
| Responsive | 360px / 768px / 1280px contractor reviews + request-detail |
| Regression | full crawl of F1–F6 routes + demo-login flows |
| Demo walkthrough | see §19/§25 |

---

## 19. Regression Plan

- Re-verify F1–F6 screens: home/login/register, customer dashboard + new-request + requests list/detail/cancel, contractor dashboard/leads/lead-detail/appointments/profile/service-areas/availability, admin placeholder route.
- Re-run `ng build` + the dev-server route smoke (all SPA routes 200 with `Accept: text/html`).
- No changes to auth guards, interceptor, services' existing methods, or backend endpoints → regression risk contained to the two touched screens + nav wiring.

Demo walkthrough (recommended): optionally extend the demo seeder with **one completed+unreviewed request** (e.g., customer2 + contractor2, COMPLETED, no review) so the happy path is demonstrable; otherwise SR3 demonstrates the "already reviewed" state only and the contractor1 Reviews page shows the seeded 5-star review.

---

## 20. Risks

**CONFIRMED**
- Empty-body POST to review/appointment endpoints returns 500 (argument parsing) instead of 400 — cosmetic robustness issue; the shipped form always sends a body. Not F7-blocking; noted for a later hardening pass.
- Seeded demo has exactly one completed request and it is already reviewed → happy-path demo requires the small seeder addition above (or SR3's replay state only).

**POTENTIAL**
- No review edit/delete endpoints exist — a mistaken review cannot be corrected by users (acceptable for scope; note in product backlog).
- `GET /reviews/contractor/{id}` requires auth, so an unauthenticated public "browse contractor reviews" page (F8) will need SecurityConfig adjustment later — unrelated to F7.
- Customer could resubmit if the POST response is lost — mitigated by the duplicate guard (403) surfacing in the inline alert.

---

## 21. Files To Create

```
frontend/src/app/core/models/review.model.ts
frontend/src/app/shared/components/rating-stars/rating-stars.component.ts
frontend/src/app/shared/components/rating-stars/rating-stars.component.html
frontend/src/app/shared/components/rating-stars/rating-stars.component.css
frontend/src/app/components/customer/requests/review-section/review-section.component.ts   (form + replay states)
frontend/src/app/components/customer/requests/review-section/review-section.component.html
frontend/src/app/components/customer/requests/review-section/review-section.component.css
frontend/src/app/components/contractor/reviews/contractor-reviews/contractor-reviews.component.ts
frontend/src/app/components/contractor/reviews/contractor-reviews/contractor-reviews.component.html
frontend/src/app/components/contractor/reviews/contractor-reviews/contractor-reviews.component.css
(optional, demo-only backend): back/src/main/java/com/example/projet/config/DemoDataSeeder.java — add ONE completed+unreviewed request
```

---

## 22. Files To Modify

```
frontend/src/app/core/services/customer-data.service.ts     (add createReview, getMyReviews)
frontend/src/app/core/services/contractor-data.service.ts   (add getMyReviews)
frontend/src/app/components/customer/requests/request-detail/request-detail.component.ts/.html (mount review-section for COMPLETED)
frontend/src/app/components/customer/requests/request-list/request-list.component.html/.ts     (optional "Rate" CTA / reviewer pointer for COMPLETED rows)
frontend/src/app/shared/shared.module.ts                    (declare+export RatingStars, ReviewSection)
frontend/src/app/app.module.ts                              (declare ContractorReviews)
frontend/src/app/app-routing.module.ts                      (route /contractor/reviews)
frontend/src/app/components/contractor/contractor-layout/contractor-layout.component.ts (enable Reviews nav)
```

---

## 23. Files To Leave Untouched

```
All back/src/main/java/** EXCEPT the optional DemoDataSeeder addition (demo profile only)
back/src/main/resources/application.properties
frontend/src/app/angular-material.module.ts  (no new Material modules needed)
frontend/src/app/core/guards/*, interceptors/auth.interceptor.ts
frontend/src/app/core/services/auth.service.ts
frontend/src/app/components/top-bar/*  (customer "Appointments" stays disabled)
frontend/src/app/components/placeholders/admin-dashboard-placeholder/*
frontend/src/app/core/layouts/{customer,admin}-layout/*
frontend/src/styles.css, theme.scss
Legacy components (home, nav, footer, profile, annonce*, missions, forget, unauthnav, register*, login)
```

---

## 24. Exact Implementation Order

1. `review.model.ts` (types + dimension label map).
2. `RatingStarsComponent` (create + unit test).
3. `ReviewSectionComponent` (form + replay states, wired to `createReview`/`getMyReviews`).
4. `customer-data.service.ts` + `contractor-data.service.ts` methods.
5. Mount review-section in `request-detail` (COMPLETED logic) + optional CTA in `request-list`.
6. `ContractorReviewsComponent` (+ aggregates).
7. Routing (`/contractor/reviews`), AppModule declarations, SharedModule exports.
8. Enable contractor "Reviews" nav item.
9. (If approved) minimal demo-seeder addition for happy-path demo.
10. `ng build` → API live suite → route smoke → manual demo walkthrough → F7_FINAL_REPORT.

---

## 25. Definition of Done

- [ ] Build passes exit 0; no TS/template errors.
- [ ] Customer on request-detail of their COMPLETED request can submit a 5-dimension review; success shows replay card + snackbar; duplicate/non-owner/non-COMPLETED all show inline errors.
- [ ] Non-COMPLETED requests never show the review UI.
- [ ] Contractor `/contractor/reviews` shows average + dimensions + list (loading/error/empty states); nav "Reviews" clickable.
- [ ] `/reviews/my-reviews` + `/reviews/service-request/{id}` verified against the live API (returns expected data; guards intact).
- [ ] All F1–F6 screens still work; route smoke 200 everywhere; no new Material imports; no backend logic changes.
- [ ] Accessibility: keyboard-star control, labels, reduced-motion preserved.
- [ ] No AI-generated docs committed; only the F7 source + one F7 report.

---

## 26. Final Recommendation

**PROCEED WITH F7 — Customer Reviews & Contractor Ratings (frontend-only slice on a complete backend).**

Because: it is the highest-value complete-backend capability with zero UI, it closes the final seam in the transacted lifecycle (COMPLETED → rating → visible aggregate trust), it reuses every established pattern and all existing Material/shared imports, it carries LOW risk, and it is coherent as a single slice. The only open question pending your approval is the optional one-line-class seeder addition to make the happy-path demo presentable; the core feature ships regardless.

---

## Reconnaissance Runbook Recap (this session)

- **Git state at end:** clean, `main` synced, HEAD `24e85d2`. Nothing committed/pushed.
- **Backend verification:** SUCCEEDED (after restarting the environment with `SPRING_PROFILES_ACTIVE=demo` — the running process had an empty H2 instance; restart is environment-only, no code touched).
- **Recommended F7:** Customer Reviews & Contractor Ratings as above.
- Standing by for approval before any implementation step.