import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import {CalendarService} from '../calendar.service';

import moment from 'moment';

@Component({
  selector: 'app-define-absence',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './define-absence.component.html',
  styleUrl: './define-absence.component.css'
})
export class DefineAbsenceComponent {
  absenceForm = new FormGroup({
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
    reason: new FormControl(''),
  });

  constructor(private calendarService: CalendarService) {}

  onSubmit() {
    if (this.absenceForm.invalid) {
      return;
    }
    const { startDate, endDate, reason } = this.absenceForm.value;

    // Upewnij się, że startDate <= endDate w warstwie logiki:
    if (moment(startDate).isAfter(moment(endDate))) {
      alert('Data początkowa nie może być późniejsza niż końcowa!');
      return;
    }

    const newAbs = {
      id: 0,
      startDate: startDate as string,
      endDate: endDate as string,
      reason: endDate as string
    };
    this.calendarService.addAbsence(newAbs);

    this.absenceForm.reset();
  }
}
