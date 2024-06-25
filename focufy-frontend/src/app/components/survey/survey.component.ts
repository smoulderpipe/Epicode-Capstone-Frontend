import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, catchError, forkJoin, of, throwError } from 'rxjs';
import { Answer, PersonalAnswerType } from 'src/app/models/answer';
import { AssignSharedAnswer } from 'src/app/models/assignSharedAnswer';
import { Page } from 'src/app/models/page';
import { Question } from 'src/app/models/question';
import { AnswerService } from 'src/app/services/answer.service';
import { AuthService } from 'src/app/services/auth.service';
import { SurveyService } from 'src/app/services/survey.service';

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

  constructor(
    private surveyService: SurveyService,
    private answerService: AnswerService,
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
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
      },
      (error) => {
        console.log(`Error loading answers for question ${questionId}:`, error);
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
      case 'SATISFACTION':
        this.selectedAnswers[questionId] = +answerValue;
        break;

      default:
        console.warn(`Unhandled question type: ${currentQuestion.questionType}`);
        break;
    }
  }

  submitAnswers(): void {
    console.log('Selected answers:', this.selectedAnswers);
    console.log('Text answers:', this.textAnswers);
  
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
                return of([] as Answer[]); // return an empty array if there is an error
              })
            );
            sharedAnswersObservables.push(observable);
            break;
  
          case 'DAYS':
          case 'SATISFACTION':
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
              userId: userId, // Ensure userId is a number
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
  
    sharedAnswersObservables.forEach((observable, index) => {
      observable.subscribe(
        answers => {
          const questionId = Number(Object.keys(this.selectedAnswers)[index]);
          const answer = this.selectedAnswers[questionId];
          const matchingAnswer = answers.find(a => a.id === answer);
          if (matchingAnswer) {
            sharedAnswers.push({
              questionId: questionId,
              answerId: matchingAnswer.id
            });
          }
        },
        error => {
          hasErrors = true;
          errorMessage = `Error loading shared answers for this question`;
          console.error(errorMessage);
        }
      );
    });
  
    const allSharedObservablesComplete = new Promise((resolve) => {
      if (sharedAnswersObservables.length === 0) {
        resolve(true);
      } else {
        Promise.all(sharedAnswersObservables.map(obs => obs.toPromise())).then(() => {
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      }
    });
  
    allSharedObservablesComplete.then(sharedCompleted => {
      if (hasErrors || !sharedCompleted) {
        if (errorMessage) {
          console.error('Error submitting answers:', errorMessage);
        } else {
          console.error('An error occurred while submitting answers.');
        }
        return;
      }
  
      if (sharedAnswers.length > 0) {
        this.answerService.assignSharedAnswersToUser(sharedAnswers)
          .pipe(
            catchError(error => {
              console.error('Error assigning shared answers:', error);
              return throwError('Something went wrong. Please try again later.');
            })
          )
          .subscribe(
            response => {
              console.log('Shared answers assigned:', response);
            }
          );
      }
  
      if (personalAnswers.length > 0) {
        this.answerService.savePersonalAnswers(personalAnswers)
          .pipe(
            catchError(error => {
              console.error('Error saving personal answers:', error);
              return throwError('Something went wrong. Please try again later.');
            })
          )
          .subscribe(
            (response) => {
              console.log('Personal answers saved:', response);
              this.displayUserAvatar();
            }
          );
      } else {
        this.displayUserAvatar();
      }
    });
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
      case 'SATISFACTION':
      case 'RESTART':
        return this.personalGoalsForm;
      default:
        throw new Error('Unknown question type');
    }
  }

  getFormControlName(question: Question): string {
    return `${question.questionType.toLowerCase()}Question${question.id}`;
  }

  displayUserAvatar(): void {
    this.userAvatarUrl = 'path/to/avatar/image.png';
    this.userAvatarDescription = 'Description of the avatar';

    this.showAvatar = true;
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
        return control.value !== null && control.value.trim() !== '';
      case 'DAYS':
      case 'SATISFACTION':
      case 'RESTART':
        return control.value !== null;
      default:
        return false;
    }
  }
}