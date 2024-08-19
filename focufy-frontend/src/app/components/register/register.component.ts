import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { passwordMatchValidator } from 'src/app/validators/validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  private baseUrl = 'http://localhost:8080/auth/register';

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),
      passwordConf: new FormControl(null, [
        Validators.required,
        Validators.minLength(8), Validators.maxLength(30),
        passwordMatchValidator('password')
      ])
    });

    this.registerForm.get('password')?.valueChanges.subscribe(passwordValue => {
      this.registerForm.get('passwordConf')?.updateValueAndValidity();
    });
  }

  onSubmit() {

    if (this.registerForm.valid) {
      const user: User = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.isLoading = true;

      this.authService.register(user).subscribe(
        (response: any) => {
          this.isLoading = false;
          const successMessage = response.body.message;
          alert(successMessage);
          this.router.navigateByUrl('/login');
        },
        error => {
          this.isLoading = false;
          if (error.status === 400 && error.error.message === `Email ${user.email} is already in use.`) {
            this.errorMessage = error;
          } else {
            console.error('Error while creating user:', error);
            this.errorMessage = error;
          }
        }
      );
    } else {
      console.error('The form is not valid!');
    }
  }
}
