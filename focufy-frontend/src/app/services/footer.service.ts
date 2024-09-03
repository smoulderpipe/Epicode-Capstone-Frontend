import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private footerClassSource = new BehaviorSubject<string>('footer-default');
  footerClass$ = this.footerClassSource.asObservable();

  setFooterClass(className: string) {
    this.footerClassSource.next(className);
  }
}