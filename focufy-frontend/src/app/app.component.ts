import { Component, OnInit } from '@angular/core';
import { FooterService } from './services/footer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'focufy-frontend';

  footerClass: string = 'footer-default';

  constructor(private footerService: FooterService) { }

  ngOnInit(): void {
    this.footerService.footerClass$.subscribe(className => {
      setTimeout(() => {
        this.footerClass = className;
      }, 0);
      
    });
  }
}
