import React from 'react';
import { ShieldCheck, Building2, Stethoscope, ClipboardList, User, CheckCircle, Quote } from 'lucide-react';

const ROLES = [
  {
    Icon: ShieldCheck,
    title: 'Super Admin',
    desc: "Platform owner with a bird's-eye view.",
    perms: ['Approve hospitals', 'Global analytics', 'Emergency overrides'],
  },
  {
    Icon: Building2,
    title: 'Hospital Admin',
    desc: 'Manages one hospital end-to-end.',
    perms: ['Doctor & staff mgmt', 'Bed configuration', 'Occupancy dashboard'],
  },
  {
    Icon: Stethoscope,
    title: 'Doctor',
    desc: 'Treats patients with AI-sorted queues.',
    perms: ['AI appointment queue', 'Patient history', 'Prescribe treatments'],
  },
  {
    Icon: ClipboardList,
    title: 'Nurse / Staff',
    desc: 'Manages daily care operations.',
    perms: ['QR wristband scan', 'Medicine logging', 'Bed assignments'],
  },
  {
    Icon: User,
    title: 'Patient',
    desc: 'Books and tracks care across hospitals.',
    perms: ['AI-assisted booking', 'Cross-hospital records', 'Download reports'],
  },
];

const TESTIMONIALS = [
  {
    text: 'HospiLink cut our patient intake time by 40%. The AI triage is genuinely remarkable — our doctors now walk in knowing exactly who needs attention first.',
    name: 'Dr. Priya Sharma',
    role: 'Chief of Medicine, City General Hospital',
    initials: 'PS',
    color: '#0B5C6B',
  },
  {
    text: 'Managing bed availability across three floors used to be a nightmare of phone calls. Now the whole team sees live occupancy on one screen.',
    name: 'Ramesh Nair',
    role: 'Hospital Administrator, Apollo Network',
    initials: 'RN',
    color: '#2E93A3',
  },
  {
    text: 'As a patient, having my records follow me to any hospital in the network gives me so much peace of mind. The QR wristband check-in felt futuristic.',
    name: 'Ananya Desai',
    role: 'Patient, HospiLink User',
    initials: 'AD',
    color: '#1a7a8a',
  },
  {
    text: 'The seamless integration of emergency requests into my dashboard allows me to prepare for critical cases before they even arrive at the ward.',
    name: 'Dr. Kabir Singh',
    role: 'Senior Surgeon, Metro Care',
    initials: 'KS',
    color: '#0e7c91',
  },
  {
    text: 'Allocating nurses and managing shifts is incredibly intuitive now. The system automatically highlights understaffed wards based on live patient count.',
    name: 'Sarah Joseph',
    role: 'Head Nurse, Sunshine Clinics',
    initials: 'SJ',
    color: '#328b9e',
  },
  {
    text: 'With the automated data flow, our monthly billing audits are done in a fraction of the time. The platform is secure, fast, and reliable.',
    name: 'Vikram Patel',
    role: 'Financial Officer, HealthNet',
    initials: 'VP',
    color: '#074854',
  },
];

function Roles() {
  return (
    <section className="section roles-section" id="roles" aria-label="User roles">
      <div className="section-inner">
        <div className="section-header center animate-on-scroll">
          <span className="section-label">Who It's For</span>
          <h2 className="section-title">A Platform Built for Every Stakeholder</h2>
          <p className="section-subtitle">
            Five distinct roles, each with a tailored dashboard and permissions. so, everyone
            has exactly what they need.
          </p>
        </div>
        <div className="roles-grid">
          {ROLES.map(({ Icon, title, desc, perms }, i) => (
            <div
              className="role-card animate-on-scroll"
              key={title}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="role-icon-wrap">
                <Icon size={26} strokeWidth={1.8} color="var(--primary)" />
              </div>
              <h3 className="role-title">{title}</h3>
              <p className="role-desc">{desc}</p>
              <ul className="role-perms">
                {perms.map((p) => (
                  <li key={p}>
                    <CheckCircle size={13} strokeWidth={2.5} color="var(--primary-light)" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section testimonials" id="testimonials" aria-label="Testimonials">
      <div className="section-inner">
        <div className="section-header center animate-on-scroll">
          <span className="section-label">Real Stories</span>
          <h2 className="section-title">Trusted by Healthcare Professionals</h2>
          <p className="section-subtitle">
            Hear from the doctors, administrators, and patients who rely on HospiLink every day.
          </p>
        </div>
        
        <div className="testimonials-marquee-wrapper animate-on-scroll">
          <div className="testimonials-track">
            {/* First set of cards */}
            {TESTIMONIALS.map((t, i) => (
              <div className="testimonial-card" key={`t1-${i}`}>
                <div className="testimonial-quote-icon">
                  <Quote size={22} strokeWidth={1.8} color="var(--primary-light)" />
                </div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: t.color }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicated set for seamless infinite scroll */}
            {TESTIMONIALS.map((t, i) => (
              <div className="testimonial-card" key={`t2-${i}`} aria-hidden="true">
                <div className="testimonial-quote-icon">
                  <Quote size={22} strokeWidth={1.8} color="var(--primary-light)" />
                </div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: t.color }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function RolesSection() {
  return (
    <>
      <Roles />
      <Testimonials />
    </>
  );
}
