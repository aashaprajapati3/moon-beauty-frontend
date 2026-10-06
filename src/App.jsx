import API_BASE_URL from "./api";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Heart,
  Clock,
  ShieldCheck,
  Star,
  Phone,
  MapPin,
  Check,
  Scissors,
  Hand,
  Smile,
  Flower2,
  WandSparkles,
  Crown,
  Gem,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";
import Navbar from "./Navbar";
import Booking from "./Booking";
import MyBookings from "./MyBookings";
import "./App.css";

const serviceGroups = [
  {
    title: "Skin & Glow",
    icon: <Smile />,
    services: [
      {
        name: "Facial",
        description: "Relaxing facials and glow treatments for fresh, healthy-looking skin.",
        price: "₹999",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900",
        tag: "Glow",
      },
      {
        name: "Eyebrow",
        description: "Precise eyebrow shaping for a clean and polished look.",
        price: "₹149",
        image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900",
        tag: "Quick care",
      },
      {
        name: "Waxing",
        description: "Comfort-focused waxing services for smooth, soft skin.",
        price: "₹399",
        image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=900",
        tag: "Smooth",
      },
    ],
  },
  {
    title: "Hands & Feet",
    icon: <Hand />,
    services: [
      {
        name: "Manicure",
        description: "Neat nails, cuticle care and a beautiful finishing touch.",
        price: "₹499",
        image: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=900",
        tag: "Nails",
      },
      {
        name: "Pedicure",
        description: "Relaxing foot care with cleaning, shaping and nourishing treatment.",
        price: "₹599",
        image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=900",
        tag: "Relax",
      },
      {
        name: "Manicure & Pedicure",
        description: "A complete hands-and-feet care ritual at home.",
        price: "₹999",
        image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900",
        tag: "Complete care",
      },
    ],
  },
  {
    title: "Hair & Styling",
    icon: <Scissors />,
    services: [
      {
        name: "Hair Styling",
        description: "Elegant styling for parties, celebrations and everyday confidence.",
        price: "₹799",
        image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=900",
        tag: "Style",
      },
      {
        name: "Hair Spa",
        description: "A soothing at-home hair care ritual for soft, refreshed hair.",
        price: "₹899",
        image: "https://images.unsplash.com/photo-1527799820374-dcf8c8a1f7d4?w=900",
        tag: "Care",
      },
    ],
  },
];

const makeupServices = [
  ["Engagement Makeup", "₹2,999", "Elegant, camera-ready makeup for your engagement.", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900"],
  ["Party Makeup", "₹1,999", "Glamorous looks for parties and special celebrations.", "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900"],
  ["Bridal Makeup", "₹4,999", "A complete bridal look designed around your style and outfit.", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900"],
  ["Reception Makeup", "₹3,499", "Polished evening glam for your reception celebration.", "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900"],
  ["Siders Makeup", "₹1,799", "Beautiful supporting looks for wedding-side celebrations.", "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900"],
  ["HD Bridal Makeup", "₹5,999", "High-definition bridal finish for photography and video.", "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900"],
  ["Airbrush Makeup", "₹6,499", "Lightweight, long-wear airbrush finish for special occasions.", "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900"],
  ["Natural Makeup", "₹1,499", "Soft, fresh makeup for an effortless everyday look.", "https://images.unsplash.com/photo-1512207846876-bb54ef505d2c?w=900"],
  ["Cocktail Makeup", "₹2,499", "Statement glam for cocktail evenings and events.", "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900"],
  ["Festive Makeup", "₹2,199", "Radiant festive looks for family functions and celebrations.", "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900"],
  ["Baby Shower Makeup", "₹2,199", "Soft, glowing makeup for your special celebration.", "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900"],
  ["Photoshoot Makeup", "₹2,999", "Camera-ready makeup tailored to lighting and photography.", "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=900"],
];

const mehendiServices = [
  ["Bridal Mehendi", "₹2,999", "Detailed bridal patterns for hands and special wedding moments."],
  ["Engagement Mehendi", "₹1,499", "Elegant designs for your engagement celebration."],
  ["Arabic Mehendi", "₹799", "Flowing floral Arabic-inspired patterns."],
  ["Minimal Mehendi", "₹499", "Simple, modern designs with a delicate finish."],
  ["Traditional Mehendi", "₹999", "Classic Indian patterns for festive occasions."],
  ["Feet Mehendi", "₹699", "Beautiful feet designs to complete your festive look."],
];

function ServiceCard({ service, compact = false }) {
  return (
    <motion.article
      className={`service-card ${compact ? "compact-card" : ""}`}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="service-image">
        <img src={service.image} alt={service.name} loading="lazy" />
        <span className="service-tag">{service.tag || "At home"}</span>
        <span className="service-glow" />
      </div>
      <div className="service-info">
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <div className="service-bottom">
          <span>From <strong>{service.price}</strong></span>
          <Link to="/booking" state={{ service: service.name }} aria-label={`Book ${service.name}`}>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function HomePage() {
  return (
    <div className="website">
      <main>
        <section className="hero" id="home">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow">
              <Sparkles size={16} />
              BEAUTY • WELLNESS • AT YOUR DOORSTEP
            </span>
            <h1>
              Your beauty ritual,
              <br />
              <em>reimagined at home.</em>
            </h1>
            <p>
              Premium makeup, skincare, waxing, nails, hair styling and mehendi —
              delivered with a calm, personalised salon experience at your doorstep.
            </p>
            <div className="hero-actions">
              <Link to="/booking" className="primary-button">
                Book a beauty session <ArrowRight size={18} />
              </Link>
              <a href="#services" className="secondary-button">Explore services</a>
            </div>
            <div className="hero-trust">
              <span><ShieldCheck size={17} /> Trained professionals</span>
              <span><CalendarCheck size={17} /> Easy scheduling</span>
              <span><Heart size={17} /> Personalised care</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <div className="hero-frame">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200"
                alt="Elegant beauty service experience"
              />
            </div>
            <div className="floating-card floating-card-top">
              <Sparkles size={18} />
              <div><strong>Beauty, your way</strong><small>From everyday glow to bridal glam</small></div>
            </div>
            <div className="floating-card floating-card-bottom">
              <Star size={18} fill="currentColor" />
              <div><strong>Premium at-home care</strong><small>Comfort • Hygiene • Personal attention</small></div>
            </div>
          </motion.div>
        </section>

        <section className="features">
          <div><ShieldCheck /><span>Professional & hygiene-first</span></div>
          <div><Heart /><span>Personalised beauty experience</span></div>
          <div><Clock /><span>Flexible home appointments</span></div>
          <div><Gem /><span>Premium beauty rituals</span></div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading">
            <span className="eyebrow">THE MOON BEAUTY MENU</span>
            <h2>Everything you need to <em>feel beautiful.</em></h2>
            <p>Choose one ritual or build your complete beauty day at home.</p>
          </div>

          {serviceGroups.map((group, index) => (
            <motion.div
              className="service-group"
              key={group.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.55, delay: index * 0.05 }}
            >
              <div className="group-heading">
                <span className="group-icon">{group.icon}</span>
                <div><h3>{group.title}</h3><p>At-home care, thoughtfully curated.</p></div>
              </div>
              <div className="service-grid">
                {group.services.map((service) => <ServiceCard service={service} key={service.name} />)}
              </div>
            </motion.div>
          ))}
        </section>

        <section className="makeup-section" id="makeup">
          <div className="makeup-heading">
            <div>
              <span className="eyebrow"><Crown size={15} /> MAKEUP STUDIO AT HOME</span>
              <h2>Your occasion.<br /><em>Your signature look.</em></h2>
            </div>
            <p>From your first celebration to your wedding day, choose the finish, mood and glamour level that feels like you.</p>
          </div>

          <div className="makeup-grid">
            {makeupServices.map(([name, price, description, image], index) => (
              <motion.article
                className="makeup-card"
                key={name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ delay: (index % 4) * 0.06 }}
              >
                <img src={image} alt={name} loading="lazy" />
                <div className="makeup-overlay" />
                <div className="makeup-card-content">
                  <span>{name}</span>
                  <p>{description}</p>
                  <div>
                    <strong>{price}</strong>
                    <Link to="/booking" state={{ service: name }} aria-label={`Book ${name}`}>
                      <ChevronRight size={19} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mehendi-section" id="mehendi">
          <div className="section-heading">
            <span className="eyebrow"><Flower2 size={15} /> MEHENDI ARTISTRY</span>
            <h2>Details that make every <em>celebration special.</em></h2>
            <p>Traditional artistry with modern, delicate designs — created in the comfort of your home.</p>
          </div>
          <div className="mehendi-grid">
            {mehendiServices.map(([name, price, description], index) => (
              <motion.div
                className="mehendi-card"
                key={name}
                whileHover={{ y: -6, rotate: index % 2 ? 0.4 : -0.4 }}
              >
                <div className="mehendi-icon"><Flower2 size={20} /></div>
                <h3>{name}</h3>
                <p>{description}</p>
                <div><strong>{price}</strong><Link to="/booking" state={{ service: name }}>Book <ArrowRight size={15} /></Link></div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="experience-section">
          <div className="experience-copy">
            <span className="eyebrow"><WandSparkles size={15} /> THE MOON BEAUTY EXPERIENCE</span>
            <h2>Salon-level care.<br /><em>Home-level comfort.</em></h2>
            <p>
              No traffic, no waiting room, no rushing. Pick your service, choose a
              convenient time, and let our beauty experience come to you.
            </p>
            <ul>
              <li><Check size={17} /> Convenient appointment slots</li>
              <li><Check size={17} /> Beauty services tailored to your occasion</li>
              <li><Check size={17} /> Comfortable private experience at home</li>
            </ul>
            <Link to="/booking" className="primary-button">Plan my beauty day <ArrowRight size={18} /></Link>
          </div>
          <div className="experience-image">
            <img src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1000" alt="Premium beauty and skincare products" loading="lazy" />
            <div className="experience-badge"><Sparkles size={17} /><span>Made for your moment</span></div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-image">
            <img src="https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=1000" alt="Moon Beauty professional beauty experience" loading="lazy" />
          </div>
          <div className="about-content">
            <span className="eyebrow">ABOUT MOON BEAUTY</span>
            <h2>A little care.<br />A lot of <em>confidence.</em></h2>
            <p>
              Moon Beauty brings beauty and self-care to your doorstep with a modern,
              calm and personalised experience. Whether it is a quick eyebrow session,
              festive mehendi, a glowing facial or your bridal transformation, we make
              your beauty day feel effortless.
            </p>
            <Link to="/booking" className="primary-button">Book my service <ArrowRight size={18} /></Link>
          </div>
        </section>

        <section className="testimonial">
          <Star className="star-icon" fill="currentColor" />
          <span className="eyebrow">YOUR MOMENT, YOUR WAY</span>
          <h2>Beauty should feel like <em>you.</em></h2>
          <p>From a simple self-care hour to your biggest celebration, Moon Beauty is here at your doorstep.</p>
          <Link to="/booking" className="primary-button">Book Your Appointment <ArrowRight size={18} /></Link>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div>
          <a href="/" className="logo footer-logo">
            <span className="logo-icon">☾</span>
            <span>MOON <small>BEAUTY</small></span>
          </a>
          <p>Beauty at your doorstep.</p>
          <p className="footer-muted">Premium makeup, skincare, hair, nails, waxing and mehendi at home.</p>
        </div>
        <div className="footer-contact">
          <h3>Contact & Service Area</h3>
          <p><Phone size={16} /> Contact details coming soon</p>
          <p><MapPin size={16} /> Ahmedabad, Gujarat</p>
          <p><Sparkles size={16} /> Home beauty appointments</p>
        </div>
        <div className="footer-links">
          <Link to="/booking">Book Appointment</Link>
          <Link to="/my-bookings">My Bookings</Link>
          <a href="#services">Services</a>
          <a href="#makeup">Makeup</a>
          <a href="#mehendi">Mehendi</a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Moon Beauty. All rights reserved.</p>
      </footer>
    </div>
  );
}

function ProtectedAdminRoute() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/bookings/admin/`, { withCredentials: true })
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="route-loading">Checking admin access...</div>;
  if (!isAdmin) return <Navigate to="/admin-login" replace />;
  return <AdminDashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<ProtectedAdminRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
