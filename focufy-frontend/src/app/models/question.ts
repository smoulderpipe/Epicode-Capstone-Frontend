import { Answer } from "./answer";
import { QuestionType } from "./questionType";

export interface Question{
    id: number;
    questionText: string;
    questionType: QuestionType;
    answers: Answer[];
    answerType: string;
}