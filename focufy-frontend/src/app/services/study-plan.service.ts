import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudyPlan } from '../models/studyPlan';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class StudyPlanService {

    private baseUrl = environment.baseUrl + "/api/users";

  constructor(private http: HttpClient, private authService: AuthService) { }

  getStudyPlan(userId: number): Observable<StudyPlan> {
    const url = `${this.baseUrl}/${userId}/studyplans`;
    const headers = this.getHeaders();
    return this.http.get<StudyPlan>(url, { headers }).pipe(
      map(studyPlan => {
        if (studyPlan && studyPlan.days) {
          studyPlan.days.sort((a, b) => a.id - b.id); // Ordinamento per ID ascendente
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
}