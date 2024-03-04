import React, { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';

interface BookingFormProps {
  onSubmit: (formData: FormData) => void;
  bookingId?: number;
  userId: number;
}

interface FormData {
  hotelId: number;
  noOfRooms: number;
  checkInDate: string;
  checkOutDate: string;
}

const convertCamelToSnake = (data: object) => {
  return _.mapKeys(data, (value, key) => _.snakeCase(key));
};

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, bookingId, userId }) => {
  const [formData, setFormData] = useState<FormData>({
    hotelId: 0,
    noOfRooms: 1,
    checkInDate: '',
    checkOutDate: '',
  });

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/hotels');
        setHotels(response.data.data.hotels);
      } catch (error) {
        setError('Error fetching hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();

    if (bookingId) {
      const fetchBookingDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/v1/users/${userId}/bookings/${bookingId}`);
          const bookingDetails = response.data.data.booking;

          setFormData({
            hotelId: bookingDetails.hotel_id,
            noOfRooms: bookingDetails.no_of_rooms,
            checkInDate: bookingDetails.check_in_date,
            checkOutDate: bookingDetails.check_out_date,
          });
        } catch (error) {
          setError('Error fetching booking details');
        }
      };

      fetchBookingDetails();
    }
  }, [bookingId, userId]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      const formDataSnakeCase = convertCamelToSnake(formData);

      if (bookingId) {
        // Update existing booking
        const response = await axios.put(`http://localhost:3000/api/v1/users/${userId}/bookings/${bookingId}`, formDataSnakeCase);
        console.log('API Response after update:', response.data);
      } else {
        // Create new booking
        const response = await axios.post(`http://localhost:3000/api/v1/users/${userId}/bookings`, formDataSnakeCase);
        console.log('API Response after create:', response.data);
      }

      onSubmit(formDataSnakeCase);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Error submitting form');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Select Hotel:
        <select
          name="hotelId"
          value={formData.hotelId}
          onChange={handleInputChange}
          required
        >
          <option value={0} disabled>Select a hotel</option>
          {hotels.map((hotel) => (
            <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
          ))}
        </select>
      </label>

      <label>
        Number of Rooms:
        <input
          type="number"
          name="noOfRooms"
          value={formData.noOfRooms}
          onChange={handleInputChange}
          min="1"
          required
        />
      </label>

      <label>
        Check-in Date:
        <input
          type="date"
          name="checkInDate"
          value={formData.checkInDate}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Check-out Date:
        <input
          type="date"
          name="checkOutDate"
          value={formData.checkOutDate}
          onChange={handleInputChange}
          required
        />
      </label>

      <button type="submit">{bookingId ? 'Update Booking' : 'Book Room'}</button>
    </form>
  );
};

export default BookingForm;
