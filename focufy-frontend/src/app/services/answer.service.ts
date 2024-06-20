import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Answer } from '../models/answer';

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
  
    assignSharedAnswerToUser(answerId: number): Observable<any> {
      const userId = this.authService.getUserId();
      const url = `${this.baseUrl}/shared/${answerId}/assign/${userId}`;
      const token = this.authService.getToken();
  
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
  
      return this.httpClient.put<any>(url, {}, headers);
    }
  
    submitTextAnswer(questionId: number, answerText: string): Observable<any> {
      const userId = this.authService.getUserId();
      const url = `${this.baseUrl}/shared/text/${questionId}/user/${userId}`;
      const token = this.authService.getToken();
  
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
  
      const body = { answerText };
  
      return this.httpClient.post<any>(url, body, headers);
    }
  }
  