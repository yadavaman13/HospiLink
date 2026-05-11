import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Droplets,
  MapPin,
  ArrowRight,
  Brain,
  QrCode,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import '../styles/auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const LEFT_FEATURES = [
  {
    Icon: Brain,
    title: 'AI Symptom Triage',
    desc: 'Get prioritised by Gemini AI the moment you book.',
  },
  {
    Icon: QrCode,
    title: 'QR Wristband Admission',
    desc: 'One scan shows your full care timeline to any nurse.',
  },
  {
    Icon: ShieldCheck,
    title: 'Cross-Hospital Records',
    desc: 'Your medical history follows you across every network hospital.',
  },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  gender: '',
  age: '',
  bloodGroup: '',
  address: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm]       = useState(INITIAL_FORM);
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);
  const [errors, setErrors]   = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (alert) setAlert(null);
  };

  /* Client-side validation */
  const validate = () => {
    const errs = {};
    if (!form.firstName.trim())  errs.firstName = 'First name is required.';
    if (!form.lastName.trim())   errs.lastName  = 'Last name is required.';
    if (!form.email.trim())      errs.email     = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password)          errs.password  = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!form.phone.trim())      errs.phone     = 'Phone number is required.';
    if (!form.gender)            errs.gender    = 'Please select a gender.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        email:     form.email,
        password:  form.password,
        firstName: form.firstName,
        lastName:  form.lastName,
        phone:     form.phone,
        gender:    form.gender,
        role:      'patient', // default — backend allows override
        ...(form.age        && { age:        Number(form.age) }),
        ...(form.bloodGroup && { bloodGroup: form.bloodGroup }),
        ...(form.address    && { address:    form.address }),
      };

      const res  = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: 'error', msg: data.message || 'Registration failed. Please try again.' });
      } else {
        if (data.token) localStorage.setItem('token', data.token);
        setAlert({ type: 'success', msg: 'Account created! Redirecting to your dashboard…' });
        setTimeout(() => navigate('/patient/dashboard'), 1200);
      }
    } catch {
      setAlert({ type: 'error', msg: 'Unable to connect to the server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  /* Helpers */
  const Field = ({ id, label, name, type = 'text', placeholder, icon: Icon, required: req, extra }) => (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label} {req && <span className="required">*</span>}
      </label>
      <div className="auth-input-wrap">
        {Icon && (
          <span className="auth-input-icon">
            <Icon size={15} strokeWidth={2} />
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          className={`auth-input${!Icon ? ' auth-input-no-icon' : ''}${errors[name] ? ' has-error' : ''}`}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          autoComplete="off"
        />
        {extra}
      </div>
      {errors[name] && (
        <span className="auth-field-error">
          <AlertCircle size={12} /> {errors[name]}
        </span>
      )}
    </div>
  );

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
            Your Health,<br />
            <span>Always Connected</span>
          </h2>
          <p className="auth-left-desc">
            Create your free patient account and access AI-powered appointments, live bed
            availability, and unified medical records — across every hospital in the network.
          </p>
          <div className="auth-left-features">
            {LEFT_FEATURES.map(({ Icon, title, desc }) => (
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
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-subtitle">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>

          {alert && (
            <div className={`auth-alert ${alert.type}`}>
              {alert.type === 'success'
                ? <CheckCircle size={16} strokeWidth={2} />
                : <AlertCircle  size={16} strokeWidth={2} />}
              {alert.msg}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* ── Personal info ── */}
            <div className="auth-section-divider">Personal Info</div>

            <div className="auth-form-row">
              <Field
                id="reg-firstname" label="First Name" name="firstName"
                icon={User} placeholder="John" required
              />
              <Field
                id="reg-lastname" label="Last Name" name="lastName"
                icon={User} placeholder="Doe" required
              />
            </div>

            <div className="auth-form-row">
              <Field
                id="reg-phone" label="Phone" name="phone"
                icon={Phone} placeholder="+91 9876543210" required
              />
              {/* Gender select */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-gender">
                  Gender <span className="required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <select
                    id="reg-gender"
                    name="gender"
                    className={`auth-select auth-select-no-icon${errors.gender ? ' has-error' : ''}`}
                    value={form.gender}
                    onChange={handleChange}
                  >
                    {GENDER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                {errors.gender && (
                  <span className="auth-field-error">
                    <AlertCircle size={12} /> {errors.gender}
                  </span>
                )}
              </div>
            </div>

            <div className="auth-form-row">
              <Field
                id="reg-age" label="Age" name="age" type="number"
                placeholder="28"
              />
              {/* Blood group select */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-blood">Blood Group</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Droplets size={15} strokeWidth={2} />
                  </span>
                  <select
                    id="reg-blood"
                    name="bloodGroup"
                    className="auth-select"
                    value={form.bloodGroup}
                    onChange={handleChange}
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg || 'Select'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-address">Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <MapPin size={15} strokeWidth={2} />
                </span>
                <input
                  id="reg-address"
                  name="address"
                  type="text"
                  className="auth-input"
                  placeholder="123 Main St, City"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ── Account credentials ── */}
            <div className="auth-section-divider">Account Credentials</div>

            <Field
              id="reg-email" label="Email Address" name="email" type="email"
              icon={Mail} placeholder="you@example.com" required
            />

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">
                Password <span className="required">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Lock size={15} strokeWidth={2} />
                </span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className={`auth-input auth-input-has-right${errors.password ? ' has-error' : ''}`}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-input-icon-right"
                  onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <span className="auth-field-error"><AlertCircle size={12} /> {errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-confirm-password">
                Confirm Password <span className="required">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Lock size={15} strokeWidth={2} />
                </span>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showCpw ? 'text' : 'password'}
                  className={`auth-input auth-input-has-right${errors.confirmPassword ? ' has-error' : ''}`}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-input-icon-right"
                  onClick={() => setShowCpw(!showCpw)} aria-label="Toggle confirm password">
                  {showCpw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="auth-field-error"><AlertCircle size={12} /> {errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
