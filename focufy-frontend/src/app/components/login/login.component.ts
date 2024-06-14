import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
   loginForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required])
    });
  }

  onSubmit() {
    if (this.loginForm && this.loginForm.valid) {
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials.email, credentials.password).subscribe({
        next: (token) => {
          console.log('Login effettuato con successo:', token);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.log("Errore durante il login:", error);
        }
      });
    } else {
      console.log("Form non valido!");
    }
  }


  /* errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: token => {
          console.log('Login effettuato con successo!', token);
          this.router.navigate(['/home']);  // Redirigere alla home o ad un'altra pagina dopo il login
        },
        error: error => {
          console.error('Errore durante il login:', error);
          this.errorMessage = 'Credenziali non valide. Per favore riprova.';
        }
      });
    }
  } */
}
