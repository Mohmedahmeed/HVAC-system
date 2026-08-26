import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthGuard,
        AuthService,
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
      ],
    });
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  function fakeRoute(overrides: any = {}): ActivatedRouteSnapshot {
    return { data: {}, ...overrides } as any;
  }

  function fakeState(url: string = '/some-page'): RouterStateSnapshot {
    return { url } as RouterStateSnapshot;
  }

  it('allows authenticated user', () => {
    localStorage.setItem('choufli_hal_token', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.sig');

    expect(guard.canActivate(fakeRoute(), fakeState())).toBeTrue();
  });

  it('blocks unauthenticated user and redirects to /login', () => {
    expect(guard.canActivate(fakeRoute(), fakeState())).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('blocks user with expired token', () => {
    const expiredPayload = btoa(JSON.stringify({
      sub: 'test@example.com',
      role: 'CUSTOMER',
      iat: 1000000000,
      exp: 1000000001,
    }));
    localStorage.setItem('choufli_hal_token', `x.${expiredPayload}.sig`);

    expect(guard.canActivate(fakeRoute(), fakeState())).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
