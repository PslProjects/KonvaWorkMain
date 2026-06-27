import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class MasterGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {

    const allowed = sessionStorage.getItem('masterAccess') === 'true';

    if (!allowed) {
      this.router.navigate(['/admin-login']);
      return false;
    }

    return true;
  }
}
