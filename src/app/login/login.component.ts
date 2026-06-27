import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  username: string = "";
  password: string = "";
  errorMessage: string = "";

  // ✅ NEW: login type (circuit / tpc)
  loginType: string = "circuit";

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute   // ✅ NEW
  ) {}

  // ✅ NEW: read type from URL
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.loginType = params['type'] || 'circuit';
    });
  }

  goToAddUser() {
    this.router.navigate(['/admin-verify'], {
      queryParams: { purpose: 'ADD_USER' }
    });
  }

  login() {
    this.http.post('/api/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res: any) => {

        if (res?.token) {

          // ✅ Always trust backend response
          sessionStorage.setItem("token", res.token);
          sessionStorage.setItem("username", res.username);
          sessionStorage.setItem("role", res.role);

          // 🔥 IMPORTANT CHANGE (routing logic)
          if (this.loginType === 'tpc') {
            this.router.navigate(['/tpc-dashboard']);   // 👉 TPC user
          } else {
            this.router.navigate(['/canvas']);          // 👉 Circuit user (existing)
          }
        }
        else {
          this.showError("Invalid user credentials");
        }
      },

      error: (err) => {
        const message =
          err?.error?.message || "Invalid user credentials";
        this.showError(message);
      }
    });
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = "", 2000);
  }
}