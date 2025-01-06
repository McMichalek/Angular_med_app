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
  status: 'CONFIRMED' | 'CANCELLED' | 'DONE' | 'PAST' | 'IN_CART';
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
    abs.id = this.absences.length > 0
      ? Math.max(...this.absences.map(a => a.id)) + 1
      : 1;
    this.absences.push(abs);

    // Anulujemy konsultacje w tym przedziale
    this.cancelAppointmentsInRange(abs.startDate, abs.endDate);
  }

  getAbsences(): Absence[] {
    return this.absences;
  }

  public getAppointments(): Observable<DayAppointments[]> {
    // Uwaga: plik JSON w folderze "src/assets/appointments.json"
    return this.http.get<DayAppointments[]>('src/assets/appointments.json');
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
    let available = false;

    for (const av of this.availabilities) {
      const startDate = moment(av.startDate, 'YYYY-MM-DD');
      const endDate = moment(av.endDate ?? av.startDate, 'YYYY-MM-DD'); // jeśli endDate brak, to single day
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
    return available;
  }

  private cancelAppointmentsInRange(startDateStr: string, endDateStr: string): void {
    const start = moment(startDateStr, 'YYYY-MM-DD');
    const end = moment(endDateStr, 'YYYY-MM-DD');

    // Wyszukujemy wszystkie DayAppointments, których data mieści się w [start, end]
    for (const dayData of this.appointmentsData) {
      const day = moment(dayData.date, 'YYYY-MM-DD');
      if (day.isBetween(start, end, 'day', '[]')) {
        // Zmieniamy status wszelkich CONFIRMED na CANCELLED
        dayData.appointments.forEach(appt => {
          if (appt.status === 'CONFIRMED') {
            appt.status = 'CANCELLED';
          }
        });
      }
    }
  }

  public isDayInAbsence(day: moment.Moment): boolean {
    // Jeżeli day zawiera się w jakimkolwiek Absence: [startDate, endDate]
    return this.absences.some(abs => {
      const start = moment(abs.startDate, 'YYYY-MM-DD');
      const end = moment(abs.endDate, 'YYYY-MM-DD');
      return day.isBetween(start, end, 'day', '[]');
    });
  }

  checkConflict(day: moment.Moment, start: moment.Moment, end: moment.Moment): boolean {
    // 1) Sprawdzamy, czy day jest w absencji
    if (this.isDayInAbsence(day)) {
      return true; // bo wtedy dzień jest zablokowany
    }

    // 2) Czy slot leży w dostępności w ogóle
    // (jeśli w Zadaniu 2 zrobiliśmy isSlotInAvailability, to musimy sprawdzić
    //  wszystkie sloty 30-minutowe w przedziale [start,end).
    //  Na uproszczenie tu: sprawdźmy start co 30 min)
    // ...
    // Jeżeli stwierdzimy, że cokolwiek nie pasuje, zwracamy true (konflikt).

    // 3) Sprawdzamy dotychczasowe rezerwacje
    // Znajdź w appointmentsData dzień = day
    const dayData = this.appointmentsData.find(d =>
      moment(d.date).isSame(day, 'day')
    );
    if (!dayData) {
      return false; // brak rezerwacji w tym dniu
    }
    // Sprawdź, czy któryś appointment koliduje
    for (const appt of dayData.appointments) {
      const apptStart = moment(appt.startTime);
      const apptEnd = moment(appt.endTime);

      // Warunek kolizji = [start, end) nakłada się na [apptStart, apptEnd)
      // Najprostsza check:
      const overlap = start.isBefore(apptEnd) && end.isAfter(apptStart);
      if (overlap && appt.status !== 'CANCELLED') {
        return true;
      }
    }

    return false; // brak konfliktu
  }

  addAppointment(day: moment.Moment, newAppt: Appointment): void {
    // 1) Generuj ID
    // np. w prosty sposób:
    newAppt.id = this.generateNewId();

    // 2) Znajdź (albo stwórz) dayData
    let dayData = this.appointmentsData.find(d =>
      moment(d.date).isSame(day, 'day')
    );
    if (!dayData) {
      dayData = { date: day.format('YYYY-MM-DD'), appointments: [] };
      this.appointmentsData.push(dayData);
    }

    // 3) Dodaj appointment
    dayData.appointments.push(newAppt);
  }

  private generateNewId(): number {
    let maxId = 0;
    for (const d of this.appointmentsData) {
      for (const a of d.appointments) {
        if (a.id > maxId) {
          maxId = a.id;
        }
      }
    }
    return maxId + 1;
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
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason?: string;
}
