import { Component } from '@angular/core';
import { StudyPlan } from 'src/app/models/studyPlan';

import { AuthService } from 'src/app/services/auth.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';

@Component({
  selector: 'app-study-plan',
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.scss']
})
export class StudyPlanComponent {
  studyPlan!: StudyPlan;
  isLoading: boolean = true; // Aggiunto per gestire il caricamento

  constructor(private studyPlanService: StudyPlanService, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId !== null) {
      this.studyPlanService.getStudyPlan(userId).subscribe(
        (data) => {
          this.studyPlan = data;
          this.isLoading = false; // Imposta isLoading a false quando il piano di studio è caricato correttamente
          console.log('Study Plan:', this.studyPlan);
          // Ora puoi utilizzare this.studyPlan per visualizzare i dati nel tuo template
        },
        (error) => {
          console.error('Error fetching study plan:', error);
          this.isLoading = false; // Gestisci l'errore impostando isLoading a false
          // Gestisci l'errore appropriatamente nel tuo componente
        }
      );
    } else {
      console.error('User ID not found');
      this.isLoading = false; // Gestisci l'errore impostando isLoading a false
      // Gestisci l'errore appropriatamente nel tuo componente
    }
  }
}
