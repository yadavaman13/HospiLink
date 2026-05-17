import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  User,
  Lock,
  Eye,
  EyeOff,
  BadgeInfo,
  Layers3,
  ArrowRight,
  ShieldCheck,
  Clock3,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';
import '../styles/auth.css';

const LEFT_FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Controlled Onboarding',
    desc: 'Hospital registration is reviewed before the account becomes active.',
  },
  {
    Icon: Building2,
    title: 'Auto Hospital ID',
    desc: 'Each hospital receives a unique network ID after submission.',
  },
  {
    Icon: Clock3,
    title: 'Admin Credentials',
    desc: 'The hospital admin gets credentials by email during registration.',
  },
];

const INITIAL_FORM = {
  hospitalName: '',
  logoUrl: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  website: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  adminGender: '',
  adminPassword: '',
  departments: '',
};

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

function RegistrationField({ id, label, name, type = 'text', placeholder, icon: Icon, required = false, extra, value, onChange, error }) {
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>
        {label} {required && <span className="required">*</span>}
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
          className={`auth-input${!Icon ? ' auth-input-no-icon' : ''}${error ? ' has-error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
        {extra}
      </div>
      {error && (
        <span className="auth-field-error">
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  );
}

export default function HospitalRegistrationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (alert) setAlert(null);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.hospitalName.trim()) nextErrors.hospitalName = 'Hospital name is required.';
    if (!form.street.trim()) nextErrors.street = 'Street address is required.';
    if (!form.city.trim()) nextErrors.city = 'City is required.';
    if (!form.state.trim()) nextErrors.state = 'State is required.';
    if (!form.zip.trim()) nextErrors.zip = 'ZIP code is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Hospital phone is required.';
    if (!form.adminFirstName.trim()) nextErrors.adminFirstName = 'Admin first name is required.';
    if (!form.adminLastName.trim()) nextErrors.adminLastName = 'Admin last name is required.';
    if (!form.adminEmail.trim()) nextErrors.adminEmail = 'Admin email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) nextErrors.adminEmail = 'Enter a valid email address.';
    if (!form.adminPhone.trim()) nextErrors.adminPhone = 'Admin phone is required.';
    if (!form.adminGender) nextErrors.adminGender = 'Select admin gender.';
    if (form.adminPassword && form.adminPassword.length < 6) nextErrors.adminPassword = 'Password must be at least 6 characters.';

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const departments = form.departments
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const payload = {
        name: form.hospitalName,
        logoUrl: form.logoUrl || undefined,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
        contact: {
          phone: form.phone,
          website: form.website || undefined,
        },
        admin: {
          firstName: form.adminFirstName,
          lastName: form.adminLastName,
          email: form.adminEmail,
          phone: form.adminPhone,
          gender: form.adminGender,
          ...(form.adminPassword ? { password: form.adminPassword } : {}),
        },
        departments,
      };

      const { data } = await apiClient.post('/hospitals/register', payload);

      setAlert({
        type: 'success',
        msg: `Hospital submitted successfully. Your hospital ID is ${data.hospital?.hospitalId || 'pending'} and admin credentials were emailed.`,
      });

      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Hospital registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <a href="/" className="auth-left-logo">
          <div className="auth-left-logo-icon">
            <Activity size={18} strokeWidth={2.5} color="#fff" />
          </div>
          <span className="auth-left-logo-text">Hospi<span>Link</span></span>
        </a>

        <div className="auth-left-content">
          <h2 className="auth-left-tagline">
            Bring your hospital,<br />
            <span>into the network</span>
          </h2>
          <p className="auth-left-desc">
            Register your hospital with structured admin details, contact information, and department overview.
            The platform will review and activate your account.
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

      <div className="auth-panel-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-form-title">Hospital registration</h1>
            <p className="auth-form-subtitle">
              Register your hospital and admin account. Already have a login? <Link to="/login">Sign in</Link>
            </p>
          </div>

          {alert && (
            <div className={`auth-alert ${alert.type}`}>
              {alert.type === 'success' ? <CheckCircle size={16} strokeWidth={2} /> : <AlertCircle size={16} strokeWidth={2} />}
              {alert.msg}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-section-divider">Hospital Info</div>

            <RegistrationField id="hospital-name" label="Hospital Name" name="hospitalName" icon={Building2} placeholder="Apollo Care Center" required value={form.hospitalName} onChange={handleChange} error={errors.hospitalName} />
            <RegistrationField id="hospital-logo" label="Logo URL" name="logoUrl" icon={BadgeInfo} placeholder="https://..." value={form.logoUrl} onChange={handleChange} error={errors.logoUrl} />

            <div className="auth-form-row">
              <RegistrationField id="hospital-street" label="Street" name="street" icon={MapPin} placeholder="123 Medical Lane" required value={form.street} onChange={handleChange} error={errors.street} />
              <RegistrationField id="hospital-city" label="City" name="city" icon={MapPin} placeholder="Hyderabad" required value={form.city} onChange={handleChange} error={errors.city} />
            </div>

            <div className="auth-form-row">
              <RegistrationField id="hospital-state" label="State" name="state" icon={MapPin} placeholder="Telangana" required value={form.state} onChange={handleChange} error={errors.state} />
              <RegistrationField id="hospital-zip" label="ZIP Code" name="zip" icon={MapPin} placeholder="500001" required value={form.zip} onChange={handleChange} error={errors.zip} />
            </div>

            <div className="auth-form-row">
              <RegistrationField id="hospital-phone" label="Hospital Phone" name="phone" icon={Phone} placeholder="040-1234-5678" required value={form.phone} onChange={handleChange} error={errors.phone} />
              <RegistrationField id="hospital-website" label="Website" name="website" icon={Globe} placeholder="https://hospital.com" value={form.website} onChange={handleChange} error={errors.website} />
            </div>

            <div className="auth-section-divider">Admin Info</div>

            <div className="auth-form-row">
              <RegistrationField id="admin-firstname" label="First Name" name="adminFirstName" icon={User} placeholder="Arjun" required value={form.adminFirstName} onChange={handleChange} error={errors.adminFirstName} />
              <RegistrationField id="admin-lastname" label="Last Name" name="adminLastName" icon={User} placeholder="Mehta" required value={form.adminLastName} onChange={handleChange} error={errors.adminLastName} />
            </div>

            <div className="auth-form-row">
              <RegistrationField id="admin-email" label="Email" name="adminEmail" icon={Mail} placeholder="admin@hospital.com" required value={form.adminEmail} onChange={handleChange} error={errors.adminEmail} />
              <RegistrationField id="admin-phone" label="Phone" name="adminPhone" icon={Phone} placeholder="+91 9876543210" required value={form.adminPhone} onChange={handleChange} error={errors.adminPhone} />
            </div>

            <div className="auth-form-row">
              <div className="auth-field">
                <label className="auth-label" htmlFor="admin-gender">
                  Gender <span className="required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <select
                    id="admin-gender"
                    name="adminGender"
                    className={`auth-select auth-select-no-icon${errors.adminGender ? ' has-error' : ''}`}
                    value={form.adminGender}
                    onChange={handleChange}
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                {errors.adminGender && (
                  <span className="auth-field-error"><AlertCircle size={12} /> {errors.adminGender}</span>
                )}
              </div>

              <RegistrationField
                id="admin-password"
                label="Admin Password"
                name="adminPassword"
                type="password"
                icon={Lock}
                placeholder="Leave blank to auto-generate"
                value={form.adminPassword}
                onChange={handleChange}
                error={errors.adminPassword}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="departments">
                Departments <span className="required">*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Layers3 size={15} strokeWidth={2} />
                </span>
                <textarea
                  id="departments"
                  name="departments"
                  className="auth-textarea auth-input-has-right"
                  placeholder="Cardiology, Neurology, General Medicine"
                  value={form.departments}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Submit registration <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
