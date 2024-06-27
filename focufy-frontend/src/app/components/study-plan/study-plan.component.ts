import { Component } from '@angular/core';
import { ActivitySession, StudyPlan } from 'src/app/models/studyPlan';

import { AuthService } from 'src/app/services/auth.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';

@Component({
  selector: 'app-study-plan',
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.scss']
})
export class StudyPlanComponent {
  studyPlan!: StudyPlan;
  isLoading: boolean = true;

  constructor(private studyPlanService: StudyPlanService, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId !== null) {
      this.studyPlanService.getStudyPlan(userId).subscribe(
        (data) => {
          this.studyPlan = data;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching study plan:', error);
          this.isLoading = false;
        }
      );
    } else {
      console.error('User ID not found');
      this.isLoading = false;
    }
  }

  compareSessions(session1: ActivitySession, session2: ActivitySession): number {
    if (session1.startTime < session2.startTime) {
      return -1;
    } else if (session1.startTime > session2.startTime) {
      return 1;
    } else {
      return 0;
    }
  }

  formatStartTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').slice(0, 2);
    return `${hours}:${minutes}`;
  }


 
}