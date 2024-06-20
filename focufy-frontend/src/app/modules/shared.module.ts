import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from 'src/app/components/login/login.component';
import { RegisterComponent } from 'src/app/components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SurveyComponent } from '../components/survey/survey.component';
@NgModule({
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    SurveyComponent
  ],
  exports: [
    LoginComponent,
    RegisterComponent
  ]
})
export class SharedModule { }