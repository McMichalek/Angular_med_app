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
  absenceForm: FormGroup;

  constructor(private calendarService: CalendarService) {
    this.absenceForm = new FormGroup({
      date: new FormControl('', Validators.required),
      reason: new FormControl(''),
    });
  }

  onSubmit(): void {
    if (this.absenceForm.invalid) {
      return;
    }

    const rawValue = this.absenceForm.value;
    const newAbs = {
      id: 0,
      date: rawValue.date,   // YYYY-MM-DD
      reason: rawValue.reason,
    };

    // Dodajemy do serwisu, co anuluje konfliktujące wizyty
    this.calendarService.addAbsence(newAbs);

    // Reset
    this.absenceForm.reset();
  }
}
