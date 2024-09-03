import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-confirm-registration',
  templateUrl: './confirm-registration.component.html',
  styleUrls: ['./confirm-registration.component.scss']
})
export class ConfirmRegistrationComponent implements OnInit {

  modalTitle: string = '';
  modalDescription: string = '';
  modalImage: string = '';
  hasOkButton: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        this.loadingService.setLoading(true);
        this.authService.confirmRegistration(token).subscribe({
          next: (response: string) => {
            this.loadingService.setLoading(true);
            this.modalTitle = "Welcome aboard!";
            this.modalDescription = "Log in and see what awaits you...";
            this.modalImage = "../../../assets/img/thumbs-up-image.png";
            this.hasOkButton = true;
            this.openModal().then(() => {
              this.router.navigateByUrl('/login');
            });
          },
          error: (error) => {
            this.loadingService.setLoading(true);
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
        this.loadingService.setLoading(true);
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
      const img = new Image();
      img.src = this.modalImage;

      img.onload = () => {
        this.loadingService.setLoading(false);
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
        this.loadingService.setLoading(false);
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
