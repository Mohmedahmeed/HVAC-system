import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { RegisterContractorComponent } from './components/register-contractor/register-contractor.component';
import { HomeComponent } from './components/home/home.component';

import { CustomerLayoutComponent } from './core/layouts/customer-layout/customer-layout.component';
import { ContractorLayoutComponent } from './core/layouts/contractor-layout/contractor-layout.component';
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component';

import { CustomerDashboardPlaceholderComponent } from './components/placeholders/customer-dashboard-placeholder/customer-dashboard-placeholder.component';
import { CustomerAppointmentsComponent } from './components/customer/appointments/customer-appointments.component';
import { NewRequestComponent } from './components/customer/new-request/new-request.component';
import { RequestListComponent } from './components/customer/requests/request-list/request-list.component';
import { RequestDetailComponent } from './components/customer/requests/request-detail/request-detail.component';

import { ContractorDashboardComponent } from './components/contractor/contractor-dashboard/contractor-dashboard.component';
import { LeadInboxComponent } from './components/contractor/lead-inbox/lead-inbox.component';
import { LeadDetailComponent } from './components/contractor/lead-detail/lead-detail.component';
import { AppointmentListComponent } from './components/contractor/appointment-list/appointment-list.component';
import { ContractorProfileComponent } from './components/contractor/contractor-profile/contractor-profile.component';
import { ServiceAreasComponent } from './components/contractor/service-areas/service-areas.component';
import { AvailabilityComponent } from './components/contractor/availability/availability.component';
import { ContractorReviewsComponent } from './components/contractor/reviews/contractor-reviews/contractor-reviews.component';
import { ContractorPortfolioComponent } from './components/contractor/portfolio/contractor-portfolio.component';

import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';

import { PublicContractorProfileComponent } from './components/public/contractor-profile/public-contractor-profile.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { PublicGuard } from './core/guards/public.guard';

const routes: Routes = [
  // ─── Public ────────────────────────────────────────────────
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', redirectTo: '/', pathMatch: 'full' },
  { path: 'login', component: LogInComponent, canActivate: [PublicGuard] },
  { path: 'register', redirectTo: 'register/customer', pathMatch: 'full' },
  { path: 'register/customer', component: RegisterComponent, canActivate: [PublicGuard] },
  { path: 'register/contractor', component: RegisterContractorComponent, canActivate: [PublicGuard] },

  // ─── Customer (protected) ─────────────────────────────────
  {
    path: 'customer',
    component: CustomerLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'CUSTOMER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardPlaceholderComponent },
      { path: 'request/new', component: NewRequestComponent },
      { path: 'requests', component: RequestListComponent },
      { path: 'requests/:id', component: RequestDetailComponent },
      { path: 'appointments', component: CustomerAppointmentsComponent },
    ],
  },

  // ─── Contractor (protected) ───────────────────────────────
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
      { path: 'portfolio', component: ContractorPortfolioComponent },
      { path: 'profile', component: ContractorProfileComponent },
      { path: 'service-areas', component: ServiceAreasComponent },
      { path: 'availability', component: AvailabilityComponent },
      { path: 'reviews', component: ContractorReviewsComponent },
    ],
  },

  // ─── Admin (protected) ────────────────────────────────────
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
    ],
  },

  // ─── Public Contractor Profile ─────────────────────────────
  // Declared AFTER the guarded /contractor group so that literal child
  // routes there (/contractor/dashboard, /contractor/leads, ...) resolve to
  // the guarded group first, while /contractor/:id falls through to this
  // public route (no literal child matches a numeric id).
  { path: 'contractor/:id', component: PublicContractorProfileComponent },

  // ─── Wildcard ─────────────────────────────────────────────
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
