import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared.module';
import { StudyPlanComponent } from '../components/study-plan/study-plan.component';

const routes: Routes = [
  { path: '', component: StudyPlanComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule, RouterModule ],
  exports: [RouterModule]
})
export class StudyPlanRoutingModule { }