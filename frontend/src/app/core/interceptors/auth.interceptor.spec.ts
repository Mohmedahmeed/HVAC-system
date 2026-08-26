import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthInterceptor, AuthService],
    });
    interceptor = TestBed.inject(AuthInterceptor);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('attaches Bearer token to authenticated requests', () => {
    localStorage.setItem('choufli_hal_token', 'test-token-123');

    const req = {
      url: 'http://localhost:8081/api/v1/service-requests',
      clonedSetHeaders: {} as any,
      clone: jasmine.createSpy('clone').and.callFake((opts: any) => ({
        url: req.url,
        ...opts,
      })),
    } as any;

    const next = {
      handle: jasmine.createSpy('handle'),
    } as any;

    interceptor.intercept(req, next);

    expect(req.clone).toHaveBeenCalled();
    const clonedArg = req.clone.calls.mostRecent().args[0];
    expect(clonedArg.setHeaders['Authorization']).toBe('Bearer test-token-123');
  });

  it('does not attach token to login requests', () => {
    localStorage.setItem('choufli_hal_token', 'test-token-123');

    const req = {
      url: 'http://localhost:8081/api/v1/auth/login',
      clone: jasmine.createSpy('clone').and.callFake(() => req),
    } as any;

    const next = { handle: jasmine.createSpy('handle') } as any;

    interceptor.intercept(req, next);

    expect(req.clone).not.toHaveBeenCalled();
  });

  it('does not attach token to register requests', () => {
    localStorage.setItem('choufli_hal_token', 'test-token-123');

    const req = {
      url: 'http://localhost:8081/api/v1/auth/register/customer',
      clone: jasmine.createSpy('clone').and.callFake(() => req),
    } as any;

    const next = { handle: jasmine.createSpy('handle') } as any;

    interceptor.intercept(req, next);

    expect(req.clone).not.toHaveBeenCalled();
  });

  it('passes request through when no token', () => {
    const req = {
      url: 'http://localhost:8081/api/v1/service-requests',
      clone: jasmine.createSpy('clone'),
    } as any;

    const next = { handle: jasmine.createSpy('handle') } as any;

    interceptor.intercept(req, next);

    expect(req.clone).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledWith(req);
  });
});
