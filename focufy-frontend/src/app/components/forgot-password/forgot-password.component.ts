import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  errorMessage: string | null = null;
  requestNewPasswordForm!: FormGroup;
  isLoadingComponent: boolean = false;
  isModalOpen: boolean = false;
  modalTitle: string = '';
  modalDescription: string = '';
  modalImage: string = '';
  hasOkButton: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.requestNewPasswordForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email])
    });
  }

  onSubmit() {
    if (this.requestNewPasswordForm && this.requestNewPasswordForm.valid) {
      const email = this.requestNewPasswordForm.value.email;

      this.isLoadingComponent = true;

      this.authService.requestNewPassword(email).subscribe(
        (response: string) => {
        this.modalDescription = "If the email you provided is in our system, we've got you covered. Check your inbox shortly, and you'll find an email with your new password.";
        this.modalTitle = 'Great news!';
        this.modalImage = '../../../assets/img/mail-confirmation-image.png';
        this.hasOkButton = true;
        this.openModal().then(() => {
          this.router.navigateByUrl('/login');
        });
        },
        (error: Error) => {
        this.modalTitle = 'Oops!';
        this.modalImage = '../../../assets/img/confused-bull.png';
        this.hasOkButton = true;
        if (error.message = 'User not found') {
          this.modalDescription = "We couldn't find an account with that email... Want to try again?";
        } else if (error.message === 'An unexpected error occurred. Please try again later') {
          this.modalDescription = 'An unexpected error occurred. Please try again later.';
        } else {
          this.modalDescription = "An unexpected error occurred. Please try again later.";
        }
        this.openModal();
        }
      );
    
    } else {
      console.error('The form is not valid');
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



