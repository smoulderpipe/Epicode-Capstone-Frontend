import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Avatar } from 'src/app/models/avatar';
import { StudyPlan } from 'src/app/models/studyPlan';
import { User } from 'src/app/models/user';
import { AnswerService } from 'src/app/services/answer.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { StudyPlanService } from 'src/app/services/study-plan.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  avatar: Avatar | null = null;
  studyPlan: StudyPlan | null = null;
  isStudyEnough: boolean | null = null;
  isFunEnough: boolean | null = null;
  isRestEnough: boolean | null = null;
  isLoading: boolean = true;

  modalTitle: string = '';
  modalDescription: string = '';
  modalImage: string = '';
  hasOkButton: boolean = false;
  hasYesButton: boolean = false;
  hasNoButton: boolean = false;
  hasHellNoButton: boolean = false;
  hasGoAheadButton: boolean = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private studyPlanService: StudyPlanService,
    private answerService: AnswerService,
    private router: Router,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getUserAvatar(userId).subscribe(
        (avatar) => {
          this.avatar = avatar;
        },
        (error) => {
          console.error('Error fetching user avatar:', error);
        }
      );

      this.authService.getUserDetails(userId).subscribe(
        (userDetails) => {
          this.user = userDetails;
        },
        (error) => {
          console.error('Error fetching user details:', error);
        }
      );

      this.studyPlanService.getStudyPlan(userId).subscribe(
        (studyPlan) => {
          this.studyPlan = studyPlan;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching study plan:', error);
        }
      );

      this.getCheckpointAnswers(userId);
      this.getDeadlineAnswers(userId);
      this.getFunAnswers(userId);
      this.getRestAnswers(userId);
      this.getSleepingAnswers(userId);
    }
  }

  getCheckpointAnswers(userId: number) {
    this.answerService.getCheckpointAnswersByTypeAndUserId('STUDY', userId).subscribe(
      (checkpointAnswers) => {
        console.log('Checkpoint answers:', checkpointAnswers);
        this.isMajorityOfStudyAnswersTrue(checkpointAnswers, 'STUDY');
      },
      (error) => {
        console.error('Error fetching checkpoint answers:', error);
      }
    );
  }

  getDeadlineAnswers(userId: number) {
    this.answerService.getDeadlineAnswersByTypeAndUserId('STUDY', userId).subscribe(
      (deadlineAnswers) => {
        console.log('Deadline answers:', deadlineAnswers);
        this.isMajorityOfStudyAnswersTrue(deadlineAnswers, 'STUDY');
      },
      (error) => {
        console.error('Error fetching deadline answers:', error);
      }
    );
  }

  getFunAnswers(userId: number) {
    this.answerService.getCheckpointAnswersByTypeAndUserId('FUN', userId).subscribe(
      (funAnswers) => {
        console.log('Fun answers:', funAnswers);
        this.isMajorityOfFunAnswersTrue(funAnswers, 'FUN');
      },
      (error) => {
        console.error('Error fetching fun answers:', error);
      }
    );
  }

  getRestAnswers(userId: number) {
    this.answerService.getDeadlineAnswersByTypeAndUserId('REST', userId).subscribe(
      (restAnswers) => {
        console.log('Rest answers:', restAnswers);
        this.isMajorityOfStudyAnswersTrue(restAnswers, 'REST');
      },
      (error) => {
        console.error('Error fetching rest answers:', error);
      }
    );
  }

  getSleepingAnswers(userId: number) {
    this.answerService.getDeadlineAnswersByTypeAndUserId('REST', userId).subscribe(
      (sleepingAnswers) => {
        console.log('Sleeping answers:', sleepingAnswers);
        this.isMajorityOfSleepingAnswersTrue(sleepingAnswers);
      },
      (error) => {
        console.error('Error fetching sleeping answers:', error);
      }
    );
  }

  isMajorityOfStudyAnswersTrue(answers: any[], type: string) {
    if (answers.length === 0) {
      this.setAnswerType(type, null);
      return;
    }

    let trueCount = 0;
    let falseCount = 0;

    answers.forEach(answer => {
      if (answer.answerText === 'true') {
        trueCount++;
      } else if (answer.answerText === 'false') {
        falseCount++;
      }
    });

    if (trueCount > falseCount) {
      this.setAnswerType(type, true);
    } else if (falseCount > trueCount) {
      this.setAnswerType(type, false);
    } else {
      this.setAnswerType(type, false);
    }
  }

  isMajorityOfFunAnswersTrue(answers: any[], type: string) {
    if (answers.length === 0) {
      this.setAnswerType(type, null);
      return;
    }

    let trueCount = 0;
    let falseCount = 0;

    answers.forEach(answer => {
      if (answer.answerText === 'true') {
        trueCount++;
      } else if (answer.answerText === 'false') {
        falseCount++;
      }
    });

    if (trueCount > falseCount) {
      this.setAnswerType(type, true);
    } else if (falseCount > trueCount) {
      this.setAnswerType(type, false);
    } else {
      this.setAnswerType(type, false);
    }
  }

  isMajorityOfSleepingAnswersTrue(answers: any[]) {
    if (answers.length === 0) {
      this.isRestEnough = null;
      return;
    }

    let trueCount = 0;
    let falseCount = 0;

    answers.forEach(answer => {
      if (answer.answerText === 'true') {
        trueCount++;
      } else if (answer.answerText === 'false') {
        falseCount++;
      }
    });

    if (trueCount > falseCount) {
      this.isRestEnough = true;
    } else if (falseCount > trueCount) {
      this.isRestEnough = false;
    } else {
      this.isRestEnough = false;
    }
  }

  setAnswerType(type: string, value: boolean | null) {
    switch (type) {
      case 'STUDY':
        this.isStudyEnough = value;
        break;
      case 'FUN':
        this.isFunEnough = value;
        break;
      case 'REST':
        this.isRestEnough = value;
        break;
      default:
        console.warn(`Unsupported answer type: ${type}`);
        break;
    }
  }

  confirmRestart() {
    const confirmation = "";
    this.modalTitle = "What if...";
    this.modalDescription = "Personalities change, tests don’t always get it right, and sometimes your avatar just doesn’t feel like ‘you.’ Ready to try something different?";
    this.modalImage = "../../../assets/img/onRestartImage.png";
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
    this.isLoading = true;
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
            this.avatar = null; 
            this.studyPlan = null;
            
            this.modalTitle = "All set!";
            this.modalDescription = "Your avatar and study plan data were correctly erased! Get ready to restart the experience by answering the test.";
            this.modalImage = "../../../assets/img/thumbs-up-image.png";
            this.hasOkButton = true;
            
            this.openModal().then(() => {
              this.router.navigateByUrl('/survey');
            });
            
            
            this.isLoading = false;
          },
          (error) => {
            console.error('Error fetching user details after restart', error);
            alert('There was a problem fetching updated user details.');
            this.isLoading = false;
          }
        );
      },
      (error) => {
        console.error('Error submitting restart answers', error);
        alert('There was a problem erasing your avatar and study plan data, try again later.');
        this.isLoading = false;
      }
    );
    
  }

  openModal(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.modalService.openModal(this.modalTitle, this.modalDescription, this.modalImage);
      this.modalService.modalClosed$.subscribe(closed => {
        if (closed) {
          resolve();
        }
      });
    });
  }

  closeModal() {
    this.modalService.closeModal();
    this.hasGoAheadButton = false;
    this.hasHellNoButton = false;
    this.hasYesButton = false;
    this.hasNoButton = false;
  }
}