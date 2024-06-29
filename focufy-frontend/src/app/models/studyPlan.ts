import { Question } from "./question";

export interface StudyPlan {
    shortTermGoal: string;
    days: Day[];
  }

  export interface Mantra {
    text: string;
  }
  
  export interface ActivitySession {
    activitySessionType: string;
    startTime: string;
    duration: number;
  }

export interface Day {
  id: number;
  type: 'StudyDay' | 'CheckpointDay' | 'DeadlineDay';
  mantra?: Mantra;
  activitySessions?: ActivitySession[];
  questions?: Question[];
  name: string;
  date: string;
}

