import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('src/app/modules/home-routing.module').then(m => m.HomeRoutingModule) }, 
  { path: 'login', loadChildren: () => import('src/app/modules/login-routing.module').then(m => m.LoginRoutingModule) },
  { path: 'register', loadChildren: () => import('src/app/modules/register-routing.module').then(m => m.RegisterRoutingModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingRoutingModule { }
