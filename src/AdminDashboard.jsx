import { useEffect, useMemo, useRef, useState } from "react";
import API_BASE_URL from "./api";
import axios from "axios";
import {
  CalendarDays,
  Clock,
  Phone,
  MapPin,
  RefreshCw,
  LogOut,
  CheckCircle2,
  XCircle,
  Search,
  Users,
  CalendarCheck,
  Hourglass,
  Ban,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API = `${API_BASE_URL}/bookings/`;

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTodayString = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getBookingDate = (date) => {
  if (!date) return null;

  return String(date).slice(0, 10);
};
export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notification, setNotification] = useState("");
  const previousBookingSnapshots = useRef({});
  const navigate = useNavigate();

const loadBookings = async () => {
  setLoading(true);
  setError("");

  try {
    const response = await axios.get(`${API}admin/`, {
      withCredentials: true,
    });

    const data = response.data;

    // Convert API response into a bookings array
    const newBookings = Array.isArray(data)
      ? data
      : Array.isArray(data.results)
        ? data.results
        : [];

    // Get previous booking snapshots
    const previousSnapshots =
      previousBookingSnapshots.current;

    // -----------------------------------------
    // CHECK FOR NEW OR UPDATED BOOKINGS
    // -----------------------------------------

    if (Object.keys(previousSnapshots).length > 0) {

      // Check for a completely new booking
      const newBooking = newBookings.find(
        (booking) =>
          !previousSnapshots[booking.id]
      );

      if (newBooking) {

        setNotification(
          `🔔 New booking received from ${
            newBooking.name || "customer"
          }`
        );

        setTimeout(() => {
          setNotification("");
        }, 5000);

      } else {

        // Check whether an existing booking changed
        const changedBooking = newBookings.find(
          (booking) => {

            const previous =
              previousSnapshots[booking.id];

            if (!previous) {
              return false;
            }

            return (
              previous.status !== booking.status ||
              previous.date !== booking.date ||
              previous.time !== booking.time
            );
          }
        );

        if (changedBooking) {

          let notificationText =
            `🔔 Booking #${changedBooking.id} updated`;

          const previous =
            previousSnapshots[
              changedBooking.id
            ];

          // -----------------------------------------
          // CUSTOMER CANCELLED BOOKING
          // -----------------------------------------

          if (
            changedBooking.status ===
            "Cancelled"
          ) {

            notificationText =
              `❌ Booking #${changedBooking.id} was cancelled`;

          }

          // -----------------------------------------
          // CUSTOMER RESCHEDULED BOOKING
          // -----------------------------------------

          else if (
            previous &&
            (
              previous.date !==
                changedBooking.date ||
              previous.time !==
                changedBooking.time
            )
          ) {

            notificationText =
              `🔄 Booking #${changedBooking.id} was rescheduled`;

          }

          // -----------------------------------------
          // OTHER STATUS CHANGE
          // -----------------------------------------

          else if (
            previous &&
            previous.status !==
              changedBooking.status
          ) {

            notificationText =
              `🔔 Booking #${changedBooking.id} status changed to ${changedBooking.status}`;

          }

          setNotification(
            notificationText
          );

          setTimeout(() => {
            setNotification("");
          }, 5000);
        }
      }
    }

    // -----------------------------------------
    // SAVE CURRENT BOOKING SNAPSHOTS
    // -----------------------------------------

    const snapshots = {};

    newBookings.forEach((booking) => {

      snapshots[booking.id] = {
        status: booking.status,
        date: booking.date,
        time: booking.time,
      };

    });

    previousBookingSnapshots.current =
      snapshots;

    // -----------------------------------------
    // UPDATE BOOKINGS
    // -----------------------------------------

    setBookings(newBookings);

  } catch (err) {

    console.error(
      "Load bookings error:",
      err
    );

    if (
      err.response?.status === 401 ||
      err.response?.status === 403
    ) {

      setError(
        "Your admin session has expired. Please sign in again."
      );

    } else {

      setError(
        "Unable to load bookings. Please try again."
      );
    }

  } finally {

    setLoading(false);

  }
};

useEffect(() => {
  loadBookings();

  const interval = setInterval(() => {
    loadBookings();
  }, 30000);

  return () => {
    clearInterval(interval);
  };
}, []);
  
  const counts = useMemo(
    () => ({
      All: bookings.length,

      Pending: bookings.filter(
        (booking) => booking.status === "Pending"
      ).length,

      Confirmed: bookings.filter(
        (booking) => booking.status === "Confirmed"
      ).length,

      Cancelled: bookings.filter(
        (booking) => booking.status === "Cancelled"
      ).length,
    }),
    [bookings]
  );

  const filteredBookings = bookings.filter((booking) => {

    const matchesStatus =
      filter === "All" ||
      booking.status === filter;

    const term = search.trim().toLowerCase();

    const matchesSearch = [
      booking.name,
      booking.phone,
      booking.service,
      booking.address,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(term)
    );

    return matchesStatus && matchesSearch;
  });
  const todayString = getTodayString()

const todaysBookings = bookings
  .filter((booking) => {
    return getBookingDate(booking.date) === todayString
  })
  .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")))

const upcomingBookings = bookings
  .filter((booking) => {
    const bookingDate = getBookingDate(booking.date)

    return bookingDate && bookingDate > todayString
  })
  .sort((a, b) => {
    const dateCompare = String(a.date).localeCompare(String(b.date))

    if (dateCompare !== 0) {
      return dateCompare
    }

    return String(a.time || "").localeCompare(String(b.time || ""))
  })
  .slice(0, 5)

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");

    try {
      // Get a fresh CSRF token from Django
      const csrfResponse = await axios.get(
        `${API}admin/login/`,
        {
          withCredentials: true,
        }
      );

      const csrfToken =
        csrfResponse.data.csrf_token;

      if (!csrfToken) {
        throw new Error(
          "CSRF token not received from server."
        );
      }

      // Update booking status
      await axios.patch(
        `${API}admin/${id}/status/`,
        { status },
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );

      // Update dashboard immediately
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id
            ? { ...booking, status }
            : booking
        )
      );

      setSelectedBooking((current) =>
        current?.id === id
          ? { ...current, status }
          : current
      );
    } catch (err) {
      console.error(
        "Update booking status error:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          "Unable to update booking status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      // Get a fresh CSRF token
      const csrfResponse = await axios.get(
        `${API}admin/login/`,
        {
          withCredentials: true,
        }
      );

      const csrfToken =
        csrfResponse.data.csrf_token;

      await axios.post(
        `${API}admin/logout/`,
        {},
        {
          withCredentials: true,
          headers: csrfToken
            ? {
                "X-CSRFToken": csrfToken,
                "Content-Type": "application/json",
              }
            : {},
        }
      );

      setSelectedBooking(null);

      navigate("/admin-login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setError(
        "Unable to log out. Please try again."
      );
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-container">

        {/* Header */}
        <header className="admin-header">
          <div className="admin-heading">
            <span className="admin-eyebrow">
              MOON BEAUTY / ADMIN
            </span>

            <h1>Booking Dashboard</h1>

            <p>
              Manage appointments and keep track
              of your bookings.
            </p>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-outline-btn"
              onClick={loadBookings}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "spin" : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              className="admin-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={17} />

              Logout
            </button>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div
            className="admin-error"
            role="alert"
          >
            <span>{error}</span>

            {(
              error.includes("session") ||
              error.includes("sign in")
            ) && (
              <button
                type="button"
                onClick={() =>
                  navigate("/admin-login")
                }
              >
                Sign in
              </button>
            )}
          </div>
        )}
        {notification && (
  <div className="admin-notification" role="alert">
    <span>{notification}</span>

    <button
      type="button"
      onClick={() => setNotification("")}
      aria-label="Close notification"
    >
      <X size={18} />
    </button>
  </div>
)}
        {/* Statistics */}
        <section
          className="admin-stats"
          aria-label="Booking statistics"
        >
          <div className="admin-stat-card">
            <div className="admin-stat-icon stat-total">
              <Users size={21} />
            </div>

            <div>
              <p>Total Bookings</p>
              <h2>{counts.All}</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon stat-pending">
              <Hourglass size={21} />
            </div>

            <div>
              <p>Pending</p>
              <h2>{counts.Pending}</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon stat-confirmed">
              <CalendarCheck size={21} />
            </div>

            <div>
              <p>Confirmed</p>
              <h2>{counts.Confirmed}</h2>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon stat-cancelled">
              <Ban size={21} />
            </div>

            <div>
              <p>Cancelled</p>
              <h2>{counts.Cancelled}</h2>
            </div>
          </div>
        </section>
        <section className="admin-appointments-overview">

  <div className="admin-overview-header">
    <div>
      <span className="admin-eyebrow">
        TODAY
      </span>

      <h2>Today's Appointments</h2>

      <p>
        {todaysBookings.length} appointment
        {todaysBookings.length !== 1 ? "s" : ""} scheduled for today.
      </p>
    </div>

    <CalendarCheck size={22} />
  </div>

  {todaysBookings.length === 0 ? (
    <div className="admin-overview-empty">
      <CalendarDays size={28} />

      <div>
        <strong>No appointments today</strong>
        <span>Your schedule is clear for today.</span>
      </div>
    </div>
  ) : (
    <div className="admin-appointment-list">
      {todaysBookings.map((booking) => (
        <button
          type="button"
          className="admin-appointment-item"
          key={booking.id}
          onClick={() => setSelectedBooking(booking)}
        >
          <div className="admin-appointment-time">
            <Clock size={16} />
            <strong>{booking.time || "—"}</strong>
          </div>

          <div className="admin-appointment-customer">
            <div className="admin-avatar small">
              {(booking.name || "C")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {booking.name || "Customer"}
              </strong>

              <span>
                {booking.service || "—"}
              </span>
            </div>
          </div>

          <span
            className={`admin-status ${String(
              booking.status || "Pending"
            ).toLowerCase()}`}
          >
            {booking.status || "Pending"}
          </span>
        </button>
      ))}
    </div>
  )}
</section>
<section className="admin-appointments-overview">

  <div className="admin-overview-header">
    <div>
      <span className="admin-eyebrow">
        UPCOMING
      </span>

      <h2>Upcoming Appointments</h2>

      <p>
        Next scheduled customer appointments.
      </p>
    </div>

    <CalendarDays size={22} />
  </div>

  {upcomingBookings.length === 0 ? (
    <div className="admin-overview-empty">
      <CalendarDays size={28} />

      <div>
        <strong>No upcoming appointments</strong>
        <span>New bookings will appear here.</span>
      </div>
    </div>
  ) : (
    <div className="admin-appointment-list">
      {upcomingBookings.map((booking) => (
        <button
          type="button"
          className="admin-appointment-item"
          key={booking.id}
          onClick={() => setSelectedBooking(booking)}
        >
          <div className="admin-appointment-date">
            <CalendarDays size={16} />

            <strong>
              {formatDate(booking.date)}
            </strong>
          </div>

          <div className="admin-appointment-customer">
            <div className="admin-avatar small">
              {(booking.name || "C")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {booking.name || "Customer"}
              </strong>

              <span>
                {booking.service || "—"} · {booking.time || "—"}
              </span>
            </div>
          </div>

          <span
            className={`admin-status ${String(
              booking.status || "Pending"
            ).toLowerCase()}`}
          >
            {booking.status || "Pending"}
          </span>
        </button>
      ))}
    </div>
  )}
</section>
        {/* Bookings */}
        <section className="admin-bookings-card">
          <div className="admin-table-heading">
            <div>
              <h2>All Bookings</h2>

              <p>
                View and manage your customer
                appointments.
              </p>
            </div>

            <label className="admin-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search bookings..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                aria-label="Search bookings"
              />
            </label>
          </div>

          {/* Filters */}
          <div
            className="admin-filters"
            role="group"
            aria-label="Filter bookings"
          >
            {[
              "All",
              "Pending",
              "Confirmed",
              "Cancelled",
            ].map((item) => (
              <button
                type="button"
                key={item}
                className={`admin-filter ${
                  filter === item ? "active" : ""
                }`}
                onClick={() =>
                  setFilter(item)
                }
              >
                {item}

                <span>
                  {counts[item]}
                </span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="admin-message">
              Loading bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="admin-empty">
              <CalendarDays size={34} />

              <h3>No bookings found</h3>

              <p>
                Try changing your search or
                status filter.
              </p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date &amp; Time</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map(
                    (booking) => (
                      <tr
                        key={booking.id}
                        className="admin-booking-row"
                        onClick={() =>
                          setSelectedBooking(
                            booking
                          )
                        }
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();

                            setSelectedBooking(
                              booking
                            );
                          }
                        }}
                        aria-label={`View booking for ${
                          booking.name ||
                          "customer"
                        }`}
                      >
                        {/* Customer */}
                        <td>
                          <div className="admin-customer">
                            <div className="admin-avatar">
                              {(
                                booking.name ||
                                "C"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="admin-customer-info">
                              <strong>
                                {booking.name ||
                                  "Customer"}
                              </strong>

                              <span className="admin-detail">
                                <Phone size={13} />

                                {booking.phone ||
                                  "—"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Service */}
                        <td>
                          <span className="admin-service">
                            {booking.service ||
                              "—"}
                          </span>
                        </td>

                        {/* Date and Time */}
                        <td>
                          <div className="admin-date-time">
                            <span className="admin-detail">
                              <CalendarDays
                                size={15}
                              />

                              {formatDate(
                                booking.date
                              )}
                            </span>

                            <span className="admin-detail">
                              <Clock size={15} />

                              {booking.time ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        {/* Address */}
                        <td>
                          <span className="admin-address">
                            <MapPin size={15} />

                            {booking.address ||
                              "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`admin-status ${String(
                              booking.status ||
                                "Pending"
                            ).toLowerCase()}`}
                          >
                            {booking.status ||
                              "Pending"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          {booking.status ===
                          "Pending" ? (
                            <div
                              className="admin-row-actions"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              {/* Confirm */}
                              <button
                                type="button"
                                className="admin-action confirm"
                                title="Confirm booking"
                                aria-label="Confirm booking"
                                disabled={
                                  updatingId ===
                                  booking.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    booking.id,
                                    "Confirmed"
                                  )
                                }
                              >
                                <CheckCircle2
                                  size={18}
                                />
                              </button>

                              {/* Cancel */}
                              <button
                                type="button"
                                className="admin-action cancel"
                                title="Cancel booking"
                                aria-label="Cancel booking"
                                disabled={
                                  updatingId ===
                                  booking.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    booking.id,
                                    "Cancelled"
                                  )
                                }
                              >
                                <XCircle
                                  size={18}
                                />
                              </button>
                            </div>
                          ) : (
                            <span className="admin-no-action">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="admin-footer">
          <span>Moon Beauty Admin</span>

          <span>
            Beauty at your doorstep
          </span>
        </footer>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="booking-modal-overlay"
          onClick={() =>
            setSelectedBooking(null)
          }
        >
          <section
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div className="booking-modal-header">
              <div>
                <span className="admin-eyebrow">
                  MOON BEAUTY
                </span>

                <h2 id="booking-modal-title">
                  Booking Details
                </h2>

                <p>
                  Booking #
                  {selectedBooking.id}
                </p>
              </div>

              <button
                type="button"
                className="booking-modal-close"
                onClick={() =>
                  setSelectedBooking(null)
                }
                aria-label="Close booking details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="booking-modal-body">
              <div className="booking-modal-customer">
                <div className="admin-avatar">
                  {(
                    selectedBooking.name ||
                    "C"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {selectedBooking.name ||
                      "Customer"}
                  </h3>

                  <span>
                    {selectedBooking.phone ||
                      "—"}
                  </span>
                </div>
              </div>

              <div className="booking-detail-grid">
                <div className="booking-detail-item">
                  <span>Service</span>

                  <strong>
                    {selectedBooking.service ||
                      "—"}
                  </strong>
                </div>

                <div className="booking-detail-item">
                  <span>Date</span>

                  <strong>
                    {formatDate(
                      selectedBooking.date
                    )}
                  </strong>
                </div>

                <div className="booking-detail-item">
                  <span>Time</span>

                  <strong>
                    {selectedBooking.time ||
                      "—"}
                  </strong>
                </div>

                <div className="booking-detail-item">
                  <span>Status</span>

                  <span
                    className={`admin-status ${String(
                      selectedBooking.status ||
                        "Pending"
                    ).toLowerCase()}`}
                  >
                    {selectedBooking.status ||
                      "Pending"}
                  </span>
                </div>

                <div className="booking-detail-item booking-detail-address">
                  <span>
                    Customer Address
                  </span>

                  <strong>
                    {selectedBooking.address ||
                      "—"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="booking-modal-footer">
              <button
                type="button"
                className="admin-outline-btn"
                onClick={() =>
                  setSelectedBooking(null)
                }
              >
                Close
              </button>

              {selectedBooking.status ===
                "Pending" && (
                <>
                  {/* Cancel */}
                  <button
                    type="button"
                    className="admin-action cancel modal-action"
                    disabled={
                      updatingId ===
                      selectedBooking.id
                    }
                    onClick={() =>
                      updateStatus(
                        selectedBooking.id,
                        "Cancelled"
                      )
                    }
                  >
                    <XCircle size={17} />

                    Cancel
                  </button>

                  {/* Confirm */}
                  <button
                    type="button"
                    className="admin-action confirm modal-action"
                    disabled={
                      updatingId ===
                      selectedBooking.id
                    }
                    onClick={() =>
                      updateStatus(
                        selectedBooking.id,
                        "Confirmed"
                      )
                    }
                  >
                    <CheckCircle2 size={17} />

                    Confirm
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}