import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent
  },
  // lub lazy loading czy inne ścieżki
  {
    path: '**',
    redirectTo: ''
  }
];
