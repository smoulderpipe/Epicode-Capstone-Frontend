import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Question } from 'src/app/models/question';
import { ActivitySession, Day, StudyPlan } from 'src/app/models/studyPlan';
import { AnswerService } from 'src/app/services/answer.service';
import { AuthService } from 'src/app/services/auth.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';

@Component({
  selector: 'app-study-plan',
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.scss']
})
export class StudyPlanComponent implements OnInit, AfterViewInit, AfterViewChecked {
  studyPlan!: StudyPlan;
  today: string = new Date().toISOString().split('T')[0];
  isLoading: boolean = true;
  isDataLoaded: boolean = false;
  answers: { [key: number]: boolean } = {};
  user: { name: string } | null = null;
  submissionStatus: { [key: string]: boolean } = {};
  formGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private studyPlanService: StudyPlanService, 
    private authService: AuthService, 
    private answerService: AnswerService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId !== null) {
      this.authService.getUserDetails(userId).subscribe(
        (userDetails) => {
          this.user = userDetails;
        },
        (error) => {
          console.error('Error fetching user details:', error);
        }
      );
  
      this.studyPlanService.getStudyPlan(userId).subscribe(
        (data) => {
          this.studyPlan = data;
          this.isLoading = false;
          this.isDataLoaded = true;
          this.initializeForm();
          this.loadSavedAnswers();
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
  
  loadSavedAnswers() {
    const storedAnswers = localStorage.getItem('checkpointAnswers');
    if (storedAnswers) {
      this.answers = JSON.parse(storedAnswers);
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
      this.isDataLoaded = false; 
    }
  }

  initializeForm(): void {
    const group: any = {};
    this.studyPlan.days.forEach(day => {
      if (day.questions) {
        day.questions.forEach(question => {
          if (question.questionType === 'DEADLINE' || question.questionType === 'CHECKPOINT') {
            group[question.id] = ['', Validators.required];
          }
        });
      }
    });
    this.formGroup = this.fb.group(group);
  }

  compareSessions(session1: ActivitySession, session2: ActivitySession): number {
    if (session1.startTime < session2.startTime) {
      return -1;
    } else if (session1.startTime > session1.startTime) {
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
      const accordionIndex = this.studyPlan.days.findIndex(day => day.date === this.today);
      if (accordionIndex !== -1) {
        const accordionId = `#collapse-${accordionIndex}`;
        const accordionElement = document.querySelector(accordionId);
        if (accordionElement) {
          console.log("Scrolling to:", todayDay.name);
  
          const desiredPosition = accordionElement.getBoundingClientRect().top + window.scrollY - 300;
  
          window.scrollTo({
            top: desiredPosition,
            behavior: 'smooth'
          });
        } else {
          console.log("Accordion element not found:", accordionId);
        }
      } else {
        console.log("Accordion index not found for today:", this.today);
      }
    } else {
      console.log("Today day not found:", this.today);
    }
  }

  isToday(day: Day): boolean {
    return day.date === this.today;
  }

  onAnswerChange(day: Day, question: Question, answer: boolean) {
    this.answers[question.id] = false;
    this.answers[question.id] = answer;
  }

  onRestartAnswer(day: Day, question: Question) {
    const restartAnswer = {
      questionId: question.id,
      answerText: 'Restart',
      personalAnswerType: 'RESTART'
    };

    this.answerService.savePersonalAnswers([restartAnswer]).subscribe(
      (response) => {
        console.log('Restart answer submitted successfully', response);
      },
      (error) => {
        console.error('Error submitting restart answer', error);
      }
    );
  }

  canSubmitAnswers(day: Day): boolean {
    if (!day.questions) return false;
  
    const questions = day.questions.filter(question => question.questionType === 'DEADLINE' || question.questionType === 'CHECKPOINT');
    return questions.every(question => {
      const control = this.formGroup.get(question.id.toString());
      return control?.valid && control?.value !== '';
    });
  }
  

  submitAnswers(day: Day) {
    if (!day.questions) return;
  
    const checkpointQuestions = day.questions.filter(question =>
      question.questionType === 'CHECKPOINT' || question.questionType === 'DEADLINE'
    );
  
    const personalAnswers = checkpointQuestions.map(question => ({
      answerText: this.answers[question.id] ? 'true' : 'false',
      questionId: question.id,
      personalAnswerType: question.questionType === 'CHECKPOINT' ? 'CHECKPOINT' : 'DEADLINE',
      userId: this.authService.getUserId()
    }));
  
    this.answerService.savePersonalAnswers(personalAnswers).subscribe(
      (response) => {
        console.log('Answers submitted successfully', response);
        this.submissionStatus[day.name] = true;
        localStorage.removeItem('checkpointAnswers');
        this.answers = {};
      },
      (error) => {
        console.error('Error submitting answers', error);
        this.submissionStatus[day.name] = false;
      }
    );
  }
  
}