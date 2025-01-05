import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CommonModule} from '@angular/common';
import {CalendarViewComponent} from './calendar/calendar-view/calendar-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // imports: [RouterOutlet],
  imports: [
    CommonModule,
    CalendarViewComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'webapp';
}
