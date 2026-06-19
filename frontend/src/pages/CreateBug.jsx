import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export const CreateBug = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectParam = searchParams.get('project_id');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [envOS, setEnvOS] = useState('');
  const [envBrowser, setEnvBrowser] = useState('');
  const [envVersion, setEnvVersion] = useState('');
  
  // Reproduction steps state
  const [steps, setSteps] = useState(['']);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects(1, 100);
        const projs = data.projects || [];
        setProjects(projs);
        
        // Pre-select project if passed in query param
        if (projectParam) {
          setProjectId(projectParam);
        } else if (projs.length > 0) {
          setProjectId(projs[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load project files. Ensure you have proper clearance.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [projectParam]);

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleStepChange = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleRemoveStep = (index) => {
    const updated = steps.filter((_, i) => i !== index);
    setSteps(updated.length > 0 ? updated : ['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!projectId) {
      setError('Please select an active project scope.');
      setSubmitting(false);
      return;
    }

    // Filter out blank steps
    const cleanedSteps = steps.map(s => s.trim()).filter(s => s !== '');

    const bugData = {
      title,
      project_id: parseInt(projectId),
      description: description.trim() || null,
      priority,
      assigned_to: assignedTo ? parseInt(assignedTo) : null,
      steps_to_reproduce: cleanedSteps.length > 0 ? cleanedSteps : null,
      expected_result: expectedResult.trim() || null,
      actual_result: actualResult.trim() || null,
      environment_os: envOS.trim() || null,
      environment_browser: envBrowser.trim() || null,
      environment_version: envVersion.trim() || null,
    };

    try {
      const data = await api.createBug(bugData);
      
      // If validation error returned inside payload
      if (data.status === 'invalid') {
        throw new Error(data.message);
      }

      setSuccess(`Forensic Case File #${data.bug.id} registered successfully.`);
      setTimeout(() => {
        navigate(`/bug/${data.bug.id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to file the case. Ensure inputs are valid.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '64px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>[INITIALIZING CASE REGISTRY FORM...]</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '40px', marginBottom: '80px' }}>
      <div className="section-eyebrow">Case File Submission</div>
      <h2 className="section-title">Report New Case File</h2>
      <p className="section-subtext">Record structured software evidence. All assertions must be reproducible.</p>

      <div className="form-card">
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
          {/* Project & Title */}
          <div className="form-group">
            <label htmlFor="projectId">Target Project Scope</label>
            <select
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="" disabled>-- Select Project Scope --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>Project #{p.id} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Assertion / Title (Summarize the failure)</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Token validation fails on expired sessions with 500 error"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Narrative Description (Context)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Provide background, logs, context, or stack trace information..."
            ></textarea>
          </div>

          {/* Metadata Row: Priority, Assignee */}
          <div className="form-row-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label htmlFor="priority">Severity Level</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignedTo">Assignee Developer Badge ID</label>
              <input
                type="number"
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. 2 (DevUser ID)"
                min="1"
              />
            </div>
          </div>

          {/* Steps to Reproduce */}
          <div className="form-group">
            <label>Ordered Steps to Reproduce (Evidence Path)</label>
            <div className="form-steps-container">
              {steps.map((step, idx) => (
                <div key={idx} className="form-step-row">
                  <span className="form-step-num">{idx + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    required={idx === 0}
                    placeholder={`Step ${idx + 1} details...`}
                    style={{ flex: '1' }}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="btn-stamp-secondary btn-danger"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddStep}
              className="btn-stamp-secondary"
              style={{ marginTop: '12px', fontSize: '0.8rem', padding: '6px 12px' }}
            >
              + Add Ordered Step
            </button>
          </div>

          {/* Expected vs Actual */}
          <div className="form-row-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label htmlFor="expectedResult">Expected System Behavior</label>
              <textarea
                id="expectedResult"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                rows="3"
                placeholder="What should happen..."
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="actualResult">Observed Failure Behavior</label>
              <textarea
                id="actualResult"
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                rows="3"
                placeholder="What actually happens..."
              ></textarea>
            </div>
          </div>

          {/* Environment Details */}
          <div style={{ marginTop: '12px', borderTop: '1px dashed var(--paper-line)', paddingTop: '20px' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
              Operating Environment Metadata
            </label>
            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="envOS" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Operating System</label>
                <input
                  type="text"
                  id="envOS"
                  value={envOS}
                  onChange={(e) => setEnvOS(e.target.value)}
                  placeholder="e.g. macOS Sonoma / Windows 11"
                />
              </div>
              <div className="form-group">
                <label htmlFor="envBrowser" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Browser / Runtime</label>
                <input
                  type="text"
                  id="envBrowser"
                  value={envBrowser}
                  onChange={(e) => setEnvBrowser(e.target.value)}
                  placeholder="e.g. Chrome / Node v18"
                />
              </div>
              <div className="form-group">
                <label htmlFor="envVersion" style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Build / Version</label>
                <input
                  type="text"
                  id="envVersion"
                  value={envVersion}
                  onChange={(e) => setEnvVersion(e.target.value)}
                  placeholder="e.g. v2.4.1"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', borderTop: '1.5px solid var(--ink)', paddingTop: '24px' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-stamp"
              style={{ flex: '1' }}
            >
              {submitting ? 'Registering Case File...' : 'File Case and Sign'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
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
