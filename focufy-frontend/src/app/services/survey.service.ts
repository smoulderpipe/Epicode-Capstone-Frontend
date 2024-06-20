import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Page } from '../models/page';
import { Question } from '../models/question';
import { AuthService } from './auth.service';
import { QuestionType } from '../models/questionType';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  private baseUrl = environment.baseUrl + '/api/questions';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getQuestions(page: number = 0, size: number = 17, sortBy: string = 'id', questionTypes: QuestionType[] = [QuestionType.CHRONOTYPE, QuestionType.TEMPER, QuestionType.SHORT_TERM_GOAL, QuestionType.LONG_TERM_GOAL, QuestionType.DAYS, QuestionType.SATISFACTION, QuestionType.RESTART]): Observable<Page<Question>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('questionTypes', questionTypes.join(',')); 

    const token = this.authService.getToken();

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

    return this.http.get<Page<Question>>(this.baseUrl, { params, headers })
    .pipe(
        catchError(error => {
            console.log('Error while requesting questions:', error);
            throw error;
        })
    );
  }

}