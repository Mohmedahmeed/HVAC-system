import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ROLE_DASHBOARDS } from '../../core/models/user.model';

@Component({
  selector: 'app-register-contractor',
  templateUrl: './register-contractor.component.html',
  styleUrls: ['./register-contractor.component.css'],
})
export class RegisterContractorComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get firstName() {
    return this.registerForm.get('firstName')!;
  }

  get lastName() {
    return this.registerForm.get('lastName')!;
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get firstNameError(): string {
    if (this.firstName.hasError('required')) return 'First name is required';
    return '';
  }

  get lastNameError(): string {
    if (this.lastName.hasError('required')) return 'Last name is required';
    return '';
  }

  get emailError(): string {
    if (this.email.hasError('required')) return 'Email is required';
    if (this.email.hasError('email')) return 'Enter a valid email address';
    return '';
  }

  get passwordError(): string {
    if (this.password.hasError('required')) return 'Password is required';
    if (this.password.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { firstName, lastName, email, password } = this.registerForm.value;

    this.authService
      .registerContractor(email, password, firstName, lastName)
      .pipe(
        switchMap(() => this.authService.login(email, password))
      )
      .subscribe({
        next: (loginRes) => {
          this.isLoading = false;
          this.navigateByRole(loginRes.role);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 409 || (err.error?.message && err.error.message.includes('already exists'))) {
            this.errorMessage = 'An account with this email already exists.';
          } else if (err.status === 400) {
            this.errorMessage = 'Please check your information and try again.';
          } else {
            this.errorMessage = 'Something went wrong. Please try again.';
          }
        },
      });
  }

  private navigateByRole(role: string): void {
    const path = ROLE_DASHBOARDS[role] || '/contractor/dashboard';
    this.router.navigate([path]);
  }
}
