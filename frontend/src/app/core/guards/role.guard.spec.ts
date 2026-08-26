import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RoleGuard,
        AuthService,
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
      ],
    });
    guard = TestBed.inject(RoleGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  const validToken = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.sig';

  function fakeRoute(data: any): ActivatedRouteSnapshot {
    return { data } as any;
  }

  it('allows correct role', () => {
    localStorage.setItem('choufli_hal_token', validToken);
    authService.login('test@example.com', 'pw').subscribe();

    // Manually set user with role since login request would fail in test
    // Instead, test by pre-populating localStorage user
    const user = { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER', isActive: true };
    localStorage.setItem('choufli_hal_user', JSON.stringify(user));

    // Create a fresh instance to load from localStorage
    const freshGuard = TestBed.inject(RoleGuard);
    expect(freshGuard.canActivate(fakeRoute({ roles: ['CUSTOMER'] }))).toBeTrue();
  });

  it('blocks incorrect role and redirects', () => {
    const user = { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER', isActive: true };
    localStorage.setItem('choufli_hal_token', validToken);
    localStorage.setItem('choufli_hal_user', JSON.stringify(user));

    const freshGuard = TestBed.inject(RoleGuard);
    expect(freshGuard.canActivate(fakeRoute({ roles: ['CONTRACTOR'] }))).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/customer/dashboard']);
  });

  it('redirects unauthenticated user to /login', () => {
    expect(guard.canActivate(fakeRoute({ roles: ['CUSTOMER'] }))).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('allows access when no roles required', () => {
    const user = { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER', isActive: true };
    localStorage.setItem('choufli_hal_token', validToken);
    localStorage.setItem('choufli_hal_user', JSON.stringify(user));

    const freshGuard = TestBed.inject(RoleGuard);
    expect(freshGuard.canActivate(fakeRoute({}))).toBeTrue();
  });
});
