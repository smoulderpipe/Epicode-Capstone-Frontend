import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Answer } from '../models/answer';
import { AssignSharedAnswer } from '../models/assignSharedAnswer';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

    private baseUrl = environment.baseUrl + "/api/answers";
  
    constructor(private httpClient: HttpClient, private authService: AuthService) {}
  
    getSharedAnswersForQuestionId(questionId: number): Observable<Answer[]> {
      const url = `${this.baseUrl}/question/${questionId}`;
      const token = this.authService.getToken();
  
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
  
      return this.httpClient.get<Answer[]>(url, headers);
    }
  
    assignSharedAnswersToUser(assignSharedAnswers: AssignSharedAnswer[]): Observable<any> {
      const userId = this.authService.getUserId();
      const url = `${this.baseUrl}/shared/assign/${userId}`;
      const token = this.authService.getToken();
      
      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };
    
      return this.httpClient.put<any>(url, assignSharedAnswers, headers);
    }
  
    savePersonalAnswers(answers: any[]): Observable<any>{
      const userId = this.authService.getUserId();
      const url = `${this.baseUrl}/users/${userId}/personal`;
      const token = this.authService.getToken();
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      return this.httpClient.post<any>(url, answers, headers);
    }
  }
  