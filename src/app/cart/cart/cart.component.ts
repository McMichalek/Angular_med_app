import { Component, OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import {CartService} from '../cart.service';
import {Appointment} from '../../calendar/calendar.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  cartItems: Appointment[] = [];
  paymentSuccessful = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
  }

  removeItem(appointmentId: number): void {
    this.cartService.removeFromCart(appointmentId);
    this.loadCart();
  }

  simulatePayment(): void {
    // Prosta symulacja
    // W prawdziwej aplikacji moglibyśmy tu wołać bramkę płatniczą
    this.paymentSuccessful = true;

    // Opcjonalnie można ustawić w appointment.status = 'PAID' itd.
    for (const ap of this.cartItems) {
      ap.status = 'CONFIRMED';
    }

    // Czyścimy koszyk
    this.cartService.clearCart();
    this.loadCart();
  }
}
