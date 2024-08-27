import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UpdateUserCredentials } from 'src/app/models/updateUserCredentials';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { passwordMatchValidator } from 'src/app/validators/validators';

@Component({
  selector: 'app-change-credentials',
  templateUrl: './change-credentials.component.html',
  styleUrls: ['./change-credentials.component.scss']
})
export class ChangeCredentialsComponent implements OnInit, AfterViewInit{
  userId!: number;
  errorMessage: string | null = null;
  updatePasswordForm!: FormGroup;
  updateUsernameForm!: FormGroup;
  isLoadingComponent: boolean = false;
  isModalOpen: boolean = false;
  modalTitle: string = '';
  modalDescription: string = '';
  modalImage: string = '';
  hasOkButton: boolean = false;
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoadingComponent = true;
   
    this.updatePasswordForm = new FormGroup({
      password: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),
      passwordConf: new FormControl(null, [
        Validators.required,
        Validators.minLength(8), Validators.maxLength(30),
        passwordMatchValidator('password')
      ])
    });
    this.updateUsernameForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(20)])
    });

    // this.loadData().then(() => {
    //   window.scrollTo(0, 0);
    // });

    this.loadData();

  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    window.scrollTo(0,0);
  }

  private async loadData(): Promise<void> {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userId = userId;
      try {
        this.user = await this.authService.getUserDetails(userId).toPromise() || null;
        this.updateUsernameForm.patchValue({ name: this.user?.name || '' });
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        this.isLoadingComponent = false;
      }
    } else {
      console.error('User ID not found');
      this.isLoadingComponent = false;
    }
  }

  onUpdateUsername(userId: number): void {
    if (this.updateUsernameForm && this.updateUsernameForm.valid) {
      const newUsername = this.updateUsernameForm.value.name;
      this.isLoadingComponent = true;
      const updateDTO: UpdateUserCredentials = {
        name: newUsername
      };
  
      this.authService.changeCredentials(userId, updateDTO)
        .subscribe(response => {
          console.log('Username updated', response);
          this.isModalOpen = true;
          this.modalTitle = 'Boom!';
          this.modalDescription = "Username updated, you're good to go!";
          this.hasOkButton = true;
          this.modalImage = "../../../assets/img/thumbs-up-image.png";
          this.openModal();
          this.isLoadingComponent = false;
        }, error => {
          console.error('Error updating username:', error);
          this.isModalOpen = true;
          this.modalTitle = 'Oops!';
          this.modalDescription = 'We ran into an issue updating your username. Maybe try again later?';
          this.modalImage = "../../../assets/img/confused-bull.png";
          this.hasOkButton = true;
          this.openModal();
          this.isLoadingComponent = false;
        });
    }
  }

  onUpdatePassword(userId: number): void {
    if(this.updateUsernameForm && this.updateUsernameForm.valid) {
      const newPassword = this.updatePasswordForm.value.password;
      this.isLoadingComponent = true;
      const updateDto: UpdateUserCredentials = {
        password: newPassword
      };

      this.authService.changeCredentials(userId, updateDto)
      .subscribe(response => {
        console.log('Password updated', response);
        this.isModalOpen = true;
        this.modalTitle = "Boom!";
        this.modalDescription = "Password updated, you're good to go!";
        this.hasOkButton = true;
        this.modalImage = "../../../assets/img/thumbs-up-image.png";
        this.openModal();
        
      }, error => {
        console.error("Error updating password", error);
        this.isModalOpen = true;
        this.modalTitle = "Oops!";
        this.modalDescription = "We ran into an issue updating your password. Maybe try again later?";
        this.modalImage = "../../../assets/img/confused-bull.png";
        this.hasOkButton = true;
        this.openModal();
        
      })
    }
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
