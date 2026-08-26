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
import { ContractorDashboardPlaceholderComponent } from './components/placeholders/contractor-dashboard-placeholder/contractor-dashboard-placeholder.component';
import { AdminDashboardPlaceholderComponent } from './components/placeholders/admin-dashboard-placeholder/admin-dashboard-placeholder.component';
import { NewRequestComponent } from './components/customer/new-request/new-request.component';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { PublicGuard } from './core/guards/public.guard';

const routes: Routes = [
  // ─── Public ────────────────────────────────────────────────
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
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
      { path: 'dashboard', component: ContractorDashboardPlaceholderComponent },
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
      { path: 'dashboard', component: AdminDashboardPlaceholderComponent },
    ],
  },

  // ─── Wildcard ─────────────────────────────────────────────
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
