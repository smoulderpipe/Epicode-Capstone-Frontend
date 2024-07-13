import { Question } from "./question";

export enum PersonalAnswerType {
  DAYS = 'DAYS',
  SHORT_TERM_GOAL = 'SHORT_TERM_GOAL',
  LONG_TERM_GOAL = 'LONG_TERM_GOAL',
  SATISFACTION = 'SATISFACTION',
  CHECKPOINT = 'CHECKPOINT',
  DEADLINE = 'DEADLINE',
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

export enum CDAnswerType {
  STUDY = 'STUDY',
  FUN = 'FUN',
  REST = 'REST'
}

export interface CheckpointAnswer {
  questionId: number;
  answerText: string;
  checkpointDayId: number;
  answerType: CDAnswerType;
}

export interface DeadlineAnswer {
  questionId: number;
  answerText: string;
  deadlineDayId: number;
  answerType: CDAnswerType;
}

export interface Answer {
  id: number;
  answerText: string;
  question: Question;
  personalAnswerType: PersonalAnswerType;
  sharedAnswerType: SharedAnswerType;

}