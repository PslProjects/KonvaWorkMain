import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrls: ['./add-admin.component.css']
})
export class AddAdminComponent implements OnInit {

  username = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
  }

  addAdmin() {

  if (!this.username || !this.password) {
    Swal.fire({
      icon: 'warning',
      text: 'All fields are required',
      timer: 1500,
      showConfirmButton: false
    });
    return;
  }

  this.http.post('/api/add-admin', {
    username: this.username,
    password: this.password
  }).subscribe({
    next: () => {
      Swal.fire({
        title: "Success!",
        text: "Admin added successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => {
        this.router.navigate(['/admin-login']);
      }, 1500);
    },

    error: (err) => {

      // 🧠 Read backend error message
      const message =
        err?.error?.message || 'Failed to add admin';

      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonColor: '#d33'
      });
    }
  });
}

}
