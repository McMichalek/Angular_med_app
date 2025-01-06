import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import {CalendarService, Appointment} from '../calendar.service';

import moment from 'moment';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-reserve-consultation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reserve-consultation.component.html',
  styleUrl: './reserve-consultation.component.css'
})
export class ReserveConsultationComponent implements OnInit {

  reserveForm: FormGroup;

  // Możliwe typy wizyt (przykładowe)
  consultationTypes = [
    'pierwsza wizyta',
    'wizyta kontrolna',
    'choroba przewlekła',
    'recepta',
    'inne'
  ];

  // Zakładamy, że start konsultacji i data mogą być przekazywane
  // np. przez query param (jeśli używasz routingu) albo w inny sposób.
  selectedDay: string | null = null;   // 'YYYY-MM-DD'
  selectedTime: string | null = null;  // 'HH:mm'

  constructor(private calendarService: CalendarService) {
    this.reserveForm = new FormGroup({
      day: new FormControl('', Validators.required),       // data w formacie 'YYYY-MM-DD'
      time: new FormControl('', Validators.required),      // godzina startu np. '08:00'
      slotsCount: new FormControl(1, [Validators.required, Validators.min(1)]),  // ile slotów 30-minutowych
      type: new FormControl('pierwsza wizyta', Validators.required),
      patientName: new FormControl('', Validators.required),
      patientGender: new FormControl('M', Validators.required),
      patientAge: new FormControl(18, [Validators.required, Validators.min(0)]),
      notes: new FormControl('')
    });
  }

  ngOnInit(): void {
    // Jeżeli chcesz ustawić domyślnie wybrany slot (np. po kliknięciu w kalendarzu)
    if (this.selectedDay && this.selectedTime) {
      this.reserveForm.patchValue({
        day: this.selectedDay,
        time: this.selectedTime
      });
    }
  }

  onSubmit(): void {
    if (this.reserveForm.invalid) {
      return;
    }
    const formVal = this.reserveForm.value;

    // 1. Parsujemy datę + startTime
    const dayMoment = moment(formVal.day, 'YYYY-MM-DD');
    const timeParts = formVal.time.split(':'); // ["HH","mm"]
    const start = moment(dayMoment).hour(+timeParts[0]).minute(+timeParts[1]);

    // 2. Obliczamy endTime = start + (slotsCount * 30 min)
    const end = moment(start).add(formVal.slotsCount * 30, 'minutes');

    // 3. Sprawdzamy, czy slot jest wolny (brak konfliktu, brak absencji)
    const conflict = this.calendarService.checkConflict(dayMoment, start, end);
    if (conflict) {
      alert('Wybrany przedział czasowy jest już zajęty lub koliduje z inną wizytą!');
      return;
    }

    // 4. Tworzymy Appointment
    const newAppt: Appointment = {
      id: 0, // nadamy ID w serwisie
      startTime: start.toISOString(), // np. '2025-01-05T08:00:00'
      endTime: end.toISOString(),
      type: formVal.type,
      patientName: formVal.patientName,
      status: 'CONFIRMED', // nowa rezerwacja
      // (opcjonalnie)
      // patientGender, patientAge, notes itp. można dodać do Appointment
    };

    // 5. Dodajemy rezerwację w serwisie
    this.calendarService.addAppointment(dayMoment, newAppt);

    alert('Rezerwacja została zapisana.');
    // Ewentualnie reset i nawigacja
    this.reserveForm.reset();
  }


}
