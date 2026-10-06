import API_BASE_URL from "./api";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Search,
  CalendarDays,
  Clock,
  MapPin,
  User,
  Sparkles,
  XCircle,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "./Booking.css";


const API_URL = `${API_BASE_URL}/bookings/`;

const TIME_SLOTS = [
  "10:00 AM",
  "12:00 PM",
  "2:00 PM",
  "4:00 PM",
  "6:00 PM",
];


const getTodayString = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


export default function MyBookings() {

  const navigate = useNavigate();

  const [bookingId, setBookingId] = useState("");
  const [phone, setPhone] = useState("");

  const [booking, setBooking] = useState(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [showCancel, setShowCancel] =
    useState(false);

  const [showReschedule, setShowReschedule] =
    useState(false);

  const [cancelReason, setCancelReason] =
    useState("Changed my plans");

  const [rescheduleDate, setRescheduleDate] =
    useState("");

  const [rescheduleTime, setRescheduleTime] =
    useState("");

  const [rescheduleReason, setRescheduleReason] =
    useState("");

  const [bookedTimes, setBookedTimes] =
    useState([]);

  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);


  const findBooking = async () => {

    if (!bookingId || !phone) {
      return;
    }

    try {

      const response = await axios.get(
        API_URL,
        {
          params: {
            id: bookingId,
            phone: phone,
          },
        }
      );

      const data = response.data;

      const result =
        Array.isArray(data)
          ? data.find(
              (item) =>
                String(item.id) ===
                  String(bookingId) &&
                item.phone === phone
            )

          : Array.isArray(data.results)
          ? data.results.find(
              (item) =>
                String(item.id) ===
                  String(bookingId) &&
                item.phone === phone
            )

          : data.id &&
            String(data.id) ===
              String(bookingId) &&
            data.phone === phone
          ? data
          : null;


      if (result) {
        setBooking(result);
      }

    } catch (error) {

      console.error(
        "Unable to refresh booking:",
        error
      );

    }
  };


  const searchBooking = async (e) => {

    e.preventDefault();

    setLoading(true);
    setMessage("");
    setBooking(null);

    try {

      const response = await axios.get(
        API_URL,
        {
          params: {
            id: bookingId,
            phone,
          },
        }
      );

      const data = response.data;

      const result =
        Array.isArray(data)
          ? data.find(
              (item) =>
                String(item.id) ===
                  String(bookingId) &&
                item.phone === phone
            )

          : Array.isArray(data.results)
          ? data.results.find(
              (item) =>
                String(item.id) ===
                  String(bookingId) &&
                item.phone === phone
            )

          : data.id &&
            String(data.id) ===
              String(bookingId) &&
            data.phone === phone
          ? data
          : null;


      if (!result) {

        setMessage(
          "No booking found. Please check your details."
        );

      } else {

        setBooking(result);

      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to find your booking. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // Automatic status refresh
  useEffect(() => {

    if (!bookingId || !phone || !booking) {
      return;
    }

    const interval = setInterval(
      findBooking,
      30000
    );

    return () => {
      clearInterval(interval);
    };

  }, [
    bookingId,
    phone,
    booking,
  ]);


  // Check availability for reschedule date
  useEffect(() => {

    if (!rescheduleDate) {
      setBookedTimes([]);
      return;
    }

    const fetchAvailability =
      async () => {

        setAvailabilityLoading(true);

        try {

          const response =
            await axios.get(
              `${API_URL}availability/`,
              {
                params: {
                  date: rescheduleDate,
                },
              }
            );

          setBookedTimes(
            response.data.booked_times ||
              []
          );

        } catch (error) {

          console.error(
            "Availability error:",
            error
          );

          setBookedTimes([]);

        } finally {

          setAvailabilityLoading(false);

        }
      };

    fetchAvailability();

  }, [rescheduleDate]);


  const openReschedule = () => {

    setMessage("");

    setRescheduleDate(
      booking?.date || ""
    );

    setRescheduleTime(
      booking?.time || ""
    );

    setRescheduleReason("");

    setShowReschedule(true);
  };


  const rescheduleBooking = async () => {

    if (
      !rescheduleDate ||
      !rescheduleTime
    ) {

      setMessage(
        "Please select a date and time."
      );

      return;
    }


    if (
      bookedTimes.includes(
        rescheduleTime
      ) &&
      !(
        rescheduleDate ===
          booking.date &&
        rescheduleTime ===
          booking.time
      )
    ) {

      setMessage(
        "This time slot is already booked."
      );

      return;
    }


    setActionLoading(true);
    setMessage("");


    try {

      const response =
        await axios.post(
          `${API_URL}customer/reschedule/`,
          {
            id: booking.id,
            phone: phone,
            date: rescheduleDate,
            time: rescheduleTime,
            reason: rescheduleReason,
          }
        );


      setBooking(
        response.data.booking
      );

      setShowReschedule(false);

      setMessage(
        "Your booking was rescheduled successfully. It is now waiting for Moon Beauty confirmation."
      );

    } catch (error) {

      const errorMessage =
        error.response?.data?.error ||
        "Unable to reschedule booking.";

      setMessage(errorMessage);

    } finally {

      setActionLoading(false);

    }
  };


  const cancelBooking = async () => {

    setActionLoading(true);
    setMessage("");


    try {

      const response =
        await axios.post(
          `${API_URL}customer/cancel/`,
          {
            id: booking.id,
            phone: phone,
            reason: cancelReason,
          }
        );


      setBooking(
        response.data.booking
      );

      setShowCancel(false);

      setMessage(
        "Your booking has been cancelled successfully."
      );

    } catch (error) {

      const errorMessage =
        error.response?.data?.error ||
        "Unable to cancel booking.";

      setMessage(errorMessage);

    } finally {

      setActionLoading(false);

    }
  };


  const bookAgain = () => {

    navigate(
      "/booking",
      {
        state: {
          service: booking.service,
        },
      }
    );
  };


  const canManageBooking =
    booking &&
    (
      booking.status === "Pending" ||
      booking.status === "Confirmed"
    );


  return (
    <main className="booking-page">

      <div className="booking-heading">

        <span>MOON BEAUTY</span>

        <h1>
          My <em>Bookings</em>
        </h1>

        <p>
          Manage your appointment easily.
        </p>

      </div>


      <form
        className="booking-form"
        onSubmit={searchBooking}
      >

        <h2>
          Find your appointment
        </h2>


        <label>

          <span>
            Booking ID
          </span>

          <input
            type="number"
            value={bookingId}
            onChange={(e) =>
              setBookingId(
                e.target.value
              )
            }
            placeholder="Enter booking ID"
            required
          />

        </label>


        <label>

          <span>
            Phone number
          </span>

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10)
              )
            }
            placeholder="Enter your 10-digit number"
            pattern="[0-9]{10}"
            required
          />

        </label>


        <button
          className="booking-submit"
          type="submit"
          disabled={loading}
        >

          {loading
            ? "Searching..."
            : "Find Booking"}

          {!loading && (
            <Search size={18} />
          )}

        </button>


        {message && (
          <p
            className="booking-message"
            role="status"
          >
            {message}
          </p>
        )}


        {booking && (

          <div className="booking-result">

            <div className="booking-result-header">

              <div>

                <span className="booking-label">
                  APPOINTMENT DETAILS
                </span>

                <h2>
                  Booking #{booking.id}
                </h2>

              </div>


              <span
                className={`status-badge ${
                  booking.status?.toLowerCase()
                }`}
              >
                {booking.status}
              </span>

            </div>


            <div className="booking-details-grid">

              <div className="booking-detail">

                <User size={19} />

                <div>

                  <span>
                    Name
                  </span>

                  <strong>
                    {booking.name}
                  </strong>

                </div>

              </div>


              <div className="booking-detail">

                <Sparkles size={19} />

                <div>

                  <span>
                    Service
                  </span>

                  <strong>
                    {booking.service}
                  </strong>

                </div>

              </div>


              <div className="booking-detail">

                <CalendarDays size={19} />

                <div>

                  <span>
                    Appointment date
                  </span>

                  <strong>
                    {booking.date}
                  </strong>

                </div>

              </div>


              <div className="booking-detail">

                <Clock size={19} />

                <div>

                  <span>
                    Preferred time
                  </span>

                  <strong>
                    {booking.time}
                  </strong>

                </div>

              </div>


              <div className="booking-detail address-detail">

                <MapPin size={19} />

                <div>

                  <span>
                    Home address
                  </span>

                  <strong>
                    {booking.address}
                  </strong>

                </div>

              </div>

            </div>


            {booking.status ===
              "Pending" && (

              <div className="booking-info-box">

                <AlertCircle size={18} />

                <span>
                  Your booking is waiting for Moon Beauty confirmation.
                </span>

              </div>

            )}


            {booking.status ===
              "Confirmed" && (

              <div className="booking-success-box">

                <CheckCircle2 size={18} />

                <span>
                  Your appointment is confirmed.
                </span>

              </div>

            )}


            {booking.status ===
              "Cancelled" && (

              <div className="booking-cancelled-box">

                <XCircle size={18} />

                <span>
                  This appointment has been cancelled.
                </span>

              </div>

            )}


            {booking.cancellation_reason && (
              <div className="booking-history-box">

                <strong>
                  Cancellation reason
                </strong>

                <span>
                  {booking.cancellation_reason}
                </span>

              </div>
            )}


            {booking.reschedule_reason && (
              <div className="booking-history-box">

                <strong>
                  Reschedule note
                </strong>

                <span>
                  {booking.reschedule_reason}
                </span>

              </div>
            )}


            {canManageBooking && (

              <div className="customer-booking-actions">

                <button
                  type="button"
                  className="customer-action reschedule"
                  onClick={openReschedule}
                >
                  <RefreshCw size={17} />
                  Reschedule
                </button>


                <button
                  type="button"
                  className="customer-action cancel"
                  onClick={() =>
                    setShowCancel(true)
                  }
                >
                  <XCircle size={17} />
                  Cancel Booking
                </button>

              </div>

            )}


            {booking.status ===
              "Cancelled" && (

              <button
                type="button"
                className="customer-rebook-button"
                onClick={bookAgain}
              >
                <RotateCcw size={17} />
                Book This Service Again
              </button>

            )}

          </div>

        )}

      </form>


      {/* CANCEL MODAL */}

      {showCancel && (

        <div
          className="customer-modal-overlay"
          onClick={() =>
            !actionLoading &&
            setShowCancel(false)
          }
        >

          <div
            className="customer-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="customer-modal-header">

              <div>

                <span>
                  MOON BEAUTY
                </span>

                <h2>
                  Cancel booking?
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  !actionLoading &&
                  setShowCancel(false)
                }
              >
                ×
              </button>

            </div>


            <p>
              Are you sure you want to cancel booking #{booking?.id}?
            </p>


            <label>

              <span>
                Why are you cancelling?
              </span>

              <select
                value={cancelReason}
                onChange={(e) =>
                  setCancelReason(
                    e.target.value
                  )
                }
              >

                <option>
                  Changed my plans
                </option>

                <option>
                  Found another service
                </option>

                <option>
                  Booked by mistake
                </option>

                <option>
                  Not available at this time
                </option>

                <option>
                  Other
                </option>

              </select>

            </label>


            <div className="customer-modal-actions">

              <button
                type="button"
                onClick={() =>
                  setShowCancel(false)
                }
                disabled={actionLoading}
              >
                Keep Booking
              </button>


              <button
                type="button"
                className="danger"
                onClick={cancelBooking}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Cancelling..."
                  : "Yes, Cancel"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* RESCHEDULE MODAL */}

      {showReschedule && (

        <div
          className="customer-modal-overlay"
          onClick={() =>
            !actionLoading &&
            setShowReschedule(false)
          }
        >

          <div
            className="customer-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="customer-modal-header">

              <div>

                <span>
                  MOON BEAUTY
                </span>

                <h2>
                  Reschedule appointment
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  !actionLoading &&
                  setShowReschedule(false)
                }
              >
                ×
              </button>

            </div>


            <label>

              <span>
                New appointment date
              </span>

              <input
                type="date"
                value={rescheduleDate}
                min={getTodayString()}
                onChange={(e) => {

                  setRescheduleDate(
                    e.target.value
                  );

                  setRescheduleTime("");

                }}
              />

            </label>


            <label>

              <span>
                New appointment time
              </span>

              <select
                value={rescheduleTime}
                onChange={(e) =>
                  setRescheduleTime(
                    e.target.value
                  )
                }
                disabled={
                  !rescheduleDate ||
                  availabilityLoading
                }
              >

                <option value="">
                  {availabilityLoading
                    ? "Checking availability..."
                    : "Select time"}
                </option>


                {TIME_SLOTS.map(
                  (time) => {

                    const booked =
                      bookedTimes.includes(
                        time
                      );

                    const currentSlot =
                      rescheduleDate ===
                        booking?.date &&
                      time ===
                        booking?.time;

                    return (
                      <option
                        key={time}
                        value={time}
                        disabled={
                          booked &&
                          !currentSlot
                        }
                      >
                        {time}
                        {booked &&
                        !currentSlot
                          ? " (Booked)"
                          : ""}
                      </option>
                    );

                  }
                )}

              </select>

            </label>


            <label>

              <span>
                Reason (optional)
              </span>

              <textarea
                value={rescheduleReason}
                onChange={(e) =>
                  setRescheduleReason(
                    e.target.value
                  )
                }
                placeholder="Tell us why you need to reschedule"
                rows={3}
              />

            </label>


            <div className="customer-modal-actions">

              <button
                type="button"
                onClick={() =>
                  setShowReschedule(false)
                }
                disabled={actionLoading}
              >
                Go Back
              </button>


              <button
                type="button"
                className="primary"
                onClick={rescheduleBooking}
                disabled={
                  actionLoading ||
                  !rescheduleDate ||
                  !rescheduleTime
                }
              >
                {actionLoading
                  ? "Rescheduling..."
                  : "Confirm New Time"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}