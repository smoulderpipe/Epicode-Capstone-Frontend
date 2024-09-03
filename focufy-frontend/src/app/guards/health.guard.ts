import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { LoadingService } from '../services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class HealthGuard implements CanActivate {

  constructor(private router: Router, private http: HttpClient, private loadingService: LoadingService) {}

  canActivate(): Observable<boolean> | boolean {
    console.log('Setting loading to true');
    this.loadingService.setLoading(true); // Start loading

    return this.checkBackendHealth().pipe(
      map(isBackendUp => {
        console.log('Setting loading to false');
        this.loadingService.setLoading(false); // Stop loading

        if (!isBackendUp) {
          this.router.navigate(['/service-unavailable']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        console.log('Setting loading to false on error');
        this.loadingService.setLoading(false); // Stop loading
        this.router.navigate(['/service-unavailable']);
        return of(false);
      })
    );
  }

  private checkBackendHealth(): Observable<boolean> {
    return this.http.get('http://localhost:8080/health', { responseType: 'text' }).pipe(
      map(() => {
        console.log('Backend is up');
        return true;
      }), 
      catchError(error => {
        console.error('Backend is down:', error);
        return of(false);
      })
    );
  }
}