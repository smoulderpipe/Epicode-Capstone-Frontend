import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared.module';
import { ServiceUnavailableComponent } from '../components/service-unavailable/service-unavailable.component';

const routes: Routes = [
  { path: '', component: ServiceUnavailableComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule ],
  exports: [RouterModule]
})
export class ServiceUnavailableRoutingModule { }