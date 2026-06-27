import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {

  username: string = "";
  password: string = "";
  designation: string = '';

  selectedPhoto: File | null = null;
  photoPreview: string | null = null;

  submitted: boolean = false; // ✅ important

  constructor(private http: HttpClient, private router: Router) { }

  backToLogin() {
    this.router.navigate(['/login']);
  }

  // ✅ Photo Validation
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!file) return;

    // type check
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Only JPG and PNG images are allowed',
      });

      event.target.value = '';
      this.selectedPhoto = null;
      this.photoPreview = null;
      return;
    }

    // size check
    const maxSize = 4 * 1024 * 1024;

    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Image size should not exceed 4MB',
      });

      event.target.value = '';
      this.selectedPhoto = null;
      this.photoPreview = null;
      return;
    }

    // valid file
    this.selectedPhoto = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ✅ Submit
  addUser(form: any) {

    this.submitted = true; // ✅ trigger validation UI

    if (form.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'All fields are required'
      });
      return;
    }

    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('password', this.password);
    formData.append('designation', this.designation);

    if (this.selectedPhoto) {
      formData.append('photo', this.selectedPhoto);
    }

    this.http.post('/api/add-user', formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'User Created Successfully',
          text: 'Redirecting to login...',
          showConfirmButton: false,
          timer: 1800
        });

        // reset
        this.username = "";
        this.password = "";
        this.designation = "";
        this.selectedPhoto = null;
        this.photoPreview = null;
        this.submitted = false;

        form.resetForm();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      },
      error: (err) => {
        const message = err?.error?.message || 'Something went wrong';

        Swal.fire({
          icon: 'error',
          title: 'User Creation Failed',
          text: message
        });
      }
    });
  }
}