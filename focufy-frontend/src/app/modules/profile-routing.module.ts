import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared.module';
import { ProfileComponent } from '../components/profile/profile.component';

const routes: Routes = [
  { path: '', component: ProfileComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule, RouterModule ],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }