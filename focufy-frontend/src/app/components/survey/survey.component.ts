import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, forkJoin, of, throwError } from 'rxjs';
import { Answer } from 'src/app/models/answer';
import { AssignSharedAnswer } from 'src/app/models/assignSharedAnswer';
import { Chronotype, Temper } from 'src/app/models/avatar';
import { Page } from 'src/app/models/page';
import { Question } from 'src/app/models/question';
import { UpdateLongTermGoal } from 'src/app/models/updateLongTermGoal';
import { AnswerService } from 'src/app/services/answer.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SurveyService } from 'src/app/services/survey.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {

  chronotypeForm!: FormGroup;
  temperForm!: FormGroup;
  personalGoalsForm!: FormGroup;

  chronotypeFormControls: { [key: number]: FormControl } = {};
  temperFormControls: { [key: number]: FormControl } = {};

  questionsPage: Page<Question> = { content: [], totalPages: 0, totalElements: 0 };
  answersMap: { [key: number]: Answer[] } = {};
  selectedAnswers: { [key: number]: number | boolean } = {};
  textAnswers: { [key: number]: string } = {};

  currentQuestionIndex: number = 0;

  showAvatar: boolean = false;
  userAvatarUrl: string = '';
  userAvatarDescription: string = '';
  userAvatarChronotype: Chronotype = {
    id: 0,
    chronotypeType: '',
    maxEnergyType: '',
    description: ''
  };
  userAvatarTemper: Temper = {
    id: 0,
    temperType: '',
    strengthType: '',
    riskType: '',
    description: ''
  };
  userAvatarTemperDescription: String = '';
  userAvatarChronotypeDescription: String = '';
  userAvatarTemperRisk: String = '';
  userAvatarTemperStrength: String = '';
  userAvatarChronotypeMaxEnergyType: String = '';

  constructor(
    private surveyService: SurveyService,
    private answerService: AnswerService,
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadingService.setLoading(true); 
    this.getQuestions();
    this.chronotypeForm = this.fb.group({});
    this.temperForm = this.fb.group({});
    this.personalGoalsForm = this.fb.group({});
  }

  getQuestions(): void {
    this.surveyService.getQuestions().subscribe(
      (data) => {
        this.questionsPage = data;
        console.log('Questions loaded:', this.questionsPage);

        this.questionsPage.content.forEach(question => {
          this.addFormControl(question);
          this.loadAnswersForQuestion(question.id);
        });
      },
      (error) => {
        console.log('Error loading questions:', error);
        alert('Error loading form');
        this.loadingService.setLoading(false);
      }
    );
  }

  addFormControl(question: Question): void {
    const controlName = this.getFormControlName(question);

    switch (question.questionType) {
      case 'CHRONOTYPE':
        this.chronotypeFormControls[question.id] = new FormControl(null);
        this.chronotypeForm.addControl(controlName, this.chronotypeFormControls[question.id]);
        break;

      case 'TEMPER':
        this.temperFormControls[question.id] = new FormControl(null);
        this.temperForm.addControl(controlName, this.temperFormControls[question.id]);
        break;

      case 'LONG_TERM_GOAL':
      case 'SHORT_TERM_GOAL':
      case 'DAYS':
      case 'SATISFACTION':
      case 'CHECKPOINT':
      case 'DEADLINE':
      case 'RESTART':
        this.personalGoalsForm.addControl(controlName, new FormControl(null));
        break;

      default:
        console.warn(`Unknown question type: ${question.questionType}`);
    }
  }

  loadAnswersForQuestion(questionId: number): void {
    this.answerService.getSharedAnswersForQuestionId(questionId).subscribe(
      (answers) => {
        this.answersMap[questionId] = answers;
        console.log(`Answers for question ${questionId} loaded:`, answers);
        this.loadingService.setLoading(false);
      },
      (error) => {
        console.log(`Error loading answers for question ${questionId}:`, error);
        alert(`Error loading answers for question ${questionId}:`);
        this.loadingService.setLoading(false);
      }
    );
  }

  onSubmit(): void {
    console.log('Form submitted', this.personalGoalsForm.value);
  }

  nextQuestion(): void {
    const currentQuestion = this.currentQuestion;
    const currentFormGroup = this.getCurrentFormGroup(currentQuestion);
    if (currentFormGroup) {
      const answerControl = currentFormGroup.get(this.getFormControlName(currentQuestion));
      if (answerControl) {
        const answerValue = answerControl.value;
        this.saveAnswer(currentQuestion.id, answerValue);
      }
    }

    if (currentQuestion.questionType === 'DAYS') {
      this.loadingService.setLoading(true);
      console.log('Submitting answers because current question type is DAYS');
      this.submitAnswers();
    } else if (this.currentQuestionIndex < this.questionsPage.content.length - 1) {
      this.currentQuestionIndex++;
    }

    console.log('Next clicked. Current index:', this.currentQuestionIndex);
    console.log('Selected answers:', this.selectedAnswers);
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      const currentQuestion = this.currentQuestion;
      const currentFormGroup = this.getCurrentFormGroup(currentQuestion);
      if (currentFormGroup) {
        const savedAnswer = this.getSavedAnswer(currentQuestion.id);
        const answerControl = currentFormGroup.get(this.getFormControlName(currentQuestion));
        if (answerControl) {
          if (savedAnswer != null) {
            answerControl.setValue(savedAnswer);
          } else {
            answerControl.reset();
          }
        }
      }
      this.currentQuestionIndex--;
    }
    console.log('Previous clicked. Current index:', this.currentQuestionIndex);
    console.log('Selected answers:', this.selectedAnswers);
  }

  saveAnswer(questionId: number, answerValue: any): void {
    const currentQuestion = this.currentQuestion;

    switch (currentQuestion.questionType) {
      case 'CHRONOTYPE':
      case 'TEMPER':
      case 'RESTART':
        this.selectedAnswers[questionId] = answerValue;
        break;

      case 'SHORT_TERM_GOAL':
      case 'LONG_TERM_GOAL':
        this.textAnswers[questionId] = answerValue;
        break;

      case 'DAYS':
        if (answerValue !== null && answerValue !== '' && !isNaN(answerValue)) {
          this.selectedAnswers[questionId] = +answerValue;
        } else {
          console.warn(`Invalid answer for DAYS question: ${answerValue}`);
        }
        break;

      default:
        console.warn(`Unhandled question type: ${currentQuestion.questionType}`);
        break;
    }
  }

  submitAnswers(): void {
    const userId = Number(this.authService.getUserId());
    if (isNaN(userId)) {
      console.error('User ID is invalid. Cannot submit answers.');
      return;
    }

    const sharedAnswers: AssignSharedAnswer[] = [];
    const personalAnswers: any[] = [];
    const sharedAnswersObservables: Observable<Answer[]>[] = [];

    for (const questionId in this.selectedAnswers) {
      const answer = this.selectedAnswers[questionId];
      const question = this.questionsPage.content.find(q => q.id === +questionId);
      if (question) {
        switch (question.questionType) {
          case 'CHRONOTYPE':
          case 'TEMPER':
            const observable = this.answerService.getSharedAnswersForQuestionId(+questionId).pipe(
              catchError(error => {
                console.error(`Error loading shared answers for question ${questionId}:`, error);
                return of([] as Answer[]);
              })
            );
            sharedAnswersObservables.push(observable);
            break;

          case 'DAYS':
            personalAnswers.push({
              questionId: +questionId,
              answerText: answer,
              userId: userId,
              personalAnswerType: question.questionType
            });
            break;

          default:
            break;
        }
      }
    }

    for (const questionId in this.textAnswers) {
      const answer = this.textAnswers[questionId];
      const question = this.questionsPage.content.find(q => q.id === +questionId);
      if (question) {
        switch (question.questionType) {
          case 'SHORT_TERM_GOAL':
          case 'LONG_TERM_GOAL':
            personalAnswers.push({
              questionId: +questionId,
              answerText: answer,
              userId: userId,
              personalAnswerType: question.questionType
            });
            break;
          default:
            break;
        }
      }
    }

    let hasErrors = false;
    let errorMessage = '';

    forkJoin(sharedAnswersObservables).subscribe(
      (responses: Answer[][]) => {
        responses.forEach((answers, index) => {
          const questionId = Number(Object.keys(this.selectedAnswers)[index]);
          const answer = this.selectedAnswers[questionId];
          const matchingAnswer = answers.find(a => a.id === answer);
          if (matchingAnswer) {
            sharedAnswers.push({
              questionId: questionId,
              answerId: matchingAnswer.id
            });
          }
        });

        if (sharedAnswers.length > 0) {
          this.answerService.assignSharedAnswersToUser(sharedAnswers)
            .pipe(
              catchError(error => {
                hasErrors = true;
                errorMessage = `Error assigning shared answers: ${error.message}`;
                console.error(errorMessage);
                return throwError('Something went wrong. Please try again later.');
              })
            )
            .subscribe(
              response => {
                console.log('Shared answers assigned:', response);
                this.loadUserAvatar(userId);
                this.updateUserLongTermGoalIfNeeded(userId);
              },
              error => {
                console.error('Subscription error:', error);
              }
            );
        }

        if (personalAnswers.length > 0) {
          this.answerService.savePersonalAnswers(personalAnswers)
            .pipe(
              catchError(error => {
                hasErrors = true;
                errorMessage = `Error saving personal answers: ${error.message}`;
                console.error(errorMessage);
                return throwError('Something went wrong. Please try again later.');
              })
            )
            .subscribe(
              (response) => {
                console.log('Personal answers saved:', response);
                this.loadUserAvatar(userId);
                this.updateUserLongTermGoalIfNeeded(userId);
              }
            );
        } else {
          this.loadUserAvatar(userId);
          this.updateUserLongTermGoalIfNeeded(userId);
        }
      },
      error => {
        hasErrors = true;
        errorMessage = `Error loading shared answers: ${error.message}`;
        console.error(errorMessage);
      }
    );
  }

  updateUserLongTermGoalIfNeeded(userId: number): void {
    const longTermGoalQuestion = this.questionsPage.content.find(question => question.questionType === 'LONG_TERM_GOAL');
    const longTermGoalQuestionId = longTermGoalQuestion?.id;
    const longTermGoal = longTermGoalQuestionId ? this.textAnswers[longTermGoalQuestionId] : null;

    if (longTermGoal) {
      const updateDTO: UpdateLongTermGoal = {
        longTermGoal: longTermGoal
      };

      this.userService.updateUserLongTermGoal(userId, updateDTO)
        .subscribe(response => {
          console.log('Long term goal updated:', response);
        }, error => {
          console.error('Error updating long term goal:', error);
        });
    }
  }

  getSavedAnswer(questionId: number): any {
    return this.selectedAnswers[questionId];
  }

  get currentQuestion(): Question {
    return this.questionsPage.content[this.currentQuestionIndex];
  }

  getCurrentFormGroup(question: Question): FormGroup {
    switch (question.questionType) {
      case 'CHRONOTYPE':
        return this.chronotypeForm;
      case 'TEMPER':
        return this.temperForm;
      case 'LONG_TERM_GOAL':
      case 'SHORT_TERM_GOAL':
      case 'DAYS':
      case 'RESTART':
        return this.personalGoalsForm;
      default:
        throw new Error('Unknown question type');
    }
  }

  getFormControlName(question: Question): string {
    return `${question.questionType.toLowerCase()}Question${question.id}`;
  }

  loadUserAvatar(userId: number): void {
    this.userService.getUserAvatar(userId)
      .pipe(
        catchError(error => {
          console.error('Error loading user avatar:', error);
          return of(null);
        })
      )
      .subscribe(avatar => {
        if (avatar) {
          this.userAvatarUrl = avatar.image;
          this.userAvatarDescription = avatar.description;
          this.userAvatarChronotype = avatar.chronotype;
          this.userAvatarTemper = avatar.temper;
          this.userAvatarTemperDescription = avatar.temper.description;
          this.userAvatarChronotypeDescription = avatar.chronotype.description;
          this.userAvatarChronotypeMaxEnergyType = avatar.chronotype.maxEnergyType;
          this.userAvatarTemperStrength = avatar.temper.strengthType;
          this.userAvatarTemperRisk = avatar.temper.riskType;

          this.loadImageAndShowAvatar(this.userAvatarUrl);
        } else {
          this.loadingService.setLoading(false);
        }


      });
      this.loadingService.setLoading(false);
  }

  private loadImageAndShowAvatar(imageUrl: string): void {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      this.showAvatar = true;
      this.loadingService.setLoading(false);
    };

    img.onerror = (error) => {
      console.error('Error loading avatar image:', error);
      this.loadingService.setLoading(false);
    };
  }

  isCurrentAnswerValid(): boolean {
    const currentQuestion = this.currentQuestion;
    const currentFormGroup = this.getCurrentFormGroup(currentQuestion);
    const control = currentFormGroup?.get(this.getFormControlName(currentQuestion));

    if (!control) return false;

    switch (currentQuestion.questionType) {
      case 'CHRONOTYPE':
      case 'TEMPER':
        return control.value !== null && control.value !== '';
      case 'LONG_TERM_GOAL':
      case 'SHORT_TERM_GOAL':
        return control.value !== null && control.value.trim() !== '' && control.value.length >= 3 && control.value.length <= 30;
      case 'DAYS':
        const value = control.value;
        return value !== null && !isNaN(value) && value >= 1 && value <= 365;
      case 'RESTART':
        return control.value !== null;
      default:
        return false;
    }
  }

  createStudyPlanAndAssociateMantras(): void {
    this.loadingService.setLoading(true);
    const userId = this.authService.getUserId();
    if (userId !== null) {
      const shortTermGoalQuestion = this.questionsPage.content.find(question => question.questionType === 'SHORT_TERM_GOAL');
      const shortTermGoalQuestionId = shortTermGoalQuestion?.id;
      const shortTermGoal = shortTermGoalQuestionId ? this.textAnswers[shortTermGoalQuestionId] : null;
      const daysQuestion = this.questionsPage.content.find(question => question.questionType === 'DAYS');
      const daysQuestionId = daysQuestion?.id;
      const numberOfDays = daysQuestionId ? this.selectedAnswers[daysQuestionId] : null;

      if (shortTermGoal !== null && numberOfDays !== null) {
        const studyPlanDTO = {
          shortTermGoal: shortTermGoal,
          numberOfDays: numberOfDays
        };

        this.answerService.createStudyPlan(userId, studyPlanDTO).pipe(
          catchError(error => {
            console.error('Error creating study plan:', error);
            return throwError('Error creating study plan. Please try again later.');
          })
        ).subscribe((studyPlanResponse) => {
          console.log('Study plan created:', studyPlanResponse);

          this.answerService.addMantrasToStudyPlan(userId).pipe(
            catchError(error => {
              console.error('Error adding mantras to study plan:', error);
              return throwError('Error adding mantras to study plan. Please try again later.');
            })
          ).subscribe((mantrasResponse) => {
            console.log('Mantras added to study plan:', mantrasResponse);
            this.router.navigate(['/study-plan']);
            this.loadingService.setLoading(false);
          });
        });
      } else {
        console.error('Unable to fetch shortTermGoal or numberOfDays from user responses.');
        this.loadingService.setLoading(false);
      }
    } else {
      console.error('UserId is null. Unable to create study plan or add mantras.');
    }
  }
}
