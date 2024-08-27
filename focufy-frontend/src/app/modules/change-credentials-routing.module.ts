import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared.module';
import { ChangeCredentialsComponent } from '../components/change-credentials/change-credentials.component';

const routes: Routes = [
  { path: '', component: ChangeCredentialsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule ],
  exports: [RouterModule]
})
export class ChangeCredentialsRoutingModule { }