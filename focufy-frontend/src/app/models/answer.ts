import { Question } from "./question";

export enum PersonalAnswerType {
    DAYS = 'DAYS',
    SHORT_TERM_GOAL = 'SHORT_TERM_GOAL',
    LONG_TERM_GOAL = 'LONG_TERM_GOAL',
    SATISFACTION = 'SATISFACTION',
    RESTART = 'RESTART'
  }

  export enum SharedAnswerType {
    LION = 'LION',
    BEAR = 'BEAR',
    DOLPHIN = 'DOLPHIN',
    WOLF = 'WOLF',
    WHIMSICAL = 'WHIMSICAL',
    TENACIOUS = 'TENACIOUS',
    TACTICAL = 'TACTICAL',
    GREEDY = 'GREEDY'
  }
  
export interface Answer{
    id: number;
    answerText: string;
    question: Question;
    personalAnswerType: PersonalAnswerType;
    sharedAnswerType: SharedAnswerType; 
}