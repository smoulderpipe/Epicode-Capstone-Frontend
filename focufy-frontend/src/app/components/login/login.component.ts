import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private studyPlanService: StudyPlanService
  ) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(30)])
    });
  }

  onSubmit() {
    if (this.loginForm && this.loginForm.valid) {
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.isLoading = true;
  
      this.authService.login(credentials.email, credentials.password).subscribe({
        next: (token) => {
          alert('Welcome back!');
  
          const userId = this.authService.getUserId();
  
          if (userId) {
            this.studyPlanService.getStudyPlan(userId).subscribe({
              next: (studyPlan) => {
                if (studyPlan) {
                  this.router.navigate(['/study-plan']);
                } else {
                  this.router.navigate(['/survey']);
                }
              },
              error: (error) => {
                console.error('Error while checking study plan:', error);
                this.router.navigate(['/survey']);
              }
            });
          } else {
            console.error('User ID not found');
            alert('User ID not found.');
          }
        },
        error: (error) => {
          console.error('Login Error:', error)
          alert(error);
        }
      });
    } else {
      console.log("Invalid form");
      alert('Invalid form');
    }
  }
}



