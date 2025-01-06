import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import {CalendarViewComponent} from './calendar/calendar-view/calendar-view.component';
import {DefineAvailabilityComponent} from './calendar/define-availability/define-availability.component';
import {DefineAbsenceComponent} from './calendar/define-absence/define-absence.component';
import {ReserveConsultationComponent} from './calendar/reserve-consultation/reserve-consultation.component';
import {CartComponent} from './cart/cart/cart.component';

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
  { path: 'reserve-consultation',
    component: ReserveConsultationComponent },
  {
    path: 'cart',
    component: CartComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
