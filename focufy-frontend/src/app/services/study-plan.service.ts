import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { StudyPlan } from '../models/studyPlan';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class StudyPlanService {
  private baseUrl = environment.baseUrl + "/api/users";
  private studyPlanSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private authService: AuthService) { }

  getStudyPlan(userId: number): Observable<StudyPlan> {
    const url = `${this.baseUrl}/${userId}/studyplans`;
    const headers = this.getHeaders();
    return this.http.get<StudyPlan>(url, { headers }).pipe(
      map(studyPlan => {
        if (studyPlan && studyPlan.days) {
          studyPlan.days.sort((a, b) => a.id - b.id);
        }
        return studyPlan;
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  hasStudyPlan(userId: number): Observable<boolean> {
    const url = `${this.baseUrl}/${userId}/studyplans`;
    const token = this.authService.getToken();

    if (!token) {
      throw new Error('Token not available');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<StudyPlan>(url, { headers }).pipe(
      map(response => {
        const hasStudyPlan = !!response;
        this.studyPlanSubject.next(hasStudyPlan);
        return hasStudyPlan;
      }),
      catchError((error) => {
        console.log('Error in hasStudyPlan:', error);
        this.studyPlanSubject.next(false);
        return of(false);
      })
    );
  }

  getStudyPlanStatus(): Observable<boolean> {
    return this.studyPlanSubject.asObservable();
  }

  updateStudyPlanStatus(status: boolean): void {
    this.studyPlanSubject.next(status);
  }
}