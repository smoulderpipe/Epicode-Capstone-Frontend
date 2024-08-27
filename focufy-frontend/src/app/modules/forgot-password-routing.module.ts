import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared.module';
import { ForgotPasswordComponent } from '../components/forgot-password/forgot-password.component';

const routes: Routes = [
  { path: '', component: ForgotPasswordComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule ],
  exports: [RouterModule]
})
export class ForgotPasswordRoutingModule { }