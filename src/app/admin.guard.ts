import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

canActivate(): boolean {

  const role = sessionStorage.getItem("role");

  if (role === 'ADMIN') {
    return true; // admin allowed
  }

  alert("Please login as admin to access this tab");
  this.router.navigate(['/admin-login']);
  return false;
}

}
