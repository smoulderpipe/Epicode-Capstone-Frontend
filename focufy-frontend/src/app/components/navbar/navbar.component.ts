import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  userId: number | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn();
    this.isLoggedIn$.subscribe(loggedIn => {
      console.log('Is logged in:', loggedIn);
      if (loggedIn) {
        this.userId = this.authService.getUserId();
      } else {
        this.userId = null;
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout avvenuto con successo');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.log('Errore durante il logout', error);
      }
    });
  }
}