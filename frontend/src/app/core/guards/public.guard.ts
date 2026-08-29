import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROLE_DASHBOARDS } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class PublicGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    const role = this.authService.getUserRole();
    const redirectPath = ROLE_DASHBOARDS[role || ''] || '/';
    this.router.navigate([redirectPath]);
    return false;
  }
}
