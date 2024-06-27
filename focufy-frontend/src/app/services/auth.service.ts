import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseURL = 'http://localhost:8080/auth';
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  token$ = this.tokenSubject.asObservable();
  /* private loggedUserId: number | null = null; */
  private loggedUserId: number | null = this.getStoredUserId();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<string> {
    const loginData = { email, password };

    return this.http.post<any>(`${this.baseURL}/login`, loginData, { responseType: 'text' as 'json' }).pipe(
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
              console.log('ID utente salvato:', this.loggedUserId);
            }

            return token;
          } catch (error) {
            console.error('Errore durante la decodifica del token:', error);
            throw new Error('Errore durante il login');
          }
        } else {
          throw new Error('Token non valido ricevuto dal server');
        }
      }),
      catchError(error => {
        console.error('Errore durante il login:', error);
        return throwError('Errore durante il login');
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseURL}/logout`, {}).pipe(
      map(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this.tokenSubject.next(null);
        this.loggedUserId = null;
        console.log('Logout effettuato');
      }),
      catchError(error => {
        console.error('Errore durante il logout:', error);
        return throwError(error);
      })
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.tokenSubject.pipe(map(token => !!token));
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
} 