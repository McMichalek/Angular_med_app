import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import {CalendarViewComponent} from './calendar/calendar-view/calendar-view.component';
import {DefineAvailabilityComponent} from './calendar/define-availability/define-availability.component';

export const routes: Routes = [
  {
    path: '',
    component: CalendarViewComponent
  },
  {
    path: 'define-availability', component: DefineAvailabilityComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
