// src/app/calendar/calendar.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import moment from 'moment';

// Modele: proste typy opisujące strukturę danych
export interface Appointment {
  id: number;
  startTime: string;   // '2025-01-05T08:00:00'
  endTime: string;     // '2025-01-05T08:30:00'
  type: string;        // np. 'pierwsza wizyta', 'kontrolna' itd.
  patientName: string; // np. 'Jan Kowalski'
  status: 'CONFIRMED' | 'CANCELLED' | 'DONE' | 'PAST';
}

export interface DayAppointments {
  date: string;                // '2025-01-05'
  appointments: Appointment[]; // lista konsultacji w tym dniu
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(private http: HttpClient) {}

  private absences: Absence[] = [];

  private availabilities: Availability[] = [];

  public appointmentsData: DayAppointments[] = [];

  addAbsence(abs: Absence): void {
    // Generowanie id:
    abs.id = this.absences.length > 0
      ? Math.max(...this.absences.map(a => a.id)) + 1
      : 1;
    this.absences.push(abs);

    // Sprawdzamy konflikt:
    this.cancelAppointmentsForAbsence(abs.date);
  }

  getAbsences(): Absence[] {
    return this.absences;
  }

  public getAppointments(): Observable<DayAppointments[]> {
    // Uwaga: plik JSON w folderze "src/assets/appointments.json"
    return this.http.get<DayAppointments[]>('assets/appointments.json');
  }

  // Dodanie nowej dostępności
  addAvailability(av: Availability): void {
    // Prosta implementacja: generujemy ID
    av.id = this.availabilities.length > 0
      ? Math.max(...this.availabilities.map(a => a.id)) + 1
      : 1;
    this.availabilities.push(av);
  }

  // Pobranie dostępności
  getAvailabilities(): Availability[] {
    return this.availabilities;
  }

  isSlotInAvailability(day: moment.Moment, slot: moment.Moment): boolean {
    // Przechodzimy po wszystkich availability:
    for (const av of this.availabilities) {
      // 1) Sprawdzamy, czy day jest w przedziale [startDate, endDate]
      const startDate = moment(av.startDate, 'YYYY-MM-DD');
      const endDate = av.endDate
        ? moment(av.endDate, 'YYYY-MM-DD')
        : startDate; // jeżeli brak endDate, przyjmujemy = startDate (ONE_TIME)

      if (day.isBetween(startDate, endDate, 'day', '[]')) {
        // 2) Sprawdzamy, czy pasuje maska dni (dla CYCLIC)
        if (av.type === 'CYCLIC' && av.daysOfWeek) {
          // day.day() zwraca: niedziela=0, pon=1, wt=2, ...
          const dow = day.day();
          if (!av.daysOfWeek.includes(dow)) {
            continue; // nie pasuje do tej dostępności, sprawdzamy dalej
          }
        } else if (av.type === 'ONE_TIME') {
          // day musi być dokładnie = av.startDate (lub w granicach)
          if (!day.isSame(startDate, 'day')) {
            continue;
          }
        }

        // 3) Sprawdzamy timeRanges (np. 8:00–12:30 i 16:00–21:30)
        for (const tr of av.timeRanges) {
          const from = moment(tr.from, 'HH:mm');
          const to = moment(tr.to, 'HH:mm');
          const slotHour = slot.hour();
          const slotMin = slot.minute();

          // Tworzymy obiekt momentu w tym samym dniu:
          const slotMoment = day.clone().hour(slotHour).minute(slotMin);

          if (slotMoment.isBetween(
            day.clone().hour(from.hour()).minute(from.minute()),
            day.clone().hour(to.hour()).minute(to.minute()),
            null,
            '[)' // inclusive start, exclusive end
          )) {
            // Jeśli trafiliśmy, że slot mieści się w tym timeRange,
            // to znaczy, że jest dostępny.
            return true;
          }
        }
      }
    }

    // Żadna dostępność nie objęła tego slotu
    return false;
  }

  private cancelAppointmentsForAbsence(absenceDate: string): void {
    const dayData = this.appointmentsData.find(d =>
      moment(d.date).isSame(absenceDate, 'day')
    );
    if (dayData) {
      // Zmieniamy status na CANCELLED
      dayData.appointments.forEach(appt => {
        if (appt.status === 'CONFIRMED') {
          appt.status = 'CANCELLED';
        }
      });
    }
  }

  isDayAbsence(date: moment.Moment): boolean {
    // Jeżeli w this.absences jest obiekt z date == date
    return this.absences.some(a => moment(a.date).isSame(date, 'day'));
  }

}

export interface Availability {
  id: number;
  type: 'CYCLIC' | 'ONE_TIME';
  // dotyczy obu rodzajów
  startDate: string; // 'YYYY-MM-DD' - data startowa
  endDate?: string;  // 'YYYY-MM-DD' - data końcowa (dla cyklicznej)
  // maska dni tygodnia (np. [1,2,4,6] => pn=1, wt=2, sr=3, czw=4, pt=5, sob=6, nd=0)
  daysOfWeek?: number[];
  // pory konsultacji w ciągu dnia (np. [ { from: '08:00', to: '12:30' }, { from: '16:00', to: '21:30' } ])
  timeRanges: { from: string; to: string }[];
}

export interface Absence {
  id: number;
  date: string; // np. '2025-01-15', całodniowa nieobecność
  reason?: string; // opis, np. "wakacje", "szkolenie" itp.
}
