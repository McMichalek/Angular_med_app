import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import {CalendarViewComponent} from './calendar/calendar-view/calendar-view.component';
import {DefineAvailabilityComponent} from './calendar/define-availability/define-availability.component';
import {DefineAbsenceComponent} from './calendar/define-absence/define-absence.component';

export const routes: Routes = [
  {
    path: '',
    component: CalendarViewComponent
  },
  {
    path: 'define-availability', component: DefineAvailabilityComponent
  },
  {
    path: 'define-absence',
    component: DefineAbsenceComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
