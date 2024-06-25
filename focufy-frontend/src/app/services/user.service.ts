import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avatar } from '../models/avatar'; // Crea questo modello con i dettagli dell'avatar
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
  })
  export class UserService {
    private baseUrl = environment.baseUrl;
  
    constructor(private http: HttpClient, private authService: AuthService) {}
  
    getUserAvatar(userId: number): Observable<Avatar> {
      const token = this.authService.getToken();
  
      if (!token) {
        throw new Error('Token not available');
      }
  
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
  
      return this.http.get<Avatar>(`${this.baseUrl}/api/users/${userId}/avatar`, { headers });
    }
  }