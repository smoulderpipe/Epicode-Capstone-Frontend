import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, of, throwError } from 'rxjs';
import { StudyPlan } from './models/studyPlan';
import { StudyPlanService } from './services/study-plan.service';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudyPlanResolver implements Resolve<StudyPlan> {

  constructor(private studyPlanService: StudyPlanService, private authService: AuthService, private router: Router) {}

  resolve(): Observable<StudyPlan> {
    const userId = this.authService.getUserId();
    if (userId !== null) {
      return this.studyPlanService.getStudyPlan(userId);
    } else {
      console.log("User ID not found in resolver, redirecting to login.");
      this.router.navigate(['/login']);
      return throwError("User ID not found");
    }
  }
}