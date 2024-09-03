import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudyPlanResolver } from './studyPlanResolver';
import { HealthGuard } from './guards/health.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '', loadChildren: () => import('src/app/modules/home-routing.module').then(m => m.HomeRoutingModule),
    canActivate: [HealthGuard]
  },
  { path: 'login', loadChildren: () => import('src/app/modules/login-routing.module').then(m => m.LoginRoutingModule) },
  { path: 'register', loadChildren: () => import('src/app/modules/register-routing.module').then(m => m.RegisterRoutingModule) },
  {
    path: 'survey', loadChildren: () => import('src/app/modules/survey-routing.module').then(m => m.SurveyRoutingModule),
    canActivate: [HealthGuard, AuthGuard],
    data: { requiresAuth: true }
  },
  {
    path: 'study-plan',
    loadChildren: () => import('src/app/modules/study-plan-routing.module').then(m => m.StudyPlanRoutingModule),
    canActivate: [HealthGuard, AuthGuard],
    data: { requiresAuth: true },
    resolve: { studyPlan: StudyPlanResolver }

  },
  {
    path: 'profile', loadChildren: () => import('src/app/modules/profile-routing.module').then(m => m.ProfileRoutingModule),
    canActivate: [HealthGuard, AuthGuard]
  },
  { path: 'confirm-registration', loadChildren: () => import('src/app/modules/confirm-registration-routing.module').then(m => m.ConfirmRegistrationRoutingModule) },
  { path: 'forgot-password', loadChildren: () => import('src/app/modules/forgot-password-routing.module').then(m => m.ForgotPasswordRoutingModule) },
  {
    path: 'change-credentials', loadChildren: () => import('src/app/modules/change-credentials-routing.module').then(m => m.ChangeCredentialsRoutingModule),
    canActivate: [HealthGuard, AuthGuard],
    data: { requiresAuth: true }
  },
  {
    path: 'service-unavailable',
    loadChildren: () => import('src/app/modules/service-unavailable-routing.module').then(m => m.ServiceUnavailableRoutingModule)
  }
  // ,
  // {
  //   path: '**',
  //   redirectTo: ''
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingRoutingModule { }
