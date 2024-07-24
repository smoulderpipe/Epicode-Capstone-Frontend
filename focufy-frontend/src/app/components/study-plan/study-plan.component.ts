import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CDAnswerType, CheckpointAnswer, DeadlineAnswer } from 'src/app/models/answer';
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
    private answerService: AnswerService,
    private router: Router
  ) { }

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
          this.studyPlanService.updateStudyPlanStatus(true);
        },
        (error) => {
          console.error('Error fetching study plan:', error);
          this.isLoading = false;
          this.studyPlanService.updateStudyPlanStatus(false);
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
    console.log('Changing answer for question', question.id, 'to', answer);
    this.answers[question.id] = answer;
  }

  confirmRestart(day: any, question: any) {
    const confirmation = confirm(`Would you like to start a new adventure? \n\nWARNING \nBy proceeding, you will PERMANENTLY DELETE your study plan, your avatar and your goals.`);
    if (confirmation) {
      this.onRestartAnswer(day, question);
    } else {
    }
  }

  onRestartAnswer(day: Day, question: Question) {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    const restartAnswer = {
      questionId: question.id,
      answerText: 'Restart',
      personalAnswerType: 'RESTART',
      userId: userId
    };
  
    const answers = [restartAnswer];
  
    console.log('Answers to be sent:', answers);
  
    this.answerService.savePersonalAnswers(answers).subscribe(
      (response) => {
        console.log('Restart answers submitted successfully', response);
        this.router.navigate(['/survey']);
      },
      (error) => {
        console.error('Error submitting restart answers', error);
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


  submitCheckpointAnswers(day: Day) {
  console.log('Submitting checkpoint answers for day:', day);
  const userId = this.authService.getUserId();
  if (!userId) {
    console.error('User ID not found');
    return;
  }

  if (!day.questions) return;

  const checkpointQuestions = day.questions.filter(question =>
    question.questionType === 'CHECKPOINT'
  );

  const answers: CheckpointAnswer[] = checkpointQuestions.map((question, index) => {
    let cdAnswerType: CDAnswerType;

    switch (index % 3) {
      case 0:
        cdAnswerType = CDAnswerType.STUDY;
        break;
      case 1:
        cdAnswerType = CDAnswerType.FUN;
        break;
      case 2:
        cdAnswerType = CDAnswerType.REST;
        break;
      default:
        cdAnswerType = CDAnswerType.STUDY;
        break;
    }

    return {
      questionId: question.id,
      answerText: (this.formGroup.get(question.id.toString())?.value as boolean).toString(),
      checkpointDayId: day.id,
      userId: userId,
      answerType: cdAnswerType
    };
  });

  this.answerService.saveCheckpointAnswers(day.id, answers).subscribe(
    (response) => {
      console.log('Checkpoint answers submitted successfully', response);
      this.submissionStatus[day.name] = true;
      localStorage.removeItem('checkpointAnswers');
      this.answers = {};
    },
    (error) => {
      console.error('Error submitting checkpoint answers', error);
      this.submissionStatus[day.name] = false;
    }
  );
}

  submitDeadlineAnswers(day: Day) {
    console.log('Submitting deadline answers for day:', day);
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User ID not found');
      return;
    }
  
    if (!day.questions) return;
  
    const deadlineQuestions = day.questions.filter(question =>
      question.questionType === 'DEADLINE'
    );
  
    const answers: DeadlineAnswer[] = deadlineQuestions.map((question, index) => {
      let cdAnswerType: CDAnswerType;
  
      switch (index % 3) {
        case 0:
          cdAnswerType = CDAnswerType.STUDY;
          break;
        case 1:
          cdAnswerType = CDAnswerType.FUN;
          break;
        case 2:
          cdAnswerType = CDAnswerType.REST;
          break;
        default:
          cdAnswerType = CDAnswerType.STUDY;
          break;
      }
  
      return {
        questionId: question.id,
        answerText: (this.formGroup.get(question.id.toString())?.value as boolean).toString(),
        deadlineDayId: day.id,
        userId: userId,
        answerType: cdAnswerType
      };
    });
  
    this.answerService.saveDeadlineAnswers(day.id, answers).subscribe(
      (response) => {
        console.log('Deadline answers submitted successfully', response);
        this.submissionStatus[day.name] = true;
        localStorage.removeItem('deadlineAnswers');
        this.answers = {};
      },
      (error) => {
        console.error('Error submitting deadline answers', error);
        this.submissionStatus[day.name] = false;
      }
    );
  }

  hasAnswers(day: Day): boolean {
    if (!day || !day.questions) {
      return false;
    }
    
    return day.questions.some(question => {
      return true;
    });
  }

}