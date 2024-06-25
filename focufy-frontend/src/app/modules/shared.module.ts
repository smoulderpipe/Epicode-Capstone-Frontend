import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from 'src/app/components/login/login.component';
import { RegisterComponent } from 'src/app/components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SurveyComponent } from '../components/survey/survey.component';
import { StudyPlanComponent } from '../components/study-plan/study-plan.component';
@NgModule({
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule
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
  ]
})
export class SharedModule { }