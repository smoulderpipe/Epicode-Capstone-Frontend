import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from 'src/app/components/login/login.component';
import { RegisterComponent } from 'src/app/components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SurveyComponent } from '../components/survey/survey.component';
import { StudyPlanComponent } from '../components/study-plan/study-plan.component';
import { RouterModule } from '@angular/router';
import { ModalService } from '../services/modal.service';
import { ModalModule } from './modal.module';
@NgModule({
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule, ModalModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    SurveyComponent,
    StudyPlanComponent
  ],
  exports: [
    LoginComponent,
    RegisterComponent,
    SurveyComponent,
    StudyPlanComponent
  ],
  providers: [
    ModalService
  ]
  
})
export class SharedModule { }