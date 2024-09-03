import { AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CDAnswerType, CheckpointAnswer, DeadlineAnswer } from 'src/app/models/answer';
import { Question } from 'src/app/models/question';
import { ActivitySession, Day, StudyPlan } from 'src/app/models/studyPlan';
import { AnswerService } from 'src/app/services/answer.service';
import { AuthService } from 'src/app/services/auth.service';
import { FooterService } from 'src/app/services/footer.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ModalService } from 'src/app/services/modal.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';

@Component({
  selector: 'app-study-plan',
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.scss']
})
export class StudyPlanComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  studyPlan!: StudyPlan;
  today: string = new Date().toISOString().split('T')[0];
  isLoadingCDAnswers: boolean = false;
  isDataLoaded: boolean = false;
  answers: { [key: number]: boolean } = {};
  user: { name: string } | null = null;
  submissionStatus: { [key: string]: boolean } = {};
  formGroup!: FormGroup;

  modalTitle: string = '';
  modalDescription: string = '';
  modalImage: string = '';
  hasOkButton: boolean = false;
  hasYesButton: boolean = false;
  hasNoButton: boolean = false;
  hasHellNoButton: boolean = false;
  hasGoAheadButton: boolean = false;

  constructor(
    private fb: FormBuilder,
    private studyPlanService: StudyPlanService,
    private authService: AuthService,
    private answerService: AnswerService,
    private router: Router,
    private modalService: ModalService,
    private footerService: FooterService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadingService.setLoading(true);
    this.footerService.setFooterClass('footer-flex-start');
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
          this.loadingService.setLoading(false);
          this.isDataLoaded = true;
          this.initializeForm();
          this.loadSavedAnswers();
          this.studyPlanService.updateStudyPlanStatus(true);
        },
        (error) => {
          console.error('Error fetching study plan:', error);
          this.loadingService.setLoading(false);
          this.studyPlanService.updateStudyPlanStatus(false);
        }
      );
    } else {
      console.error('User ID not found');
      this.loadingService.setLoading(false);
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

  confirmRestart() {
    this.modalTitle = "What if...";
    this.modalDescription = "Personalities change, tests don’t always get it right, and sometimes your avatar just doesn’t feel like ‘you.’ Ready to try something different?";
    this.modalImage = "../../../assets/img/onRestartImage.png";
    this.hasGoAheadButton = false;
    this.hasHellNoButton = false;
    this.hasYesButton = true;
    this.hasNoButton = true;
    this.openModal();
  }

  areYouSure() {
    this.modalTitle = "Are you 100% sure?";
    this.modalDescription = "By clicking 'GO AHEAD', you will PERMANENTLY DELETE your study plan, avatar, and goals, and you'll be redirected to the quiz page to start a new adventure."
    this.modalImage = "../../../assets/img/warning.png";
    this.hasYesButton = false;
    this.hasNoButton = false;
    this.hasHellNoButton = true;
    this.hasGoAheadButton = true;
    this.openModal();
  }

  onRestartAnswer() {
    this.loadingService.setLoading(true);
    this.hasGoAheadButton = false;
    this.hasHellNoButton = false;
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    const answers = [{
      questionId: 24,
      answerText: "yes",
      personalAnswerType: "RESTART",
      userId: userId
    }];

    this.answerService.savePersonalAnswers(answers).subscribe(
      (response) => {
        console.log('Restart answers submitted successfully', response);

        this.authService.getUserDetails(userId).subscribe(
          (userDetails) => {
            this.user = userDetails;

            this.modalTitle = "All set!";
            this.modalDescription = "Your avatar and study plan data were correctly erased! Get ready to restart the experience by answering the test.";
            this.modalImage = "../../../assets/img/thumbs-up-image.png";
            this.hasOkButton = true;

            this.openModal().then(() => {
              this.loadingService.setLoading(false);
              this.modalService.modalClosed$.subscribe(() => {
                this.router.navigateByUrl('/survey');
              });
            });

          },
          (error) => {
            console.error('Error fetching user details after restart', error);
            alert('There was a problem fetching updated user details.');
            this.loadingService.setLoading(false);
          }
        );
      },
      (error) => {
        console.error('Error submitting restart answers', error);
        alert('There was a problem erasing your avatar and study plan data, try again later.');
        this.loadingService.setLoading(false);
      }
    );
  }

  openModal(): Promise<void> {
    this.loadingService.setLoading(true);
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = this.modalImage;

      img.onload = () => {
        this.loadingService.setLoading(false);
        this.modalService.openModal(this.modalTitle, this.modalDescription, this.modalImage);
        const subscription = this.modalService.modalClosed$.subscribe(closed => {
          if (closed) {
            subscription.unsubscribe();
            resolve();
          }
        })
      };

      img.onerror = () => {
        console.error("Error loading image.");
        this.loadingService.setLoading(false);
        this.modalService.openModal(this.modalTitle, this.modalDescription, this.modalImage);
        const subscription = this.modalService.modalClosed$.subscribe(closed => {
          if (closed) {
            subscription.unsubscribe();
            resolve();
          }
        })
      };

    });
  }

  closeModal() {
    this.modalService.closeModal();
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

    this.isLoadingCDAnswers = true;

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
        this.isLoadingCDAnswers = false;
        this.submissionStatus[day.name] = true;
        localStorage.removeItem('checkpointAnswers');
        this.answers = {};
      },
      (error) => {
        console.error('Error submitting checkpoint answers', error);
        this.isLoadingCDAnswers = false;
        this.submissionStatus[day.name] = false;
      }
    );
  }

  submitDeadlineAnswers(day: Day) {

    this.isLoadingCDAnswers = true;

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
        this.isLoadingCDAnswers = false;
        this.submissionStatus[day.name] = true;
        localStorage.removeItem('deadlineAnswers');
        this.answers = {};
      },
      (error) => {
        console.error('Error submitting deadline answers', error);
        this.isLoadingCDAnswers = false;
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

  backToTop(){
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.footerService.setFooterClass('footer-default');
  }

}