import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Menu, ArrowRight } from 'lucide-react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
      <a href="#hero" className="navbar-logo" aria-label="HospiLink Home">
        <span>Hospi<span>Link</span></span>
      </a>

      <ul className="navbar-links" role="list">
        {[
          ['#features',     'Features'],
          ['#how-it-works', 'How It Works'],
          ['#roles',        "Who It's For"],
          ['#testimonials', 'Stories'],
        ].map(([href, label]) => (
          <li key={href}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <Link to="/login" className="btn-ghost">Log In</Link>
        <Link to="/register" className="btn-primary" id="nav-cta-btn">
          Register <ArrowRight size={15} />
        </Link>
      </div>

      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <Menu size={22} />
      </button>
    </nav>
  );
}
