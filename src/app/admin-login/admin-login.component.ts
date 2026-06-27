import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {

  username = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

loginAdmin() {
  this.http.post('/api/admin/login', {
    username: this.username,
    password: this.password
  }).subscribe({
    next: (res: any) => {

      if (res?.token && res?.role === 'ADMIN') {

        sessionStorage.setItem("token", res.token);
        sessionStorage.setItem("role", "ADMIN");
        sessionStorage.setItem("username", res.username);

        this.router.navigate(['/fault-detection']);
      }
    },

    error: (err) => {

      // 🧠 Read backend message
      const message =
        err?.error?.message || 'Admin login failed';

      this.showError(message);
    }
  });
}


  showError(message: string) {
    this.errorMessage = message;

    setTimeout(() => {
      this.errorMessage = "";
    }, 2000); // hide after 2 sec
  }
goToAddAdmin() {
  this.router.navigate(['/admin-verify'], {
    queryParams: { purpose: 'ADD_ADMIN' }
  });
}


}
