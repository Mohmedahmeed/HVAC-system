import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  template: `
<div class="profile-container">
  <h2>My Profile</h2>
  <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
    <mat-form-field>
      <input matInput formControlName="firstName" placeholder="First Name">
    </mat-form-field>
    <mat-form-field>
      <input matInput formControlName="email" placeholder="Email">
    </mat-form-field>
    <mat-form-field>
      <input matInput formControlName="phone" placeholder="Phone">
    </mat-form-field>
    <button mat-raised-button color="primary" type="submit">Save</button>
  </form>
</div>
  `,
  styles: [`
.profile-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
}
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName,
        email: this.currentUser.email,
        phone: this.currentUser.phone ?? '',
      });
    }
  }

  updateProfile() {
    if (this.profileForm.valid) {
      alert('Profile update not yet implemented.');
    }
  }
}
