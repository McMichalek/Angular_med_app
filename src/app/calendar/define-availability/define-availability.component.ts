import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators} from '@angular/forms';
import {CalendarService} from '../calendar.service';

import moment from 'moment';

@Component({
  selector: 'app-define-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './define-availability.component.html',
  styleUrl: './define-availability.component.css'
})
export class DefineAvailabilityComponent {
  availabilityForm: FormGroup;

  // Dla uproszczenia – używamy checkboxów do wyboru dni
  daysOfWeekOptions = [
    { label: 'Niedziela', value: 0 },
    { label: 'Poniedziałek', value: 1 },
    { label: 'Wtorek', value: 2 },
    { label: 'Środa', value: 3 },
    { label: 'Czwartek', value: 4 },
    { label: 'Piątek', value: 5 },
    { label: 'Sobota', value: 6 },
  ];

  constructor(private calendarService: CalendarService) {
    this.availabilityForm = new FormGroup({
      type: new FormControl<'CYCLIC' | 'ONE_TIME'>('CYCLIC', { nonNullable: true }),
      startDate: new FormControl('', Validators.required),
      endDate: new FormControl(''),
      daysOfWeek: new FormArray([]), // array, do checkboxów
      timeRanges: new FormArray([]), // array, wypełnimy w UI
    });

    // Dodajemy jeden domyślny timeRange
    this.addTimeRange();
  }

  // Getter do rzutowania timeRanges
  get timeRanges(): FormArray {
    return this.availabilityForm.get('timeRanges') as FormArray;
  }

  addTimeRange(): void {
    const group = new FormGroup({
      from: new FormControl('', Validators.required),
      to: new FormControl('', Validators.required),
    });
    this.timeRanges.push(group);
  }

  removeTimeRange(index: number): void {
    this.timeRanges.removeAt(index);
  }

  // daysOfWeek
  get daysOfWeekArray(): FormArray {
    return this.availabilityForm.get('daysOfWeek') as FormArray;
  }

  onDayOfWeekChange(value: number, isChecked: boolean) {
    if (isChecked) {
      this.daysOfWeekArray.push(new FormControl(value));
    } else {
      const index = this.daysOfWeekArray.controls.findIndex(c => c.value === value);
      if (index >= 0) {
        this.daysOfWeekArray.removeAt(index);
      }
    }
  }

  onSubmit(): void {
    if (this.availabilityForm.invalid) {
      return;
    }

    const rawValue = this.availabilityForm.value;
    // Ustalmy endDate = startDate, jeśli type=ONE_TIME
    if (rawValue.type === 'ONE_TIME') {
      rawValue.endDate = rawValue.startDate;
    }

    // Tworzymy obiekt:
    const newAv = {
      id: 0,
      type: rawValue.type,
      startDate: rawValue.startDate,
      endDate: rawValue.endDate,
      daysOfWeek: rawValue.type === 'CYCLIC' ? rawValue.daysOfWeek : [],
      timeRanges: rawValue.timeRanges || [],
    };

    // Dodajemy w serwisie
    this.calendarService.addAvailability(newAv);
    // Ewentualnie resetujemy formularz
    this.availabilityForm.reset({
      type: 'CYCLIC'
    });
  }
}
