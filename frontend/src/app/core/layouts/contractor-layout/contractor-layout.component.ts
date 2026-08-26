import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contractor-layout',
  templateUrl: './contractor-layout.component.html',
  styleUrls: ['./contractor-layout.component.css'],
})
export class ContractorLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  sidebarOpen = true;
  isMobile = false;
  private subscription = new Subscription();

  navItems = [
    { label: 'Dashboard', route: '/contractor/dashboard', icon: 'dashboard' },
    { label: 'Leads', route: '/contractor/leads', icon: 'work', disabled: true },
    { label: 'Appointments', route: '/contractor/appointments', icon: 'event', disabled: true },
    { label: 'Portfolio', route: '/contractor/portfolio', icon: 'photo_library', disabled: true },
    { label: 'Reviews', route: '/contractor/reviews', icon: 'star', disabled: true },
  ];

  settingsItems = [
    { label: 'Profile', route: '/contractor/profile', icon: 'person', disabled: true },
    { label: 'Service Areas', route: '/contractor/service-areas', icon: 'location_on', disabled: true },
    { label: 'Availability', route: '/contractor/availability', icon: 'schedule', disabled: true },
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
