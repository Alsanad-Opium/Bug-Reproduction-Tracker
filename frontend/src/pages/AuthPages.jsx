import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '64px' }}>
      <div className="section-eyebrow">Authorization Protocol</div>
      <h2 className="section-title">Sign In</h2>
      <p className="section-subtext">Access the forensic ledger and verify reported logs.</p>

      <div className="case-card flat">
        {error && (
          <div
            style={{
              borderLeft: '4px solid var(--unverified)',
              backgroundColor: 'rgba(163, 58, 46, 0.08)',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              color: 'var(--unverified)'
            }}
          >
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. investigator@agency.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Security Key (Password)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-stamp"
            style={{ width: '100%', marginTop: '12px' }}
          >
            {submitting ? 'Authenticating...' : 'Authorize Access'}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        New officer? <Link to="/register">Register your badge</Link>
      </div>
    </div>
  );
};

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TESTER');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. The email or username might be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '48px' }}>
      <div className="section-eyebrow">Credential Filing</div>
      <h2 className="section-title">Register Badge</h2>
      <p className="section-subtext">File your credentials and assign your operating clearance.</p>

      <div className="case-card flat">
        {error && (
          <div
            style={{
              borderLeft: '4px solid var(--unverified)',
              backgroundColor: 'rgba(163, 58, 46, 0.08)',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              color: 'var(--unverified)'
            }}
          >
            [REGISTRATION_FAILED] {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Officer Name (Username)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Officer Smith"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Official Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. officer@agency.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Security Passphrase (Password)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Clearance Level (Role)</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: '10px' }}
            >
              <option value="TESTER">TESTER (Case Filer / Prover)</option>
              <option value="DEVELOPER">DEVELOPER (Case Resolver / Debugger)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-stamp"
            style={{ width: '100%', marginTop: '12px' }}
          >
            {submitting ? 'Registering...' : 'File Badge & Enter'}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        Already registered? <Link to="/login">Sign in here</Link>
      </div>
    </div>
  );
};
