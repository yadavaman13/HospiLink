import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Brain, BedDouble, Zap, Building2, Users, TrendingUp } from 'lucide-react';

const STATS = [
  { Icon: Building2,   value: '50+',   label: 'Hospitals Onboarded' },
  { Icon: Users,       value: '10K+',  label: 'Patients Served' },
  { Icon: Zap,         value: '< 2s',  label: 'AI Triage Speed' },
  { Icon: TrendingUp,  value: '99.9%', label: 'Platform Uptime' },
];

export function HeroSection() {
  return (
    <section className="hero" id="hero" aria-label="Hero section">
      <div className="hero-inner">
        {/* Left Copy */}
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Healthcare Network
          </div>
          <h1 className="hero-title">
            Smart Hospitals,<br />
            <span className="hero-title-accent">Smarter Care</span>
          </h1>
          <p className="hero-subtitle">
            HospiLink connects hospitals, doctors, and patients on one platform, with AI that
            prioritises the right patients, live bed tracking, and QR-powered admissions.
          </p>
          <div className="hero-ctas">
            <Link to="/register" className="btn-primary btn-primary-lg" id="hero-cta-register">
              Start for Free <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn-outline" id="hero-cta-learn">
              <Play size={14} fill="currentColor" /> See How It Works
            </a>
          </div>
          <div className="hero-stats">
            {STATS.map(({ Icon, value, label }) => (
              <div className="hero-stat" key={label}>
                <span className="hero-stat-value">{value}</span>
                <span className="hero-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Visual */}
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card-main">
            <div className="hero-card-header">
              <span className="hero-card-title">
                <Brain size={16} className="card-title-icon" />
                AI Appointment Queue
              </span>
              <span className="hero-card-badge">Live</span>
            </div>

            {[
              { name: 'Aarav Mehta',  symptoms: 'Chest pain, shortness of breath', priority: 'critical', color: '#dc2626', initials: 'AM' },
              { name: 'Sunita Rao',   symptoms: 'High fever, severe headache',      priority: 'high',     color: '#d97706', initials: 'SR' },
              { name: 'Kiran Patel',  symptoms: 'Mild cough, fatigue',              priority: 'medium',   color: '#059669', initials: 'KP' },
            ].map((p) => (
              <div className="hero-queue-item" key={p.name}>
                <div className="hero-queue-avatar" style={{ background: p.color }}>
                  {p.initials}
                </div>
                <div className="hero-queue-info">
                  <div className="hero-queue-name">{p.name}</div>
                  <div className="hero-queue-symptoms">{p.symptoms}</div>
                </div>
                <span className={`priority-badge priority-${p.priority}`}>
                  {p.priority.charAt(0).toUpperCase() + p.priority.slice(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Floating cards */}
          <div className="hero-float-card hero-float-1">
            <div className="float-icon-wrap">
              <BedDouble size={20} color="var(--primary)" />
            </div>
            <div className="float-text">
              <span className="float-label">ICU Beds Available</span>
              <span className="float-value">12 / 24</span>
            </div>
          </div>
          <div className="hero-float-card hero-float-2">
            <div className="float-icon-wrap">
              <Zap size={20} color="var(--primary)" />
            </div>
            <div className="float-text">
              <span className="float-label">AI Triage Speed</span>
              <span className="float-value">1.4 seconds</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
