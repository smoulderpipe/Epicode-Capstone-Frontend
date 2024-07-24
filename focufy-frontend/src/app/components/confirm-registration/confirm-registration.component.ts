import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-confirm-registration',
  templateUrl: './confirm-registration.component.html',
  styleUrls: ['./confirm-registration.component.scss']
})
export class ConfirmRegistrationComponent implements OnInit {

  isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        this.isLoading = true;
        this.authService.confirmRegistration(token).subscribe({
          next: (response: string) => {
            this.isLoading = false;
            alert(response);
            this.router.navigate(['/login']);
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
}
