import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivitySession, StudyPlan } from 'src/app/models/studyPlan';

import { AuthService } from 'src/app/services/auth.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';

@Component({
  selector: 'app-study-plan',
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.scss']
})
export class StudyPlanComponent implements AfterViewInit, AfterViewChecked {
  studyPlan!: StudyPlan;
  today: string = new Date().toISOString().split('T')[0];
  isLoading: boolean = true;
  isDataLoaded: boolean = false;

  constructor(private studyPlanService: StudyPlanService, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId !== null) {
      this.studyPlanService.getStudyPlan(userId).subscribe(
        (data) => {
          this.studyPlan = data;
          this.isLoading = false;
          this.isDataLoaded = true;
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

  ngAfterViewInit(): void {
    if (this.isDataLoaded) {
      this.scrollToToday();
    }
  }

  ngAfterViewChecked(): void {
    if (this.isDataLoaded) {
      this.scrollToToday();
      this.isDataLoaded = false;  // Assicura che lo scroll avvenga solo una volta
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

  scrollToToday() {
    const todayDay = this.studyPlan.days.find(day => day.date === this.today);
    if (todayDay) {
      const element = document.getElementById(todayDay.name);
      if (element) {
        console.log("Scrolling to:", todayDay.name);  // Log per verificare
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - 300,
          behavior: 'smooth'
        });
      } else {
        console.log("Element not found:", todayDay.name);  // Log per verificare
      }
    } else {
      console.log("Today day not found:", this.today);  // Log per verificare
    }
  }
}