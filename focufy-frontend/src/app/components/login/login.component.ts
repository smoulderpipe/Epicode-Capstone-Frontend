import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
   loginForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private studyPlanService: StudyPlanService
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

          // Ottieni l'ID dell'utente dall'AuthService
          const userId = this.authService.getUserId();

          if (userId) {
            // Controlla se l'utente ha un piano di studio assegnato
            this.studyPlanService.getStudyPlan(userId).subscribe({
              next: (studyPlan) => {
                if (studyPlan) {
                  this.router.navigate(['/study-plan']);
                } else {
                  this.router.navigate(['/survey']);
                }
              },
              error: (error) => {
                console.error('Errore durante il controllo del piano di studio:', error);
                this.router.navigate(['/survey']);
              }
            });
          } else {
            console.error('User ID not found');
            this.router.navigate(['/survey']);
          }
        },
        error: (error) => {
          console.log("Errore durante il login:", error);
        }
      });
    } else {
      console.log("Form non valido!");
    }
  }
}



