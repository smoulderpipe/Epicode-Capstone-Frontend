import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared.module';
import { SurveyComponent } from '../components/survey/survey.component';

const routes: Routes = [
  { path: '', component: SurveyComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule, RouterModule ],
  exports: [RouterModule]
})
export class SurveyRoutingModule { }