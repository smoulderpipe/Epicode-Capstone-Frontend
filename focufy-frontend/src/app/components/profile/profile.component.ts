import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Avatar } from 'src/app/models/avatar';
import { Question } from 'src/app/models/question';
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
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private studyPlanService: StudyPlanService,
    private answerService: AnswerService,
    private router: Router
  ) {}

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
    }
  }

  confirmRestart() {
    const confirmation = confirm(`Would you like to start a new adventure? \n\nWARNING \nBy proceeding, you will PERMANENTLY DELETE your study plan, your avatar and your goals.`);
    if (confirmation) {
      this.onRestartAnswer();
    } else {
      // Azioni da eseguire se l'utente annulla l'operazione
    }
  }

  onRestartAnswer() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User ID not found');
      return;
    }
  
    const answers: any[] = [];
  
    // Esegui la logica per costruire le risposte basate sulla domanda
    // Se non hai bisogno di question qui, non c'è bisogno di utilizzarla
  
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