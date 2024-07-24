import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared.module';
import { ConfirmRegistrationComponent } from '../components/confirm-registration/confirm-registration.component';

const routes: Routes = [
  { path: '', component: ConfirmRegistrationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule ],
  exports: [RouterModule]
})
export class ConfirmRegistrationRoutingModule { }