import { Question } from "./question";

export enum PersonalAnswerType {
    DAYS = 'DAYS',
    SHORT_TERM_GOAL = 'SHORT_TERM_GOAL',
    LONG_TERM_GOAL = 'LONG_TERM_GOAL',
    SATISFACTION = 'SATISFACTION',
    RESTART = 'RESTART'
  }
  
export interface Answer{
    id: number;
    answerText: string;
    question: Question;
    personalAnswerType: PersonalAnswerType; 
}