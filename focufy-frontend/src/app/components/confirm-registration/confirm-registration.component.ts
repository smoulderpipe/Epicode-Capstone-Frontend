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
            this.isLoading = false;
            this.modalTitle = "Welcome aboard!";
            this.modalDescription = "Log in and see what awaits you...";
            this.openModal().then(() => {
              this.router.navigateByUrl('/login');
            });
          },
          error: (error) => {
            this.isLoading = false;
            alert('There was an error confirming your registration. Please try again later.');
            console.error('Error during registration confirmation', error);
          }
        });
      } else {
        alert('Invalid confirmation token.');
        this.router.navigate(['/login']);
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
