import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import '../styles/landing.css';

export function CTASection() {
  return (
    <section className="cta-section" aria-label="Call to action">
      <div className="cta-inner animate-on-scroll">
        <h2 className="cta-title">Ready to Modernise Your Hospital?</h2>
        <p className="cta-subtitle">
          Join a growing network of hospitals using AI-powered triage, live bed tracking, and
          QR-based patient management. Setup takes less than a day.
        </p>
        <div className="cta-actions">
          <Link to="/register" className="btn-primary btn-primary-lg" id="cta-register-btn">
            Register Your Hospital <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-outline" id="cta-login-btn">
            Already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}
