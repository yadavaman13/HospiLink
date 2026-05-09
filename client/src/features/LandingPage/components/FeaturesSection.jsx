import React from 'react';
import { PenLine, Brain, CalendarCheck, HeartPulse, Building2, BedDouble, QrCode, FileText, LayoutDashboard, Users, Zap, TrendingUp } from 'lucide-react';

const FEATURES = [
  {
    Icon: Brain,
    title: 'AI-Powered Triage',
    desc: 'Google Gemini analyzes patient symptoms in real time and assigns a priority score (0–100), ensuring the most critical patients are always seen first.',
    tag: 'Gemini AI',
  },
  {
    Icon: Building2,
    title: 'Multi-Hospital Network',
    desc: 'Connect multiple hospitals on one platform. Each facility operates independently while a super admin monitors the entire network from a single dashboard.',
    tag: 'Network',
  },
  {
    Icon: BedDouble,
    title: 'Real-Time Bed Tracking',
    desc: 'Live bed availability across ICU, General, and Private wards. Hospital staff see instant occupancy rates and assign beds without phone calls.',
    tag: 'Live Updates',
  },
  {
    Icon: QrCode,
    title: 'QR Patient Admission',
    desc: 'Every admitted patient receives a unique QR wristband. Nurses scan it to instantly pull up prescriptions, vitals, and the full care timeline.',
    tag: 'QR System',
  },
  {
    Icon: FileText,
    title: 'Unified Medical Records',
    desc: 'Patients carry their complete medical history across every hospital in the network — with privacy consent controls built in.',
    tag: 'Cross-Hospital',
  },
  {
    Icon: LayoutDashboard,
    title: 'Role-Based Dashboards',
    desc: 'Tailored views for every role - super admin, hospital admin, doctor, nurse, and patient. so, everyone sees exactly what they need.',
    tag: 'RBAC',
  },
];

const HOW_STEPS = [
  { Icon: PenLine,       title: 'Describe Symptoms',  desc: 'Patient enters their symptoms and medical history into a simple form.' },
  { Icon: Brain,         title: 'AI Prioritises',      desc: 'Gemini AI scores urgency instantly, critical cases jump to the front.' },
  { Icon: CalendarCheck, title: 'Book Appointment',    desc: 'Patient selects a hospital and doctor; email confirmation is sent automatically.' },
  { Icon: HeartPulse,    title: 'Receive Smart Care',  desc: 'Doctor reviews the AI analysis and full patient history before the visit.' },
];

const STATS = [
  { Icon: Building2,   value: '50+',   label: 'Hospitals Onboarded' },
  { Icon: Users,       value: '10K+',  label: 'Patients Served' },
  { Icon: Zap,         value: '< 2s',  label: 'AI Triage Speed' },
  { Icon: TrendingUp,  value: '99.9%', label: 'Platform Uptime' },
];

function HowItWorks() {
  return (
    <section className="section how-it-works" id="how-it-works" aria-label="How it works">
      <div className="section-inner">
        <div className="section-header center animate-on-scroll">
          <span className="section-label">Simple Process</span>
          <h2 className="section-title">From Symptom to Care in 4 Steps</h2>
          <p className="section-subtitle">
            Our AI-first workflow means patients get the right doctor, at the right hospital,
            at the right time, every time.
          </p>
        </div>
        <div className="how-grid">
          {HOW_STEPS.map(({ Icon, title, desc }, i) => (
            <div
              className="how-card animate-on-scroll"
              key={title}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="how-step-num">{i + 1}</div>
              <div className="how-icon-wrap">
                <Icon size={28} strokeWidth={1.7} color="var(--primary)" />
              </div>
              <h3 className="how-card-title">{title}</h3>
              <p className="how-card-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section" id="features" aria-label="Features">
      <div className="section-inner">
        <div className="section-header animate-on-scroll">
          <span className="section-label">Platform Features</span>
          <h2 className="section-title">Everything a Modern Hospital Network Needs</h2>
          <p className="section-subtitle">
            Built for the full spectrum of healthcare <b>from a single clinic to a 50-hospital network.</b>
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map(({ Icon, title, desc, tag }, i) => (
            <div
              className="feature-card animate-on-scroll"
              key={title}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="feature-icon-wrap">
                <Icon size={24} strokeWidth={1.8} color="var(--primary)" />
              </div>
              <h3 className="feature-card-title">{title}</h3>
              <p className="feature-card-desc">{desc}</p>
              <span className="feature-tag">{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats-section" aria-label="Platform statistics">
      <div className="stats-inner">
        {STATS.map(({ Icon, value, label }, i) => (
          <div
            className="stat-item animate-on-scroll"
            key={label}
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <div className="stat-icon-wrap">
              <Icon size={28} strokeWidth={1.8} color="rgba(255,255,255,0.9)" />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <>
      <HowItWorks />
      <Features />
      <Stats />
    </>
  );
}
