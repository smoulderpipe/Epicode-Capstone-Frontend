import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-confirm-registration',
  templateUrl: './confirm-registration.component.html',
  styleUrls: ['./confirm-registration.component.scss']
})
export class ConfirmRegistrationComponent implements OnInit {

  isLoading = false;

  modalTitle: string = '';
  modalDescription: string = '';
  modalImage: string = '';
  hasOkButton: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        this.isLoading = true;
        this.authService.confirmRegistration(token).subscribe({
          next: (response: string) => {
            this.isLoading = true;
            this.modalTitle = "Welcome aboard!";
            this.modalDescription = "Log in and see what awaits you...";
            this.modalImage = "../../../assets/img/thumbs-up-image.png";
            this.hasOkButton = true;
            this.openModal().then(() => {
              this.router.navigateByUrl('/login');
            });
          },
          error: (error) => {
            this.isLoading = true;
            this.modalTitle = "Oops!";
            this.modalDescription = "There was an error confirming your registration, are you sure you clicked on the right link?";
            this.modalImage = "../../../assets/img/confused-bull.png";
            this.hasOkButton = true;
            this.openModal().then(() => {
              this.router.navigateByUrl('/');
            });
            console.error('Error during registration confirmation', error);
          }
        });
      } else {
        this.isLoading = true;
        this.modalTitle = "Oops!";
        this.modalDescription = "There was an error confirming your registration, are you sure you clicked on the right link?";
        this.modalImage = "../../../assets/img/confused-bull.png";
        this.hasOkButton = true;
        this.openModal().then(() => {
          this.router.navigateByUrl('/');
        });
        console.error('Invalid confirmation token.');
      }
    });
  }

  openModal(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.modalService.openModal(this.modalTitle, this.modalDescription, this.modalImage);
      this.modalService.modalClosed$.subscribe(closed => {
        if (closed) {
          resolve();
        }
      });
    });
  }

  closeModal() {
    this.modalService.closeModal();
  }
}
