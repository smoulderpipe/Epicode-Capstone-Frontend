import { Component, OnInit } from '@angular/core';
import { FooterService } from './services/footer.service';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'focufy-frontend';

  isLoadingComponent = false;

  footerClass: string = 'footer-default';

  constructor(private footerService: FooterService, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.footerService.footerClass$.subscribe(className => {
      setTimeout(() => {
        this.footerClass = className;
      }, 0);
      
    });
    this.loadingService.isLoading$.subscribe(isLoading => {
      this.isLoadingComponent = isLoading;
    });
  }
}
