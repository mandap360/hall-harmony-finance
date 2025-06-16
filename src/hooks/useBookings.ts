
import { useState, useEffect } from "react";

const STORAGE_KEY = "wedding_hall_bookings";

// Sample data for demonstration
const sampleBookings = [
  {
    id: "1",
    eventName: "Rajesh & Priya Wedding",
    clientName: "Rajesh Kumar",
    phoneNumber: "+91 9876543210",
    startDate: "2024-08-15T18:00",
    endDate: "2024-08-16T02:00",
    totalRent: 50000,
    advance: 20000,
    notes: "Traditional South Indian wedding",
    paidAmount: 15000,
    payments: [
      {
        id: "p1",
        amount: 15000,
        date: "2024-07-15",
        type: "balance",
        description: "Second payment"
      }
    ]
  },
  {
    id: "2",
    eventName: "Corporate Annual Day",
    clientName: "Tech Solutions Pvt Ltd",
    phoneNumber: "+91 9876543211",
    startDate: "2024-09-20T16:00",
    endDate: "2024-09-20T22:00",
    totalRent: 30000,
    advance: 10000,
    notes: "Corporate event with 200 attendees",
    paidAmount: 0,
    payments: []
  }
];

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const storedBookings = localStorage.getItem(STORAGE_KEY);
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    } else {
      // Initialize with sample data
      setBookings(sampleBookings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleBookings));
    }
  }, []);

  const saveBookings = (newBookings) => {
    setBookings(newBookings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookings));
  };

  const addBooking = (booking) => {
    const newBookings = [...bookings, booking];
    saveBookings(newBookings);
  };

  const updateBooking = (updatedBooking) => {
    const newBookings = bookings.map(booking =>
      booking.id === updatedBooking.id ? updatedBooking : booking
    );
    saveBookings(newBookings);
  };

  const deleteBooking = (bookingId) => {
    const newBookings = bookings.filter(booking => booking.id !== bookingId);
    saveBookings(newBookings);
  };

  return {
    bookings,
    addBooking,
    updateBooking,
    deleteBooking
  };
};
