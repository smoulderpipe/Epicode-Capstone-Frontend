import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoadingComponent: boolean = false;
  isModalOpen: boolean = false;
  modalTitle: string = '';
  modalDescription: string = '';
  modalImage: string = '';
  hasOkButton: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private studyPlanService: StudyPlanService,
    private modalService: ModalService
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

      this.isLoadingComponent = true;

      this.authService.login(credentials.email, credentials.password).subscribe({
        next: (token) => {
          const userId = this.authService.getUserId();

          if (userId) {
            this.studyPlanService.getStudyPlan(userId).subscribe({
              next: (studyPlan) => {
                if (studyPlan) {
                  this.router.navigate(['/study-plan']).then(() => {
                  });
                } else {
                  this.router.navigate(['/survey']).then(() => {
                  });
                }
                
              },
              error: (error) => {
                console.error('Error while checking study plan:', error);
                this.router.navigate(['/survey']).then(() => {
                  
                });
              }
            });
          } else {
            console.error('User ID not found');
            this.modalTitle = "Oops!";
            this.modalImage = "../../../assets/img/confused-bull.png";
            this.modalDescription = "We couldn't find an account with that email. Want to try again?";
            this.hasOkButton = true;
            this.openModal();
            
          }
        },
        error: (error: any) => {
          this.modalTitle = "Oops!";
          this.modalImage = "../../../assets/img/confused-bull.png";
          this.hasOkButton = true;
          if (error.status === 'NOT_FOUND') {
            this.modalDescription = "We couldn't find an account with that email... Want to try again?";
          } else if (error.status === 'UNAUTHORIZED'){
            this.modalDescription = 'You password is incorrect, check your credentials and try again.';
          } else if (error.status === 'FORBIDDEN') {
            this.modalDescription = "Did you forget to click the link we sent you via email? We really need that click to get you in, don't miss out!"
          } else {
            this.modalDescription = "An unexpected error occurred. Please try again later.";
          }

          this.openModal();
          
        }
      });
    } else {
      console.log("Invalid form");
      alert('Invalid form');
    }
  }

  onForgotPassword(){
    this.isLoadingComponent = true;
    this.router.navigate(['/forgot-password']);
  }

  openModal(): Promise<void> {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = this.modalImage;

      img.onload = () => {
        this.isLoadingComponent = false;
        this.modalService.openModal(this.modalTitle, this.modalDescription, this.modalImage);
        const subscription = this.modalService.modalClosed$.subscribe(closed => {
          if (closed) {
            subscription.unsubscribe();
            resolve();
          }
        })
      };

      img.onerror = () => {
        console.error("Error loading image.");
        this.isLoadingComponent = false;
        this.modalService.openModal(this.modalTitle, this.modalDescription, this.modalImage);
        const subscription = this.modalService.modalClosed$.subscribe(closed => {
          if (closed) {
            subscription.unsubscribe();
            resolve();
          }
        })
      };

    });
  }

  closeModal() {
    this.modalService.closeModal();
  }

}



