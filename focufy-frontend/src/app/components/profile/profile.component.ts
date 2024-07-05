import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Avatar } from 'src/app/models/avatar';
import { StudyPlan } from 'src/app/models/studyPlan';
import { User } from 'src/app/models/user';
import { AnswerService } from 'src/app/services/answer.service';
import { AuthService } from 'src/app/services/auth.service';
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

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private studyPlanService: StudyPlanService,
    private answerService: AnswerService,
    private router: Router
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
    const confirmation = confirm(`Would you like to start a new adventure? \n\nWARNING \nBy proceeding, you will PERMANENTLY DELETE your study plan, your avatar and your goals.`);
    if (confirmation) {
      this.onRestartAnswer();
    } else {
    }
  }

  onRestartAnswer() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    const answers: any[] = [];
    this.answerService.savePersonalAnswers(answers).subscribe(
      (response) => {
        console.log('Restart answers submitted successfully', response);
        this.router.navigate(['/survey']);
      },
      (error) => {
        console.error('Error submitting restart answers', error);
        this.router.navigate(['/survey']);
      }
    );
  }
}