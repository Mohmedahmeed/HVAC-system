import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole, ROLE_DASHBOARDS } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const userRole = this.authService.getUserRole();
    const requiredRoles: UserRole[] = route.data['roles'] || (route.data['role'] ? [route.data['role']] : []);

    if (requiredRoles.length === 0) {
      return true;
    }

    if (userRole && requiredRoles.includes(userRole)) {
      return true;
    }

    const redirectPath = ROLE_DASHBOARDS[userRole || ''] || '/home';
    this.router.navigate([redirectPath]);
    return false;
  }
}
