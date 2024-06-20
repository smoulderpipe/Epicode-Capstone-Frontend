import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Answer } from 'src/app/models/answer';
import { Page } from 'src/app/models/page';
import { Question } from 'src/app/models/question';
import { QuestionType } from 'src/app/models/questionType';
import { AnswerService } from 'src/app/services/answer.service';
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

  constructor(
    private surveyService: SurveyService,
    private answerService: AnswerService,
    private fb: FormBuilder
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
          if (question.questionType === 'CHRONOTYPE') {
            this.chronotypeFormControls[question.id] = new FormControl(null);
            this.chronotypeForm.addControl(this.getFormControlName(question), this.chronotypeFormControls[question.id]);
          } else if (question.questionType === 'TEMPER') {
            this.temperFormControls[question.id] = new FormControl(null);
            this.temperForm.addControl(this.getFormControlName(question), this.temperFormControls[question.id]);
          } else if (question.questionType === 'LONG_TERM_GOAL') {
            this.personalGoalsForm.addControl(
              `ltGoalStringQuestion${question.id}`,
              new FormControl(null)
            );
          } else if (question.questionType === 'SHORT_TERM_GOAL') {
            this.personalGoalsForm.addControl(
              `stGoalStringQuestion${question.id}`,
              new FormControl(null)
            );
          } else if (question.questionType === 'DAYS') {
            this.personalGoalsForm.addControl(
              `daysQuestion${question.id}`,
              new FormControl(null)
            );
          } else if (question.questionType === 'SATISFACTION') {
            this.personalGoalsForm.addControl(
              `satisfactionQuestion${question.id}`,
              new FormControl(null)
            );
          } else if (question.questionType === 'RESTART') {
            this.personalGoalsForm.addControl(
              `restartQuestion${question.id}`,
              new FormControl(null)
            );
          }
          this.loadAnswersForQuestion(question.id);
        });
      },
      (error) => {
        console.log('Error loading questions:', error);
      }
    );
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
    if (this.currentQuestionIndex < this.questionsPage.content.length - 1) {
      const currentQuestion = this.currentQuestion;
      const currentFormGroup = this.getCurrentFormGroup(currentQuestion);
      if (currentFormGroup) {
        const answerControl = currentFormGroup.get(this.getFormControlName(currentQuestion));
        if (answerControl) {
          const answerValue = answerControl.value;
          this.saveAnswer(currentQuestion.id, answerValue);
        }
      }
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

    console.log(`Answer saved for question ${questionId}:`, this.selectedAnswers[questionId]);
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
    switch (question.questionType) {
      case 'CHRONOTYPE':
        return `chronotype_${question.id}`;
      case 'TEMPER':
        return `temper_${question.id}`;
      case 'LONG_TERM_GOAL':
      return `ltGoalStringQuestion${question.id}`;
      case 'SHORT_TERM_GOAL':
      return `stGoalStringQuestion${question.id}`;
      case 'DAYS':
      return `daysQuestion${question.id}`;
      case 'SATISFACTION':
      return `satisfactionQuestion${question.id}`;
      case 'RESTART':
      return `restartQuestion${question.id}`;
      default:
        throw new Error(`Unsupported question type: ${question.questionType}`);
    }
  }

  isCurrentAnswerValid(): boolean {
    const currentQuestion = this.currentQuestion;
    const currentFormGroup = this.getCurrentFormGroup(currentQuestion);

    switch (currentQuestion.questionType) {
      case 'CHRONOTYPE':
      case 'TEMPER':
        const control = currentFormGroup?.get(this.getFormControlName(currentQuestion));
        return !!(control && control.value !== null && control.value !== '');

      case 'LONG_TERM_GOAL':
        // For LONG_TERM_GOAL, validate directly from the personalGoalsForm
        const ltGoalsStringControl = currentFormGroup?.get(`ltGoalStringQuestion${currentQuestion.id}`);
        return !!(ltGoalsStringControl && ltGoalsStringControl.value !== null && ltGoalsStringControl.value.trim() !== '');

      case 'SHORT_TERM_GOAL':
        const stGoalsStringControl = currentFormGroup?.get(`stGoalStringQuestion${currentQuestion.id}`);
        return !!(stGoalsStringControl && stGoalsStringControl.value !== null && stGoalsStringControl.value.trim() !== '');

      case 'DAYS':
        const daysControl = currentFormGroup?.get(`daysQuestion${currentQuestion.id}`);
        return !!(daysControl && daysControl.value !== null);

      case 'SATISFACTION':
        const satisfactionControl = currentFormGroup?.get(`satisfactionQuestion${currentQuestion.id}`);
        return !!(satisfactionControl && satisfactionControl.value !== null);

      case 'RESTART':
        const restartControl = currentFormGroup?.get(`restartQuestion${currentQuestion.id}`);
        return !!(restartControl && restartControl.value !== null);

      default:
        return false;
    }
  }
}