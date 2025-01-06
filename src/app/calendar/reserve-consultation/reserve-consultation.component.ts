import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import {CalendarService, Appointment} from '../calendar.service';
import {CartService} from '../../cart/cart.service';

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

  constructor(private calendarService: CalendarService,
              private cartService: CartService ) {
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

    // 1) Pobierz wartości z formularza
    const formVal = this.reserveForm.value;
    // zakładamy, że mamy np. formControlName="day", "time", "slotsCount", "type", etc.

    // 2) Parsuj je na momenty (zakładamy, że instalowałeś moment.js)
    const dayMoment = moment(formVal.day, 'YYYY-MM-DD'); // data w formacie YYYY-MM-DD
    const [hour, minute] = formVal.time.split(':');      // np. "08:00" => ["08","00"]
    const start = moment(dayMoment).hour(+hour).minute(+minute);

    // Załóżmy, że w formularzu mamy `slotsCount` = liczba slotów 30-minutowych
    const end = moment(start).add(formVal.slotsCount * 30, 'minutes');

    // 3) Stwórz obiekt rezerwacji
    const newAppt: Appointment = {
      id: 0,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      type: formVal.type,
      patientName: formVal.patientName,
      status: 'IN_CART'
    };

    this.calendarService.addAppointment(moment(newAppt.startTime), newAppt);

    // 4) Dodajemy do koszyka (jeśli taki jest zamysł Zadania 5)
    this.cartService.addToCart(newAppt);

    alert('Konsultacja została dodana do koszyka!');
  }


}
