import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  sidebarOpen = true;
  isMobile = false;
  private subscription = new Subscription();

  navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Users', route: '/admin/users', icon: 'people', disabled: true },
    { label: 'Contractors', route: '/admin/contractors', icon: 'engineering', disabled: true },
    { label: 'Requests', route: '/admin/requests', icon: 'description', disabled: true },
  ];

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.subscription.add(
      this.breakpointObserver.observe([Breakpoints.TabletPortrait, Breakpoints.Handset]).subscribe((result) => {
        this.isMobile = result.matches;
        if (this.isMobile) {
          this.sidebarOpen = false;
        } else {
          this.sidebarOpen = true;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onToggleSidebar(): void {
    if (this.isMobile && this.sidenav) {
      this.sidenav.toggle();
    } else {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }

  onSidenavClosed(): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }
}
