// src/app/calendar/calendar-view/calendar-view.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import moment from 'moment';

import { CalendarService, DayAppointments, Appointment } from '../calendar.service';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {
  // Tydzień, który aktualnie wyświetlamy
  currentWeekStart: moment.Moment = moment().startOf('isoWeek'); // start tygodnia (poniedziałek)
  displayedDays: moment.Moment[] = [];

  // Dane z JSON
  appointmentsData: DayAppointments[] = [];

  // Zakres godzin wyświetlanych w tabeli (domyślnie 6h, np. 8:00-14:00)
  displayStartHour = 8;
  displayEndHour = 14;

  readonly MIN_HOUR = 0;
  readonly MAX_HOUR = 24;
  readonly DISPLAY_RANGE = 6;

  // Tablica slotów co 30 minut (0.5h)
  timeSlots: moment.Moment[] = [];

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.initDisplayedWeek();
    this.initTimeSlots();
  }

  // 1) Pobranie danych z pliku JSON
  loadAppointments(): void {
    this.calendarService.getAppointments().subscribe((data) => {
      this.appointmentsData = data;
      this.calendarService.appointmentsData = data;
    });
  }

  // 2) Inicjalizacja tablicy 7 dni (poniedziałek..niedziela)
  initDisplayedWeek(): void {
    this.displayedDays = [];
    for (let i = 0; i < 7; i++) {
      const day = moment(this.currentWeekStart).add(i, 'days');
      this.displayedDays.push(day);
    }
  }

  // 3) Inicjalizacja slotów czasowych co 30 minut w zadanym zakresie (8:00 - 14:00)
  initTimeSlots(): void {
    this.timeSlots = [];
    const start = moment().startOf('day').hour(this.displayStartHour).minute(0);
    const end = moment().startOf('day').hour(this.displayEndHour).minute(0);

    while (start.isBefore(end)) {
      this.timeSlots.push(start.clone());
      start.add(30, 'minutes');
    }
  }

  scrollUp(): void {
    if (this.displayStartHour > this.MIN_HOUR) {
      this.displayStartHour--;
      this.displayEndHour--;
      this.initTimeSlots();
    }
  }

  scrollDown(): void {
    if (this.displayEndHour < this.MAX_HOUR) {
      this.displayStartHour++;
      this.displayEndHour++;
      this.initTimeSlots();
    }
  }

  // Nawigacja: poprzedni / następny tydzień
  prevWeek(): void {
    this.currentWeekStart.subtract(1, 'week');
    this.initDisplayedWeek();
  }
  nextWeek(): void {
    this.currentWeekStart.add(1, 'week');
    this.initDisplayedWeek();
  }

  // Pobieramy wizyty dla danego dnia i slotu
  getAppointmentsForSlot(day: moment.Moment, slot: moment.Moment): Appointment[] {
    // 1) Znajdź w appointmentsData obiekt DayAppointments o dacie = day
    const dayData = this.appointmentsData.find(d =>
      moment(d.date).isSame(day, 'day')
    );
    if (!dayData) {
      return [];
    }

    // 2) Filtrujemy te wizyty, które "zawierają" w sobie moment slotu
    return dayData.appointments.filter(appt => {
      const start = moment(appt.startTime);
      const end = moment(appt.endTime);
      return slot.isBetween(start, end, null, '[)');
      // "[)" – inclusive start, exclusive end
    });
  }

  // Czy dzień jest dzisiejszy (do wyróżnienia kolumny)
  isToday(day: moment.Moment): boolean {
    return day.isSame(moment(), 'day');
  }

  // Czy slot jest "aktualnym slotem czasowym" (symulacja)
  isCurrentTimeSlot(slot: moment.Moment, day: moment.Moment): boolean {
    const now = moment();
    if (!this.isToday(day)) {
      return false;
    }
    // Porównujemy godzinę/minutę
    return now.hour() === slot.hour() && now.minute() >= slot.minute() && now.minute() < slot.minute() + 30;
  }

  // Czy wizyta jest już przeszła (albo ma status 'DONE', 'PAST')
  isPastAppointment(appt: Appointment): boolean {
    if (appt.status === 'PAST' || appt.status === 'DONE') {
      return true;
    }
    // Ewentualnie sprawdzamy, czy endTime jest przed aktualnym momentem
    return moment(appt.endTime).isBefore(moment());
  }

  // Pomocnicze formatowanie godziny
  formatHour(slot: moment.Moment): string {
    return slot.format('HH:mm');
  }

  getAppointmentsCountForDay(day: moment.Moment): number {
    const dayData = this.appointmentsData.find((d) =>
      moment(d.date).isSame(day, 'day')
    );
    return dayData?.appointments.length || 0;
  }

  goToCurrentWeek(): void {
    this.currentWeekStart = moment().startOf('week');
    this.initDisplayedWeek();
  }

  isDayInAbsence(day: moment.Moment): boolean {
    return this.calendarService.isDayInAbsence(day);
  }

  isSlotAvailable(day: moment.Moment, slot: moment.Moment): boolean {
    return this.calendarService.isSlotInAvailability(day, slot);
  }

}
