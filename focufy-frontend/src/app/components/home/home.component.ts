import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isLoadingComponent = false;

  constructor(private loadingService: LoadingService, private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadingService.isLoading$.subscribe(isLoading => {
      this.isLoadingComponent = isLoading;
      this.cdRef.detectChanges();
    });
  }
}