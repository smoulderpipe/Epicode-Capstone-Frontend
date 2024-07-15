import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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

  login(email: string, password: string): Observable<string> {
    const loginData = { email, password };

    return this.http.post<any>(`${this.baseUrl}/auth/login`, loginData, { responseType: 'text' as 'json' }).pipe(
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
              console.log('User ID saved:', this.loggedUserId);
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
        let errorMessage = 'Error during login';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = 'User not found. Please check your email.';
        } else if (error.status === 401 || error.status === 400) {
          errorMessage = 'An error occurred during authentication process, check your credentials and try again.';
        }
        console.error('Error during login:', errorMessage);
        return throwError(errorMessage);
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
} 