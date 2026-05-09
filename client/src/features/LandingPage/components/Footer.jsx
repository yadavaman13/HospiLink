import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer" aria-label="Site footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              HospiLink
            </div>
            <p className="footer-brand-desc">
              The intelligent healthcare network connecting hospitals, doctors, and patients —
              powered by AI and built for the future of care.
            </p>
          </div>
          <div>
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#roles">User Roles</a></li>
              <li><a href="#testimonials">Stories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Access</h4>
            <ul className="footer-links">
              <li><Link to="/login">Patient Login</Link></li>
              <li><Link to="/login">Doctor Login</Link></li>
              <li><Link to="/login">Admin Login</Link></li>
              <li><Link to="/register">Register Hospital</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">HIPAA Compliance</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} HospiLink. All rights reserved.</span>
          <div className="footer-bottom-right">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
