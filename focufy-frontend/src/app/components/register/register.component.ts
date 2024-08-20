import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
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
  isModalOpen: boolean = false;
  modalTitle: string = '';
  modalDescription: string = '';
  modalImage: string = '';

  private baseUrl = 'http://localhost:8080/auth/register';

  constructor(private http: HttpClient, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef, private modalService: ModalService) {
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
          this.modalDescription = "Good news! Check your email to confirm your registration.";
          this.modalTitle = 'Almost there...';
          this.modalImage = '../../../assets/img/mail-confirmation-image.png';
          this.openModal().then(() => {
            this.router.navigateByUrl('/login');
          });
        },
        error => {
          this.isLoading = false;
          if (error.status === 400 && error.error.message === `Email ${user.email} is already in use.`) {
            this.errorMessage = error;
          } else {
            console.error('Error while creating user:', error);
            this.errorMessage = error;
          }
          this.openModal();
        }
      );
    } else {
      console.error('The form is not valid!');
    }
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
