import { Component, Injectable } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';

// ─── Stub components (marker per resolved view) ────────────────

@Component({ template: '<p>DASHBOARD</p>' })
class StubDashboardComponent {}

@Component({ template: '<p>PUBLIC_PROFILE</p>' })
class StubPublicProfileComponent {}

@Component({ template: '<p>LEADS</p>' })
class StubLeadsComponent {}

@Component({ template: '<div><router-outlet></router-outlet></div>' })
class StubHostComponent {}

// ─── Recording guard (mirrors AuthGuard/RoleGuard placement) ──

@Injectable()
class ProbeGuard implements CanActivate {
  guarded: string[] = [];
  canActivate(route: ActivatedRouteSnapshot): boolean {
    this.guarded.push(route.url.map((s) => s.path).join('/'));
    return true;
  }
}

// ─── The real route structure being verified ──────────────────
//
// The guarded /contractor group is declared BEFORE the public /contractor/:id
// route. Angular matches routes in declaration order and only activates a
// group if a literal child matches the full remaining path. So:
//   /contractor/dashboard  -> guarded group (child "dashboard")
//   /contractor/leads      -> guarded group (child "leads")
//   /contractor/999        -> NO literal child matches "999" -> falls through
//                             to the public /contractor/:id route (UNGUARDED)

function buildRoutes() {
  return [
    {
      path: 'contractor',
      canActivate: [ProbeGuard],
      children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard', component: StubDashboardComponent },
        { path: 'leads', component: StubLeadsComponent },
        { path: 'portfolio', component: StubDashboardComponent },
      ],
    },
    { path: 'contractor/:id', component: StubPublicProfileComponent },
  ];
}

describe('Contractor route precedence (/contractor/:id vs guarded /contractor/*)', () => {
  let fixture: ComponentFixture<StubHostComponent>;
  let router: Router;
  let guard: ProbeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        StubHostComponent,
        StubDashboardComponent,
        StubPublicProfileComponent,
        StubLeadsComponent,
      ],
      providers: [ProbeGuard],
      imports: [
        RouterTestingModule.withRoutes(buildRoutes()),
      ],
    });

    fixture = TestBed.createComponent(StubHostComponent);
    router = TestBed.inject(Router);
    guard = TestBed.inject(ProbeGuard);
    fixture.detectChanges();
  });

  it('routes /contractor/dashboard to the guarded dashboard (guard ran)', fakeAsync(() => {
    router.navigateByUrl('/contractor/dashboard');
    tick();
    fixture.detectChanges();
    expect(guard.guarded).toContain('contractor/dashboard');
    expect(fixture.nativeElement.textContent).toContain('DASHBOARD');
  }));

  it('routes /contractor/leads to the guarded leads (guard ran)', fakeAsync(() => {
    router.navigateByUrl('/contractor/leads');
    tick();
    fixture.detectChanges();
    expect(guard.guarded).toContain('contractor/leads');
    expect(fixture.nativeElement.textContent).toContain('LEADS');
  }));

  it('routes /contractor/999 to the PUBLIC /contractor/:id profile (guard did NOT run)', fakeAsync(() => {
    router.navigateByUrl('/contractor/999');
    tick();
    fixture.detectChanges();
    expect(guard.guarded).not.toContain('contractor/999');
    expect(fixture.nativeElement.textContent).toContain('PUBLIC_PROFILE');
  }));

  it('keeps the guarded group from swallowing the public numeric id', fakeAsync(() => {
    const location = TestBed.inject(Location);
    router.navigateByUrl('/contractor/123');
    tick();
    fixture.detectChanges();
    expect(location.path()).toBe('/contractor/123');
    expect(fixture.nativeElement.textContent).toContain('PUBLIC_PROFILE');
  }));
});
