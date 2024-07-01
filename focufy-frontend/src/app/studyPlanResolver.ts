import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { StudyPlan } from './models/studyPlan';
import { StudyPlanService } from './services/study-plan.service';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudyPlanResolver implements Resolve<StudyPlan> {

  constructor(private studyPlanService: StudyPlanService, private authService: AuthService) {}

  resolve(): Observable<StudyPlan> {
    const userId = this.authService.getUserId();
    if (userId !== null) {
      return this.studyPlanService.getStudyPlan(userId);
    } else {
      // Ritorna un observable vuoto o gestisci diversamente il caso in cui userId è null
      return throwError("User ID not found");
    }
  }
}