import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { FooterService } from './services/footer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'focufy-frontend';

  footerClass: string = 'footer-default'; // Default class

  constructor(private footerService: FooterService) { }

  ngOnInit(): void {
    this.footerService.footerClass$.subscribe(className => {
      this.footerClass = className;
    });
  }
}
