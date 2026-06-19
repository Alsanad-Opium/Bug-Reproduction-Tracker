import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode states (ADMIN only)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadProject = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProject(id);
      setProject(data);
      setEditName(data.name);
      setEditDescription(data.description || '');
    } catch (err) {
      setError(err.message || 'Failed to load project files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSubmitting(true);
    try {
      const updated = await api.updateProject(id, editName, editDescription);
      setProject(prev => ({
        ...prev,
        name: updated.project.name,
        description: updated.project.description
      }));
      setIsEditing(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update project.');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '64px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>[LOADING PROJECT FILE #{id}...]</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container" style={{ marginTop: '64px' }}>
        <div className="section-eyebrow">Load Failure</div>
        <h2 className="section-title">Case File Missing</h2>
        <div style={{ borderLeft: '4px solid var(--unverified)', backgroundColor: 'rgba(163, 58, 46, 0.08)', padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--unverified)', marginBottom: '24px' }}>
          [ERROR] {error || 'Project file not found.'}
        </div>
        <Link to="/" className="btn-stamp-secondary">Back to Index</Link>
      </div>
    );
  }

  const bugs = project.bugs || [];

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid var(--ink)', paddingBottom: '24px', marginBottom: '32px' }}>
        <div>
          <div className="section-eyebrow">Project Registry File #{project.id}</div>
          
          {isEditing ? (
            <form onSubmit={handleUpdateProject} style={{ marginTop: '12px', width: '100%', maxWidth: '600px' }}>
              {editError && <div style={{ color: 'var(--unverified)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '12px' }}>[ERR] {editError}</div>}
              <div className="form-group">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{ fontSize: '1.6rem', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}
                />
              </div>
              <div className="form-group">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows="4"
                  style={{ fontSize: '0.95rem' }}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={editSubmitting} className="btn-stamp" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  {editSubmitting ? 'Saving...' : 'Save File'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-stamp-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="section-title" style={{ fontSize: '2.5rem' }}>{project.name}</h1>
              <p style={{ marginTop: '12px', fontSize: '1.05rem', whiteSpace: 'pre-wrap', color: 'var(--ink-muted)' }}>
                {project.description || 'No description logged.'}
              </p>
            </>
          )}

          <div style={{ marginTop: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
            <span>FILED: {new Date(project.created_at).toLocaleDateString()}</span>
            <span style={{ marginLeft: '16px' }}>OWNER ID: #{project.owner_id}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <Link to={`/report-bug?project_id=${project.id}`} className="btn-stamp" style={{ fontSize: '0.9rem' }}>
            + Log Case File
          </Link>
          {user.role === 'ADMIN' && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn-stamp-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              Edit Registry
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="section-eyebrow">Evidence Catalog</div>
        <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Cataloged Evidence Grid</h2>
        <p className="section-subtext" style={{ fontSize: '0.95rem' }}>
          Physical cases reported and verified under this registry scope.
        </p>

        {bugs.length === 0 ? (
          <div className="case-card flat" style={{ textAlign: 'center', padding: '48px', marginTop: '24px' }}>
            <p style={{ fontFamily: 'var(--font-mono)' }}>NO EVIDENCE REGISTERED UNDER THIS SCOPE.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '8px' }}>
              Bugs reported here will appear in the strict table format below.
            </p>
          </div>
        ) : (
          <div className="exhibit-grid">
            {bugs.map((bug) => {
              // Priority styling
              let priorityColor = 'var(--ink-muted)';
              if (bug.priority === 'CRITICAL') priorityColor = 'var(--unverified)';
              else if (bug.priority === 'HIGH') priorityColor = 'var(--stamp)';
              else if (bug.priority === 'MEDIUM') priorityColor = 'var(--ink)';

              return (
                <div key={bug.id} className="exhibit-cell" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      <span className="badge-pill-mono">CASE #{bug.id}</span>
                      <span style={{ color: priorityColor, fontWeight: 'bold' }}>{bug.priority}</span>
                    </div>

                    <h3 style={{ margin: '12px 0 8px 0', fontFamily: 'var(--font-display)', fontSize: '1.3rem', lineHeight: '1.2' }}>
                      <Link to={`/bug/${bug.id}`}>{bug.title}</Link>
                    </h3>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--stamp)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      STATUS: {bug.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--paper-line)', paddingTop: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                      {bug.score !== null ? `REPRO: ${bug.score}%` : 'NO ATTEMPTS'}
                    </div>
                    <Link to={`/bug/${bug.id}`} className="btn-stamp-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                      Examine
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
