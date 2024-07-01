import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Answer, CheckpointAnswer, DeadlineAnswer } from '../models/answer';
import { AssignSharedAnswer } from '../models/assignSharedAnswer';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  private baseUrl = environment.baseUrl + "/api/answers";

  constructor(private httpClient: HttpClient, private authService: AuthService) {}

  getSharedAnswersForQuestionId(questionId: number): Observable<Answer[]> {
    const url = `${this.baseUrl}/question/${questionId}`;
    const headers = this.getHeaders();
    return this.httpClient.get<Answer[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  assignSharedAnswersToUser(assignSharedAnswers: AssignSharedAnswer[]): Observable<any> {
    const userId = this.authService.getUserId();
    const url = `${this.baseUrl}/shared/assign/${userId}`;
    const headers = this.getHeaders();
    
    return this.httpClient.put<any>(url, assignSharedAnswers, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  savePersonalAnswers(answers: any[]): Observable<any> {
    const userId = this.authService.getUserId();
    const url = `${this.baseUrl}/users/${userId}/personal`;
    const headers = this.getHeaders();
    
    return this.httpClient.post<any>(url, answers, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  saveCheckpointAnswers(dayId: number, answers: CheckpointAnswer[]): Observable<any> {
    const userId = this.authService.getUserId();
    const url = `${this.baseUrl}/users/${userId}/checkpoint`;
    const headers = this.getHeaders();
    console.log('saveCheckpointAnswers called for day', dayId, answers);
    
    return this.httpClient.post<any>(url, answers, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  saveDeadlineAnswers(dayId: number, answers: DeadlineAnswer[]): Observable<any> {
    const userId = this.authService.getUserId();
    const url = `${this.baseUrl}/users/${userId}/deadline`;
    const headers = this.getHeaders();
    console.log('savedeadlineAnswers called for day', dayId, answers);
    
    return this.httpClient.post<any>(url, answers, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createStudyPlan(userId: number, studyPlanDTO: any): Observable<any> {
    const url = `${environment.baseUrl}/api/users/${userId}/studyplans`;
    const token = this.authService.getToken();
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return this.httpClient.post<any>(url, studyPlanDTO, headers);
  }

  addMantrasToStudyPlan(userId: number): Observable<any> {
    const url = `${environment.baseUrl}/api/users/${userId}/addMantras`;
    const headers = this.getHeaders();
    
    return this.httpClient.post<any>(url, null, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Error in API call:', error);
    return throwError('Something bad happened; please try again later.');
  }

  

  }
  