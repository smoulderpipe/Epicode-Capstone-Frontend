import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudyPlanResolver } from './studyPlanResolver';

const routes: Routes = [
  { path: '', loadChildren: () => import('src/app/modules/home-routing.module').then(m => m.HomeRoutingModule) }, 
  { path: 'login', loadChildren: () => import('src/app/modules/login-routing.module').then(m => m.LoginRoutingModule) },
  { path: 'register', loadChildren: () => import('src/app/modules/register-routing.module').then(m => m.RegisterRoutingModule)},
  { path: 'survey', loadChildren: () => import('src/app/modules/survey-routing.module').then(m => m.SurveyRoutingModule)},
  { path: 'study-plan', 
    loadChildren: () => import('src/app/modules/study-plan-routing.module').then(m => m.StudyPlanRoutingModule),
    resolve: { studyPlan: StudyPlanResolver }},
  { path: 'profile', loadChildren: () => import('src/app/modules/profile-routing.module').then(m => m.ProfileRoutingModule)},
  { path: 'confirm-registration', loadChildren: () => import('src/app/modules/confirm-registration-routing.module').then(m => m.ConfirmRegistrationRoutingModule)},
  { path: 'forgot-password', loadChildren: () => import('src/app/modules/forgot-password-routing.module').then(m => m.ForgotPasswordRoutingModule)},
  { path: 'change-credentials', loadChildren: () => import('src/app/modules/change-credentials-routing.module').then(m => m.ChangeCredentialsRoutingModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingRoutingModule { }
