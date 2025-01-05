// src/app/calendar/calendar.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  public getAppointments(): Observable<DayAppointments[]> {
    // Uwaga: plik JSON w folderze "src/assets/appointments.json"
    return this.http.get<DayAppointments[]>('assets/appointments.json');
  }
}
