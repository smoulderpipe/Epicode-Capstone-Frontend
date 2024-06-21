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
    return `${question.questionType.toLowerCase()}Question${question.id}`;
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