import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent implements OnInit, OnDestroy {
  @Input() layout: 'customer' | 'contractor' | 'admin' = 'customer';
  @Input() sidebarOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: User | null = null;
  private subscription = new Subscription();

  customerNavLinks = [
    { label: 'Dashboard', route: '/customer/dashboard', icon: 'dashboard', disabled: false },
    { label: 'My Requests', route: '/customer/requests', icon: 'list_alt', disabled: false },
    { label: 'Appointments', route: '/customer/appointments', icon: 'event', disabled: true },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get userInitials(): string {
    if (!this.currentUser) return '';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  get displayName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  get roleLabel(): string {
    if (!this.currentUser) return '';
    const labels: Record<UserRole, string> = {
      CUSTOMER: 'Homeowner',
      CONTRACTOR: 'Contractor',
      ADMIN: 'Admin',
    };
    return labels[this.currentUser.role] || '';
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
