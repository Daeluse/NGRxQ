import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { GoalAnalyticsComponent } from './goal-analytics/goal-analytics.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'goal-analytics', component: GoalAnalyticsComponent },
];

export const routing = RouterModule.forRoot(routes);
