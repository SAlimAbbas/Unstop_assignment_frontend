import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface SeatReservationResponse {
  message: string;
  reservedSeats: any[];
}
interface Seat {
  number: number;
  booked: boolean;
}

@Component({
  selector: 'app-seat-reservation',
  templateUrl: './seat-reservation.component.html',
  styleUrls: ['./seat-reservation.component.css'],
})
export class SeatReservationComponent implements OnInit {
  numSeats: number;
  reservedSeats: any[];
  seats: any[] = [];

  constructor(private http: HttpClient, router: Router) {
    this.numSeats = 0;

    this.reservedSeats = [];
  }

  ngOnInit() {
    this.fetchAllSeats();
  }

  reloadPage() {
    window.location.reload();
  }

  fetchAllSeats() {
    this.http
      .get<any[]>('https://unstop-backend-final.vercel.app/all-seats')
      .subscribe({
        next: (response) => {
          this.seats = this.arrangeSeatsInRows(response);
        },
        error: (error) => {
          console.error('Error reserving seats:', error);
        },
      });
  }
  isSeatBooked(seat: Seat): boolean {
    return seat.booked;
  }

  isLastRow(index: number): boolean {
    const lastRowIndex = Math.floor(this.seats.length / 7) * 7;
    return index >= lastRowIndex;
  }

  arrangeSeatsInRows(seats: Seat[]): Seat[][] {
    const rows: Seat[][] = [];
    const numRows = Math.ceil(seats.length / 7);

    for (let i = 0; i < numRows - 1; i++) {
      const rowSeats = seats.splice(0, 7);
      rows.push(rowSeats);
    }

    const lastRowSeats = seats.splice(0, 3);
    rows.push(lastRowSeats);

    return rows;
  }

  reserveSeats() {
    if (this.numSeats > 7) {
      alert('Cannot reserve more than 7 seats at a time');
      return;
    } else if (this.numSeats <= 0) {
      alert('At least reserve one seat');
      return;
    }
    const payload = { numSeats: this.numSeats };
    return this.http
      .post<SeatReservationResponse>(
        'https://unstop-backend-final.vercel.app/seats',
        payload
      )
      .subscribe({
        next: (response) => {
          this.reservedSeats = response.reservedSeats;
          setTimeout(() => {
            this.reloadPage();
          }, 1000);
        },
        error: (error) => {
          console.error('Error reserving seats:', error);
          if (error.error && error.error.message) {
            // Display the error message from the server
            alert(error.error.message);
          } else {
            alert('An error occurred while reserving seats.');
          }
        },
      });
  }

  clearSeats() {
    this.http
      .delete('https://unstop-backend-final.vercel.app/deleteseats')
      .subscribe({
        next: (response) => {
          console.log('Seats cleared successfully');
          setTimeout(() => {
            this.reloadPage();
          }, 1000);
        },
        error: (error) => {
          console.error('Error clearing seats:', error);
        },
      });
  }
}
