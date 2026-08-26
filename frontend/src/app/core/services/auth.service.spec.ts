import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.model';
import { MeResponse } from '../models/user.model';

const MOCK_AUTH_RESPONSE: AuthResponse = {
  token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.fake',
  type: 'Bearer',
  id: 2,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'CUSTOMER',
};

const MOCK_ME_RESPONSE: MeResponse = {
  authenticated: true,
  id: 2,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'CUSTOMER',
  isActive: true,
};

function makeExpiredToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS512' }));
  const payload = btoa(JSON.stringify({
    sub: 'test@example.com',
    role: 'CUSTOMER',
    iat: 1000000000,
    exp: 1000000001, // 1973 — already expired
  }));
  return `${header}.${payload}.fakesig`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // T6: Valid login stores JWT
  it('T6: login stores JWT and user on success', () => {
    service.login('test@example.com', 'pass123').subscribe((res) => {
      expect(res.token).toBeTruthy();
      expect(res.id).toBe(2);
      expect(service.getToken()).toBeTruthy();
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.getCurrentUser()?.email).toBe('test@example.com');
      expect(service.getCurrentUser()?.firstName).toBe('John');
    });

    const req = httpMock.expectOne('http://localhost:8081/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com', password: 'pass123' });
    req.flush(MOCK_AUTH_RESPONSE);
  });

  // T7: Invalid login does not store JWT
  it('T7: login does not store JWT on 401', () => {
    service.login('bad@example.com', 'wrong').subscribe({
      error: () => {
        expect(service.getToken()).toBeNull();
        expect(service.isAuthenticated()).toBeFalse();
        expect(service.getCurrentUser()).toBeNull();
      },
    });

    const req = httpMock.expectOne('http://localhost:8081/api/v1/auth/login');
    req.flush({ message: 'Bad credentials' }, { status: 401, statusText: 'Unauthorized' });
  });

  // T8: getCurrentUser populated after login
  it('T8: currentUser$ emits user after login', (done) => {
    const emitted: any[] = [];
    service.currentUser$.subscribe((u) => emitted.push(u));

    service.login('test@example.com', 'pass123').subscribe(() => {
      const req = httpMock.expectOne('http://localhost:8081/api/v1/auth/login');
      req.flush(MOCK_AUTH_RESPONSE);

      expect(emitted.length).toBeGreaterThanOrEqual(2);
      expect(emitted[emitted.length - 1]?.email).toBe('test@example.com');
      done();
    });
  });

  // T9: logout clears token and user
  it('T9: logout clears token and user state', () => {
    localStorage.setItem('choufli_hal_token', 'fake');
    localStorage.setItem('choufli_hal_user', JSON.stringify({ id: 1 }));

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  // T10: getCurrentUser returns null when not authenticated
  it('T10: getCurrentUser returns null when no token', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  // T11: isTokenExpired detects expired JWT
  it('T11: expired JWT treated as unauthenticated', () => {
    const expiredToken = makeExpiredToken();
    localStorage.setItem('choufli_hal_token', expiredToken);

    const freshService = new AuthService(
      TestBed.inject(HttpClientTestingModule) as any,
      {} as any
    );
    expect(freshService.isAuthenticated()).toBeFalse();
  });

  // T12: getMe populates user from /auth/me
  it('T12: getMe fetches and stores user from /auth/me', () => {
    service.getMe().subscribe((user) => {
      expect(user).toBeTruthy();
      expect(user?.id).toBe(2);
      expect(user?.role).toBe('CUSTOMER');
      expect(service.getCurrentUser()?.email).toBe('test@example.com');
    });

    const req = httpMock.expectOne('http://localhost:8081/api/v1/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_ME_RESPONSE);
  });

  // T13: getMe clears auth on 401
  it('T13: getMe clears auth on 401', () => {
    localStorage.setItem('choufli_hal_token', 'fake');
    localStorage.setItem('choufli_hal_user', JSON.stringify({ id: 1 }));

    service.getMe().subscribe((user) => {
      expect(user).toBeNull();
      expect(service.getToken()).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8081/api/v1/auth/me');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  // T14: No password/passwordHash in localStorage
  it('T14: never stores password or passwordHash', () => {
    service.login('test@example.com', 'secret123').subscribe();

    const req = httpMock.expectOne('http://localhost:8081/api/v1/auth/login');
    req.flush(MOCK_AUTH_RESPONSE);

    const storedKeys = Object.keys(localStorage);
    for (const key of storedKeys) {
      const value = localStorage.getItem(key);
      expect(value).not.toContain('secret123');
      expect(value).not.toContain('password');
      expect(value).not.toContain('passwordHash');
    }
  });

  // T15: registerCustomer sends correct params
  it('T15: registerCustomer sends firstName/lastName as query params', () => {
    service.registerCustomer('new@test.com', 'pw', 'Jane', 'Smith').subscribe();

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8081/api/v1/auth/register/customer'
    );
    expect(req.request.params.get('firstName')).toBe('Jane');
    expect(req.request.params.get('lastName')).toBe('Smith');
    expect(req.request.body).toEqual({ email: 'new@test.com', password: 'pw' });
    req.flush({ ...MOCK_AUTH_RESPONSE, email: 'new@test.com' });
  });

  // T16: registerContractor sends correct params
  it('T16: registerContractor sends firstName/lastName as query params', () => {
    service.registerContractor('cont@test.com', 'pw', 'Bob', 'Builder').subscribe();

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8081/api/v1/auth/register/contractor'
    );
    expect(req.request.params.get('firstName')).toBe('Bob');
    expect(req.request.params.get('lastName')).toBe('Builder');
    expect(req.request.body).toEqual({ email: 'cont@test.com', password: 'pw' });
    req.flush({ ...MOCK_AUTH_RESPONSE, email: 'cont@test.com' });
  });
});
