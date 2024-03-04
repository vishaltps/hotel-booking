import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookingForm from './components/BookingForm';

interface Booking {
  id: number;
  hotel: {
    name: string;
    location: string;
  };
  check_in_date: string;
  check_out_date: string;
  no_of_rooms: number;
  status: string;
}

interface AppProps {
  userId: number;
}

const App: React.FC<AppProps> = ({ userId }) => {
  const [isBookingFormVisible, setBookingFormVisibility] = useState<boolean>(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNewBookingClick = (): void => {
    setBookingFormVisibility(true);
    setSelectedBooking(null); // Reset selectedBooking when creating a new booking
  };

  const handleEditBookingClick = (booking: Booking): void => {
    setBookingFormVisibility(true);
    setSelectedBooking(booking);
  };

  const handleRemoveBooking = async (bookingId: number): Promise<void> => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/v1/users/${userId}/bookings/${bookingId}`);
      console.log('Booking removed. API Response:', response.data);

      // Update the state to reflect the removal
      setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      console.error('Error removing booking:', error);
      // Handle error, show message to the user, etc.
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/users/${userId}/bookings`);
        setBookings(response.data.data.bookings);
      } catch (error) {
        setError('Error fetching bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>User Bookings</h1>
      <button onClick={handleNewBookingClick}>New Booking</button>

      {isBookingFormVisible && (
        <BookingForm
          onSubmit={() => { }}
          bookingId={selectedBooking?.id}
          userId={userId}
        />
      )}

      <ul>
        {bookings.map((booking) => (
          <BookingItem
            key={booking.id}
            booking={booking}
            onEdit={() => handleEditBookingClick(booking)}
            onRemove={() => handleRemoveBooking(booking.id)}
          />
        ))}
      </ul>
    </div>
  );
};

interface BookingItemProps {
  booking: Booking;
  onEdit: () => void;
  onRemove: () => void;
}

const BookingItem: React.FC<BookingItemProps> = ({ booking, onEdit, onRemove }) => (
  <li>
    No Of Rooms: {booking.no_of_rooms}, Check-in: {booking.check_in_date}, Check-out: {booking.check_out_date}, status: {booking.status}
    <button onClick={onEdit}>Edit</button>
    <button onClick={onRemove}>Remove</button>
  </li>
);

export default App;
