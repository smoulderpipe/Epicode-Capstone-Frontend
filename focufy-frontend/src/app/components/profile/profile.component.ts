import { Component, OnInit } from '@angular/core';
import { Avatar } from 'src/app/models/avatar';
import { StudyPlan } from 'src/app/models/studyPlan';
import { User } from 'src/app/models/user';
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
    private studyPlanService: StudyPlanService
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
}