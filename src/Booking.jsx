
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./api";
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Phone,
  ArrowRight,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import './Booking.css'

const API_URL = `${API_BASE_URL}/bookings/`;

const timeSlots = [
  '10:00 AM',
  '12:00 PM',
  '2:00 PM',
  '4:00 PM',
  '6:00 PM',
]

export default function Booking() {
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: location.state?.service || '',
    date: '',
    time: '',
    address: '',
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [bookedTimes, setBookedTimes] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')

  // Fetch booked time slots whenever the date changes.
  useEffect(() => {
    if (!form.date) {
      setBookedTimes([])
      setAvailabilityError('')
      setAvailabilityLoading(false)
      return
    }

    const controller = new AbortController()

    const fetchAvailability = async () => {
      setAvailabilityLoading(true)
      setAvailabilityError('')
      setBookedTimes([])

      try {
        const response = await axios.get(
          `${API_URL}availability/`,
          {
            params: { date: form.date },
            signal: controller.signal,
          }
        )

        setBookedTimes(response.data.booked_times || [])
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          setAvailabilityError(
            'Unable to load available times. Please try again.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setAvailabilityLoading(false)
        }
      }
    }

    fetchAvailability()

    return () => controller.abort()
  }, [form.date])

  const update = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'date' ? { time: '' } : {}),
    }))

    setMessage('')
    setSuccess(false)
  }

  const submit = async (e) => {
    e.preventDefault()

    if (availabilityLoading || availabilityError) {
      setMessage('Please wait until availability is loaded.')
      return
    }

    if (bookedTimes.includes(form.time)) {
      setMessage('This time slot is already booked. Please select another time.')
      return
    }

    setLoading(true)
    setMessage('')
    setSuccess(false)

    try {
      const response = await axios.post(API_URL, form)

    setSuccess(true)
    setMessage(
  `Thank you, ${form.name}! Your ${form.service} booking request has been received. Booking ID: ${response.data.id}. Our team will contact you to confirm your appointment.`
)

setTimeout(() => {
  window.location.href = '/my-bookings'
}, 2000)
      setForm({
        name: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        address: '',
      })
    } catch (error) {
      const data = error.response?.data

      const errorMessage =
        data?.time?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.detail ||
        (typeof data === 'string' ? data : null) ||
        (data && typeof data === 'object'
          ? Object.values(data).flat().find(
              (value) => typeof value === 'string'
            )
          : null) ||
        'Something went wrong. Please try again.'

      setMessage(errorMessage)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="booking-page">
      <div className="booking-heading">
        <span>MOON BEAUTY</span>
        <h1>Book your <em>appointment</em></h1>
        <p>
          Enjoy professional beauty services in the comfort
          of your home.
        </p>
      </div>

      <form className="booking-form" onSubmit={submit}>
        <h2>Your details</h2>

        <label>
          <span><User size={16} /> Full name</span>
          <input
            name="name"
            value={form.name}
            onChange={update}
            placeholder="Enter your full name"
            required
          />
        </label>

        <label>
          <span><Phone size={16} /> Phone number</span>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={update}
            placeholder="10-digit mobile number"
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />
        </label>

        <label>
          <span>Beauty service</span>
          <select
            name="service"
            value={form.service}
            onChange={update}
            required
          >
            <option value="">Select a service</option>
            <optgroup label="Makeup">
              <option value="Engagement Makeup">Engagement Makeup</option>
              <option value="Party Makeup">Party Makeup</option>
              <option value="Bridal Makeup">Bridal Makeup</option>
              <option value="Reception Makeup">Reception Makeup</option>
              <option value="Siders Makeup">Siders Makeup</option>
              <option value="HD Bridal Makeup">HD Bridal Makeup</option>
              <option value="Airbrush Makeup">Airbrush Makeup</option>
              <option value="Natural Makeup">Natural Makeup</option>
              <option value="Cocktail Makeup">Cocktail Makeup</option>
              <option value="Festive Makeup">Festive Makeup</option>
              <option value="Baby Shower Makeup">Baby Shower Makeup</option>
              <option value="Photoshoot Makeup">Photoshoot Makeup</option>
            </optgroup>
            <optgroup label="Beauty Care">
              <option value="Facial">Facial</option>
              <option value="Eyebrow">Eyebrow</option>
              <option value="Waxing">Waxing</option>
              <option value="Manicure">Manicure</option>
              <option value="Pedicure">Pedicure</option>
              <option value="Manicure & Pedicure">Manicure & Pedicure</option>
              <option value="Hair Styling">Hair Styling</option>
              <option value="Hair Spa">Hair Spa</option>
            </optgroup>
            <optgroup label="Mehendi">
              <option value="Bridal Mehendi">Bridal Mehendi</option>
              <option value="Engagement Mehendi">Engagement Mehendi</option>
              <option value="Arabic Mehendi">Arabic Mehendi</option>
              <option value="Minimal Mehendi">Minimal Mehendi</option>
              <option value="Traditional Mehendi">Traditional Mehendi</option>
              <option value="Feet Mehendi">Feet Mehendi</option>
            </optgroup>
          </select>
        </label>

        <div className="booking-row">
          <label>
            <span><CalendarDays size={16} /> Appointment date</span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={update}
              min={new Date().toLocaleDateString('en-CA')}
              required
            />
          </label>

          <label>
            <span><Clock size={16} /> Preferred time</span>
            <select
              name="time"
              value={form.time}
              onChange={update}
              disabled={!form.date || availabilityLoading || !!availabilityError}
              required
            >
              <option value="">
                {!form.date
                  ? 'Select a date first'
                  : availabilityLoading
                    ? 'Loading times...'
                    : 'Select time'}
              </option>

              {timeSlots.map((time) => {
                const isBooked = bookedTimes.includes(time)

                return (
                  <option
                    key={time}
                    value={time}
                    disabled={isBooked}
                  >
                    {time}{isBooked ? ' (Booked)' : ''}
                  </option>
                )
              })}
            </select>

            {availabilityLoading && (
              <small>Checking available times...</small>
            )}

            {availabilityError && (
              <small style={{ color: '#b42318' }}>
                {availabilityError}
              </small>
            )}

            {!availabilityLoading &&
              !availabilityError &&
              form.date &&
              timeSlots.every((time) => bookedTimes.includes(time)) && (
                <small style={{ color: '#b42318' }}>
                  All time slots are booked for this date.
                </small>
              )}
          </label>
        </div>

        <label>
          <span><MapPin size={16} /> Home address</span>
          <textarea
            name="address"
            value={form.address}
            onChange={update}
            placeholder="Enter your complete address in Ahmedabad"
            rows={3}
            required
          />
        </label>

        <button
          className="booking-submit"
          type="submit"
          disabled={
            loading ||
            success ||
            availabilityLoading ||
            !!availabilityError
          }
        >
          {loading
            ? 'Submitting...'
            : success
              ? 'Booking Submitted'
              : 'Request Booking'}
          {!loading && !success && <ArrowRight size={18} />}
        </button>

        {message && (
          <p
            className="booking-message"
            role="status"
            style={{
              color: success ? '#166534' : '#b42318',
              backgroundColor: success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${success ? '#bbf7d0' : '#fecaca'}`,
              padding: '16px',
              borderRadius: '10px',
            }}
          >
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
