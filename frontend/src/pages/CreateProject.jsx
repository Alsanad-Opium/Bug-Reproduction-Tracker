import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export const CreateProject = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only ADMINs are allowed by the backend to create projects
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const data = await api.createProject(name, description);
      setSuccess(`Project "${data.project.name}" initialized successfully under ID #${data.project.id}.`);
      setName('');
      setDescription('');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to file the project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '48px', marginBottom: '80px' }}>
      <div className="section-eyebrow">Project Initialization Protocol</div>
      <h2 className="section-title">New Project File</h2>
      <p className="section-subtext">Register a new software system under your administration ledger.</p>

      <div className="case-card flat">
        {error && (
          <div style={{ borderLeft: '4px solid var(--unverified)', backgroundColor: 'rgba(163, 58, 46, 0.08)', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '20px', color: 'var(--unverified)' }}>
            [ERROR] {error}
          </div>
        )}

        {success && (
          <div style={{ borderLeft: '4px solid var(--verified)', backgroundColor: 'rgba(61, 107, 76, 0.08)', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '20px', color: 'var(--verified)' }}>
            [SUCCESS] {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">System Name (Project Name)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Authentication Service V2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Scope Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="5"
              placeholder="Provide a detailed scope of the system under investigation, repositories involved, or build configurations..."
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-stamp"
              style={{ flex: '1' }}
            >
              {submitting ? 'Registering...' : 'File Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-stamp-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
