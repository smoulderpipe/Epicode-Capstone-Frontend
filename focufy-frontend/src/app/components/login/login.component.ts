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
  isModalOpen: boolean = false;
  modalTitle: string = '';
  modalDescription: string = '';

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

          const userId = this.authService.getUserId();

          if (userId) {
            this.studyPlanService.getStudyPlan(userId).subscribe({
              next: (studyPlan) => {
                if (studyPlan) {
                  this.router.navigate(['/study-plan']).then(() => {
                    this.isLoading = false;
                  });
                } else {
                  this.router.navigate(['/survey']).then(() => {
                    this.isLoading = false;
                  });
                }
              },
              error: (error) => {
                console.error('Error while checking study plan:', error);
                this.router.navigate(['/survey']).then(() => {
                  this.isLoading = false;
                });
              }
            });
          } else {
            console.error('User ID not found');
            this.modalTitle = "Oops!";
            this.modalDescription = "We couldn't find an account with that email. Want to try again?";
            this.openModal();
          }
        },
        error: (error) => {
          console.error('Login Error:', error)
          
          // alert(error);
          this.modalTitle = "Oops!"
          if(error.status == 404) {
            this.modalDescription = "We couldn't find an account with that email. Want to try again?";
          }
          this.openModal();
          this.isLoading = false;
        }
      });
    } else {
      console.log("Invalid form");
      alert('Invalid form');
    }
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

}



