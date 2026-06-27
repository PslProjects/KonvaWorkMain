import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-master-verify',
  templateUrl: './admin-master-verify.component.html',
  styleUrls: ['./admin-master-verify.component.css']
})
export class AdminMasterVerifyComponent implements OnInit {

  username = '';
  password = '';
  masterPin = '';
  errorMessage = '';
  role = 'ADMIN';
  purpose = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // ✅ read ONCE
    this.purpose = this.route.snapshot.queryParamMap.get('purpose') || '';


    if (!this.purpose) {
      this.showError('Invalid operation');
      setTimeout(() => {
        this.router.navigate(['/admin-login']);
      }, 1500);
    }
  }

 verify() {

  if (!this.username || !this.password || !this.masterPin) {
    this.showError('All fields are required');
    return;
  }

  this.http.post('/api/admin/authorize', {
    username: this.username,
    password: this.password,
    masterPin: this.masterPin,
    role: this.role
  }).subscribe({
    next: (res: any) => {


      if (res.message !== 'Authorized') {
        this.showError('Authorization failed');
        return;
      }

      // ✅ TEMP permission for guard
      sessionStorage.setItem('masterAccess', 'true');

      if (this.purpose === 'ADD_ADMIN') {
        this.router.navigate(['/add-admin']);
      }
      else if (this.purpose === 'ADD_USER') {
        this.router.navigate(['/add-user']);
      }
      else {
        this.showError('Invalid operation');
      }

    },
    error: err => {
      this.showError(err.error?.message || 'Authorization failed');
    }
  });
}

  showError(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 2000);
  }
}
