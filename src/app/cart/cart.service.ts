import { Injectable } from '@angular/core';
import {Appointment} from '../calendar/calendar.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private items: Appointment[] = [];

  constructor() {}

  // Dodaje konsultację do koszyka
  addToCart(appointment: Appointment): void {
    this.items.push(appointment);
  }

  // Usuwa wybraną rezerwację z koszyka
  removeFromCart(appointmentId: number): void {
    this.items = this.items.filter(ap => ap.id !== appointmentId);
  }

  // Zwraca wszystkie konsultacje w koszyku
  getCartItems(): Appointment[] {
    return this.items;
  }

  // Czyści koszyk (np. po opłaceniu)
  clearCart(): void {
    this.items = [];
  }
}
