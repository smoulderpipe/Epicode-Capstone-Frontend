import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from 'src/app/components/login/login.component';
import { RegisterComponent } from 'src/app/components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SurveyComponent } from '../components/survey/survey.component';
import { StudyPlanComponent } from '../components/study-plan/study-plan.component';
import { RouterModule } from '@angular/router';
import { ModalComponent } from '../components/modal/modal.component';
import { ModalService } from '../services/modal.service';
@NgModule({
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    SurveyComponent,
    StudyPlanComponent,
    ModalComponent
  ],
  exports: [
    LoginComponent,
    RegisterComponent,
    SurveyComponent,
    StudyPlanComponent,
    ModalComponent
  ],
  providers: [
    ModalService
  ]
  
})
export class SharedModule { }