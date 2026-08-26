import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';
import { NgOptimizedImage } from '@angular/common';

import { AngularMaterialModule } from './angular-material.module';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

import { AppComponent } from './app.component';

// ─── Public ─────────────────────────────────────────────────
import { HomeComponent } from './components/home/home.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { RegisterContractorComponent } from './components/register-contractor/register-contractor.component';

// ─── Layouts ────────────────────────────────────────────────
import { CustomerLayoutComponent } from './core/layouts/customer-layout/customer-layout.component';
import { ContractorLayoutComponent } from './core/layouts/contractor-layout/contractor-layout.component';
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component';

// ─── Shared Navigation ──────────────────────────────────────
import { TopBarComponent } from './components/top-bar/top-bar.component';

// ─── Placeholders ───────────────────────────────────────────
import { CustomerDashboardPlaceholderComponent } from './components/placeholders/customer-dashboard-placeholder/customer-dashboard-placeholder.component';
import { ContractorDashboardPlaceholderComponent } from './components/placeholders/contractor-dashboard-placeholder/contractor-dashboard-placeholder.component';
import { AdminDashboardPlaceholderComponent } from './components/placeholders/admin-dashboard-placeholder/admin-dashboard-placeholder.component';
import { NewRequestComponent } from './components/customer/new-request/new-request.component';

// ─── Legacy (kept temporarily — files not yet deleted) ──────
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProfileComponent } from './components/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    // Public
    HomeComponent,
    LogInComponent,
    RegisterComponent,
    RegisterContractorComponent,
    // Layouts
    CustomerLayoutComponent,
    ContractorLayoutComponent,
    AdminLayoutComponent,
    // Shared navigation
    TopBarComponent,
    // Placeholders
    CustomerDashboardPlaceholderComponent,
    ContractorDashboardPlaceholderComponent,
    AdminDashboardPlaceholderComponent,
    NewRequestComponent,
    // Legacy (kept temporarily)
    NavComponent,
    FooterComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LayoutModule,
    NgOptimizedImage,
    SharedModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
