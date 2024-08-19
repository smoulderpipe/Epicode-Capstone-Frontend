import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = environment.baseUrl;

  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('access_token'));
  token$ = this.tokenSubject.asObservable();
  private loggedUserId: number | null = this.getStoredUserId();

  constructor(private http: HttpClient) {}

  register(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, user, { observe: 'response' }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error during registration';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Invalid registration data. Please check your input.';
        }
        console.error('Error during registration:', errorMessage);
        return throwError(errorMessage);
      })
    );
  }

  login(email: string, password: string): Observable<string> {
    const loginData = { email, password };
  
    return this.http.post<any>(`${this.baseUrl}/auth/login`, loginData, { responseType: 'json' }).pipe(
      map(response => {
        const token = response;
  
        if (token) {
          localStorage.setItem('access_token', token);
          this.tokenSubject.next(token);
  
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload) {
              this.loggedUserId = payload.sub;
              localStorage.setItem('userId', this.loggedUserId!.toString());
            }
  
            return token;
          } catch (error) {
            console.error('Error during decoding of token:', error);
            throw new Error('Error during login');
          }
        } else {
          throw new Error('Invalid token received from server.');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error details:', error); 
  
        let errorMessage = 'An unknown error occurred'; 

        if(error.error && typeof error.error === 'object') {
          errorMessage = error.error.message || errorMessage;
        }
  
        console.error('Parsed error message:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {}).pipe(
      map(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('userId');
        this.tokenSubject.next(null);
        this.loggedUserId = null;
        console.log('Logout successful');
      }),
      catchError(error => {
        console.error('Error during logout:', error);
        return throwError(error);
      })
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.token$.pipe(map(token => !!token));
  }

  getUserId(): number | null {
    return this.loggedUserId;
  }

  private getStoredUserId(): number | null {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId, 10) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserDetails(userId: number): Observable<User> {
    const url = `${this.baseUrl}/api/users/${userId}`;
    const token = this.getToken();
  
    if (!token) {
      throw new Error('Token not available');
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.get<User>(url, { headers }).pipe(
      catchError(error => {
        console.error('Error while loading user details:', error);
        return throwError('Error while loading user details');
      })
    );
  }

  confirmRegistration(token: string): Observable<string> {
    const params = new HttpParams().set('token', token);
    return this.http.get(`${this.baseUrl}/auth/confirm`, { params, responseType: 'text' })
      .pipe(
        map(response => {
          if (response === 'Registration confirmed successfully.') {
            return response;
          } else {
            throw new Error('Unexpected response.');
          }
        }),
        catchError(error => {
          console.error('Error during confirmation:', error);
          return throwError('An error occurred during confirmation.');
        })
      );
  }
} 