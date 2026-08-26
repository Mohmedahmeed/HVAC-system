import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PublicGuard } from './public.guard';
import { AuthService } from '../services/auth.service';

describe('PublicGuard', () => {
  let guard: PublicGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PublicGuard,
        AuthService,
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
      ],
    });
    guard = TestBed.inject(PublicGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('allows unauthenticated user', () => {
    expect(guard.canActivate()).toBeTrue();
  });

  it('redirects authenticated CUSTOMER to /customer/dashboard', () => {
    const user = { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'CUSTOMER', isActive: true };
    localStorage.setItem('choufli_hal_token', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.sig');
    localStorage.setItem('choufli_hal_user', JSON.stringify(user));

    expect(guard.canActivate()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/customer/dashboard']);
  });

  it('redirects authenticated CONTRACTOR to /contractor/dashboard', () => {
    const user = { id: 1, email: 'cont@test.com', firstName: 'Test', lastName: 'Cont', role: 'CONTRACTOR', isActive: true };
    localStorage.setItem('choufli_hal_token', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0Iiwicm9sZSI6IkNPTlRSQUNUT1IiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.sig');
    localStorage.setItem('choufli_hal_user', JSON.stringify(user));

    expect(guard.canActivate()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/contractor/dashboard']);
  });

  it('redirects authenticated ADMIN to /admin/dashboard', () => {
    const user = { id: 1, email: 'admin@test.com', firstName: 'Test', lastName: 'Admin', role: 'ADMIN', isActive: true };
    localStorage.setItem('choufli_hal_token', 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.sig');
    localStorage.setItem('choufli_hal_user', JSON.stringify(user));

    expect(guard.canActivate()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });
});
