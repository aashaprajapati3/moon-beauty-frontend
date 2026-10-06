
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => setMenuOpen(false)

  const goToServices = (e) => {
    e.preventDefault()
    closeMenu()

    if (location.pathname === '/') {
      document.getElementById('services')?.scrollIntoView({
        behavior: 'smooth',
      })
    } else {
      window.location.href = '/#services'
    }
  }

  const goToAbout = (e) => {
    e.preventDefault()
    closeMenu()

    if (location.pathname === '/') {
      document.getElementById('about')?.scrollIntoView({
        behavior: 'smooth',
      })
    } else {
      window.location.href = '/#about'
    }
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        <span className="logo-icon">☾</span>
        <span>
          MOON <small>BEAUTY</small>
        </span>
      </Link>

      <button
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>

        <a href="/#services" onClick={goToServices}>
          Services
        </a>

        <a href="/#about" onClick={goToAbout}>
          About Us
        </a>

        <a href="/#contact" onClick={closeMenu}>
          Contact
        </a>

        <Link
          to="/my-bookings"
          className="nav-book"
          onClick={closeMenu}
        >
          My Bookings
        </Link>

        <Link
          to="/booking"
          className="nav-book"
          onClick={closeMenu}
        >
          Book Now <ArrowRight size={16} />
        </Link>
      </nav>
    </header>
  )
}
