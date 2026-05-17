import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Brain,
  BedDouble,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import '../styles/auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/* ─── Left panel feature bullets ─── */
const FEATURES = [
  {
    Icon: Brain,
    title: 'AI-Powered Triage',
    desc: 'Gemini AI prioritises patients by urgency automatically.',
  },
  {
    Icon: BedDouble,
    title: 'Live Bed Tracking',
    desc: 'Real-time occupancy across ICU, General & Private wards.',
  },
  {
    Icon: ShieldCheck,
    title: 'Secure & HIPAA-Ready',
    desc: 'JWT auth, httpOnly cookies, and role-based access control.',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'error'|'success', msg }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (alert) setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!form.email || !form.password) {
      setAlert({ type: 'error', msg: 'Email and password are required.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: 'error', msg: data.message || 'Login failed. Please try again.' });
      } else {
        setAlert({ type: 'success', msg: 'Logged in successfully! Redirecting…' });
        // Store token if needed
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user?.role) localStorage.setItem('role', data.user.role);

        const roleRedirects = {
          super_admin: '/super-admin/dashboard',
          hospital_admin: '/hospital/dashboard',
          doctor: '/doctor/dashboard',
          staff: '/doctor/dashboard',
          patient: '/patient/dashboard',
        };

        const nextPath = roleRedirects[data.user?.role] || '/patient/dashboard';
        setTimeout(() => navigate(nextPath), 1000);
      }
    } catch {
      setAlert({ type: 'error', msg: 'Unable to connect to the server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-panel-left">
        <a href="/" className="auth-left-logo">
          <div className="auth-left-logo-icon">
            <Activity size={18} strokeWidth={2.5} color="#fff" />
          </div>
          <span className="auth-left-logo-text">Hospi<span>Link</span></span>
        </a>

        <div className="auth-left-content">
          <h2 className="auth-left-tagline">
            Healthcare,<br />
            <span>Intelligently Connected</span>
          </h2>
          <p className="auth-left-desc">
            Log in to access your personalised dashboard — whether you're a patient, doctor,
            hospital admin, or network operator.
          </p>
          <div className="auth-left-features">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div className="auth-left-feature" key={title}>
                <div className="auth-left-feature-icon">
                  <Icon size={20} strokeWidth={1.8} color="#fff" />
                </div>
                <div className="auth-left-feature-text">
                  <strong>{title}</strong>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="auth-left-footer">© {new Date().getFullYear()} HospiLink. All rights reserved.</p>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-subtitle">
              Don't have an account?{' '}
              <Link to="/register">Create one for free</Link>
            </p>
            <p className="auth-form-subtitle" style={{ marginTop: 8 }}>
              Register a hospital?{' '}
              <Link to="/hospital/register">Start here</Link>
            </p>
          </div>

          {alert && (
            <div className={`auth-alert ${alert.type}`}>
              <AlertCircle size={16} strokeWidth={2} />
              {alert.msg}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">
                Email address <span className="required">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Mail size={16} strokeWidth={2} />
                </span>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">
                Password <span className="required">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Lock size={16} strokeWidth={2} />
                </span>
                <input
                  id="login-password"
                  className="auth-input auth-input-has-right"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-input-icon-right"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
