import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  userId: number | null = null;
  hasStudyPlan$!: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private studyPlanService: StudyPlanService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn();
    this.hasStudyPlan$ = this.studyPlanService.getStudyPlanStatus();

    this.isLoggedIn$.pipe(
      map(loggedIn => {
        console.log('Logged in:', loggedIn);
        this.userId = loggedIn ? this.authService.getUserId() : null;
        return loggedIn;
      }),
      switchMap(loggedIn => {
        if (loggedIn && this.userId !== null) {
          return this.studyPlanService.hasStudyPlan(this.userId).pipe(
            catchError(() => of(false))
          );
        } else {
          return of(false);
        }
      })
    ).subscribe(hasStudyPlan => {
      console.log('Has Study Plan:', hasStudyPlan);
      this.studyPlanService.updateStudyPlanStatus(hasStudyPlan);
      this.cdRef.detectChanges();
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.log('Error while logging out', error);
      }
    });
  }
}