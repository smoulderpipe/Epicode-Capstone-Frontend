import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthGuard implements CanActivate {

  private baseUrl = environment.baseUrl;

  constructor(private router: Router, private http: HttpClient, private loadingService: LoadingService) {}

  canActivate(): Observable<boolean> | boolean {
    console.log('Setting loading to true');
    this.loadingService.setLoading(true);

    return this.checkBackendHealth().pipe(
      map(isBackendUp => {
        console.log('Setting loading to false');
        this.loadingService.setLoading(false);

        if (!isBackendUp) {
          this.router.navigate(['/service-unavailable']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        console.log('Setting loading to false on error');
        this.loadingService.setLoading(false);
        this.router.navigate(['/service-unavailable']);
        return of(false);
      })
    );
  }

  private checkBackendHealth(): Observable<boolean> {
    return this.http.get(this.baseUrl + + "/health", { responseType: 'text' }).pipe(
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