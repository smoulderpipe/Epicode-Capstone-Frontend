import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { passwordMatchValidator } from 'src/app/validators/validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  private baseUrl = 'http://localhost:8080/auth/register';

  constructor(private http: HttpClient) {
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
    if (this.registerForm && this.registerForm.valid) {
      const user: User = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
  
      this.http.post(this.baseUrl, user)
        .subscribe(
          response => {
            console.log('User successfully created:', response);
            alert('Thank you for your registration!');
            window.location.href = "/login";
          },
          error => {
            if (error.status === 400) {
              const errorMessage = error.error;
              const regex = /Email.*is already in use\./i;
              if (regex.test(errorMessage)) {
                alert('This e-mail is already in use. Try with a different e-mail address.');
              } else {
                console.error('Error while creating user:', error);
                alert('An error occurred, try again later');
              }
            } else {
              console.error('Error while creating user:', error);
              alert('An error occurred, try again later');
            }
          }
        );
    } else {
      console.error('The form is not valid!');
    }
  }


}
