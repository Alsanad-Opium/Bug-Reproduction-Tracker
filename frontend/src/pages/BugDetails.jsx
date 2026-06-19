import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export const BugDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [bug, setBug] = useState(null);
  const [project, setProject] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  
  // Interactive checklist states
  const [checkedSteps, setCheckedSteps] = useState({});
  // Stamp animation trigger state
  const [lastStampResult, setLastStampResult] = useState(null);
  const [showStampAnim, setShowStampAnim] = useState(false);

  const loadBugData = async () => {
    try {
      const bugDetails = await api.getBug(id);
      setBug(bugDetails);

      // Fetch project details for this bug to get owner and project name
      const proj = await api.getProject(bugDetails.project_id);
      setProject(proj);

      // Fetch attempts
      const attemptData = await api.getReproductionAttempts(id);
      setAttempts(attemptData.attempts || []);

      // Fetch score
      const scoreRes = await api.getReproductionScore(id);
      setScoreData(scoreRes);

      // Fetch comments
      const commentRes = await api.getComments(id);
      setComments(commentRes.comments || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load case files.');
    }
  };

  useEffect(() => {
    setLoading(true);
    loadBugData().finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setActionMessage('');
    try {
      const data = await api.updateBugStatus(id, newStatus);
      setBug(prev => ({ ...prev, status: data.bug.status }));
      setActionMessage(`Case status updated to ${newStatus}.`);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setActionMessage('');
    try {
      const data = await api.updateBugPriority(id, newPriority);
      setBug(prev => ({ ...prev, priority: data.bug.priority }));
      setActionMessage(`Case severity level updated to ${newPriority}.`);
    } catch (err) {
      setError(err.message || 'Failed to update severity.');
    }
  };

  const handleLogAttempt = async (result) => {
    setActionMessage('');
    setLastStampResult(result);
    setShowStampAnim(true);
    try {
      await api.logReproductionAttempt(id, result);
      
      // Reload attempts and score from backend
      const attemptData = await api.getReproductionAttempts(id);
      setAttempts(attemptData.attempts || []);

      const scoreRes = await api.getReproductionScore(id);
      setScoreData(scoreRes);

      // Reload bug to update the overall bug score in the main record
      const bugDetails = await api.getBug(id);
      setBug(prev => ({ ...prev, score: bugDetails.score, total_attempts: bugDetails.total_attempts }));

      setActionMessage(`Reproduction attempt registered: ${result.replace('_', ' ')}.`);
    } catch (err) {
      setError(err.message || 'Failed to register reproduction attempt.');
    } finally {
      // Clear animation trigger after it finishes
      setTimeout(() => {
        setShowStampAnim(false);
      }, 1000);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.addComment(id, newComment);
      setNewComment('');
      // Reload comments
      const commentRes = await api.getComments(id);
      setComments(commentRes.comments || []);
    } catch (err) {
      setError(err.message || 'Failed to add comment.');
    }
  };

  const handleCheckStep = (index) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '64px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>[RETRIEVING FORENSIC FILE #{id}...]</div>
      </div>
    );
  }

  if (error && !bug) {
    return (
      <div className="container" style={{ marginTop: '64px' }}>
        <div className="section-eyebrow">Case File Access Error</div>
        <h2 className="section-title">Case File Blocked</h2>
        <div style={{ borderLeft: '4px solid var(--unverified)', backgroundColor: 'rgba(163, 58, 46, 0.08)', padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--unverified)', marginBottom: '24px' }}>
          [ERROR] {error}
        </div>
        <Link to="/" className="btn-stamp-secondary">Return to Ledger Index</Link>
      </div>
    );
  }

  // Determine active lifecycle step
  // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const statusLabels = {
    'OPEN': 'Filed',
    'IN_PROGRESS': 'Attempted',
    'RESOLVED': 'Confirmed / Fixed',
    'CLOSED': 'Closed'
  };

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '80px' }}>
      {/* Back link */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>&larr; Return to Case Ledger</Link>
      </div>

      {actionMessage && (
        <div style={{ borderLeft: '4px solid var(--verified)', backgroundColor: 'rgba(61, 107, 76, 0.08)', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '20px', color: 'var(--verified)' }}>
          [SYSTEM_UPDATE] {actionMessage}
        </div>
      )}

      {/* Case Header Card */}
      <div className="case-card flat" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge-pill-mono" style={{ borderColor: 'var(--ink)' }}>CASE #{bug.id}</span>
              <span className="badge-pill-mono" style={{ backgroundColor: 'var(--ink)', color: 'var(--paper)' }}>
                {project ? project.name : `Project #${bug.project_id}`}
              </span>
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginTop: '16px', lineHeight: '1.1' }}>
              {bug.title}
            </h1>
          </div>

          {/* Verdict Stamp */}
          <div style={{ minWidth: '180px', textAlign: 'right', marginTop: '12px' }}>
            {bug.score !== null ? (
              <div className={`verdict-stamp ${bug.score >= 50 ? 'verified' : 'unverified'}`}>
                {bug.score >= 50 ? 'VERIFIED' : 'UNVERIFIED'}
              </div>
            ) : (
              <div className="verdict-stamp pending">
                UNTESTED
              </div>
            )}
          </div>
        </div>

        {/* Form controls for updates */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px', borderTop: '1px solid var(--paper-line)', paddingTop: '20px' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--ink-muted)' }}>
              Clearance Status
            </label>
            <select
              value={bug.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '0.85rem' }}
            >
              <option value="OPEN">OPEN (Filed)</option>
              <option value="IN_PROGRESS">IN PROGRESS (Investigating)</option>
              <option value="RESOLVED">RESOLVED (Fixed)</option>
              <option value="CLOSED">CLOSED (Archived)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--ink-muted)' }}>
              Severity Level
            </label>
            <select
              value={bug.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '0.85rem' }}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--ink-muted)' }}>
              Assigned Officer
            </label>
            <span style={{ fontWeight: 'bold' }}>
              {bug.assigned_to ? `User ID #${bug.assigned_to}` : 'UNASSIGNED'}
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--ink-muted)' }}>
              Filing Date
            </label>
            <span>{new Date(bug.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Lifecycle Progress */}
      <div className="lifecycle-tracker">
        {statuses.map((statusVal) => {
          const currentIndex = statuses.indexOf(bug.status);
          const stepIndex = statuses.indexOf(statusVal);
          
          let stepClass = '';
          if (statusVal === bug.status) {
            stepClass = 'active';
          } else if (stepIndex < currentIndex) {
            stepClass = 'completed';
          }

          return (
            <div key={statusVal} className={`lifecycle-step ${stepClass}`}>
              {statusLabels[statusVal]}
            </div>
          );
        })}
      </div>

      {/* Case Details and Steps */}
      <div className="ledger-section" style={{ gridTemplateColumns: '7fr 5fr', marginTop: '32px' }}>
        <div>
          <div className="section-eyebrow">Case Details</div>
          <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Exhibits & Context</h2>
          
          <div className="case-card flat" style={{ padding: '24px', marginTop: '16px' }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid var(--paper-line)', paddingBottom: '4px', marginBottom: '8px' }}>
              // NARRATIVE DESCRIPTION
            </h4>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', color: 'var(--ink)' }}>
              {bug.description || 'No description filed.'}
            </p>
          </div>

          {/* Expected vs Actual */}
          <div className="form-row-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
            <div className="case-card flat" style={{ padding: '16px' }}>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--verified)', borderBottom: '1px solid var(--paper-line)', paddingBottom: '4px', marginBottom: '8px' }}>
                ✓ EXPECTED BEHAVIOR
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
                {bug.expected_result || 'No expected behavior filed.'}
              </p>
            </div>
            <div className="case-card flat" style={{ padding: '16px' }}>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--unverified)', borderBottom: '1px solid var(--paper-line)', paddingBottom: '4px', marginBottom: '8px' }}>
                ✕ OBSERVED FAILURE
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
                {bug.actual_result || 'No failure output logged.'}
              </p>
            </div>
          </div>

          {/* Steps checklist */}
          <div className="case-card flat" style={{ padding: '24px', marginTop: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid var(--paper-line)', paddingBottom: '8px', marginBottom: '16px' }}>
              // REPRODUCTION CHECKS (STEPS TO REPRODUCE)
            </h4>
            
            {bug.steps_to_reproduce && bug.steps_to_reproduce.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {bug.steps_to_reproduce.map((step, idx) => (
                  <div key={idx} className="checklist-item">
                    <input
                      type="checkbox"
                      className="checklist-checkbox"
                      checked={!!checkedSteps[idx]}
                      onChange={() => handleCheckStep(idx)}
                      id={`step-${idx}`}
                    />
                    <label htmlFor={`step-${idx}`} style={{ cursor: 'pointer', textDecoration: checkedSteps[idx] ? 'line-through' : 'none', color: checkedSteps[idx] ? 'var(--ink-muted)' : 'var(--ink)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', marginRight: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>{idx + 1}.</span>
                      {step}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', color: 'var(--ink-muted)' }}>No structured steps provided for this report.</p>
            )}
          </div>
        </div>

        {/* Sidebar: Environment, Reproduction ledger, API output */}
        <div>
          <div className="section-eyebrow">Operating Scope</div>
          <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Metadata Specs</h2>

          {/* Environment Specs */}
          <div className="case-card flat" style={{ padding: '20px', marginTop: '16px' }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>
              // ENVIRO BADGES
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span className="badge-pill-mono" style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  OS: {bug.environment?.env_OS || 'UNSPECIFIED'}
                </span>
              </div>
              <div>
                <span className="badge-pill-mono" style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  RUNTIME: {bug.environment?.env_browser || 'UNSPECIFIED'}
                </span>
              </div>
              <div>
                <span className="badge-pill-mono" style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  VERSION: {bug.environment?.env_version || 'UNSPECIFIED'}
                </span>
              </div>
            </div>
          </div>

          {/* Reproduction Stamp Ledger */}
          <div className="case-card flat" style={{ padding: '24px', marginTop: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid var(--paper-line)', paddingBottom: '4px', marginBottom: '12px' }}>
              // REPRODUCIBILITY PROOF
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>
                  {bug.score !== null ? `${bug.score}%` : '0%'}
                </div>
                <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>REPRODUCIBILITY SCORE</div>
              </div>
              
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', textAlign: 'right' }}>
                  {bug.total_attempts}
                </div>
                <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>TOTAL ATTEMPTS LOGGED</div>
              </div>
            </div>

            {/* Verification Button Stamps */}
            <div style={{ marginTop: '20px', borderTop: '1px dashed var(--paper-line)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: '12px', fontWeight: 'bold' }}>
                // LOG ATTEMPT STAMP:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleLogAttempt('REPRODUCED')}
                  className="btn-stamp"
                  style={{ flex: '1', padding: '8px', fontSize: '0.75rem', boxShadow: '2px 2px 0 var(--verified)', backgroundColor: 'var(--verified)' }}
                >
                  ✓ REPRODUCED
                </button>
                <button
                  onClick={() => handleLogAttempt('NOT_REPRODUCED')}
                  className="btn-stamp"
                  style={{ flex: '1', padding: '8px', fontSize: '0.75rem', boxShadow: '2px 2px 0 var(--unverified)', backgroundColor: 'var(--unverified)' }}
                >
                  ✕ FAILED
                </button>
              </div>
            </div>

            {/* Attempts timeline stamps */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: '8px', color: 'var(--ink-muted)' }}>
                // ATTEMPT TIMELINE:
              </div>
              <div className="stamp-container">
                {attempts.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontStyle: 'italic', color: 'var(--ink-muted)' }}>No attempts registered yet.</span>
                ) : (
                  attempts.map((attempt) => (
                    <span
                      key={attempt.id}
                      className="badge-pill-mono"
                      style={{
                        backgroundColor: attempt.result === 'REPRODUCED' ? 'var(--verified)' : 'var(--unverified)',
                        color: 'var(--paper)',
                        borderColor: attempt.result === 'REPRODUCED' ? 'var(--verified)' : 'var(--unverified)',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '1px 6px'
                      }}
                      title={`Logged by User ID #${attempt.user_id} on ${new Date(attempt.created_at).toLocaleString()}`}
                    >
                      {attempt.result === 'REPRODUCED' ? '✓ REPRO' : '✕ FAIL'}
                    </span>
                  ))
                )}
              </div>
            </div>
            
            {/* Realtime fly-in stamp graphic during action */}
            {showStampAnim && lastStampResult && (
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '15%', 
                  left: '25%', 
                  zIndex: 200, 
                  pointerEvents: 'none' 
                }}
              >
                <div className={`verdict-stamp ${lastStampResult === 'REPRODUCED' ? 'verified' : 'unverified'}`} style={{ fontSize: '2.5rem', borderWidth: '5px' }}>
                  {lastStampResult === 'REPRODUCED' ? 'REPRODUCED ✓' : 'NOT REPROD ✕'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ledger & Simulated Machine Response */}
      <div className="ledger-section">
        <div className="ledger-left">
          <div className="section-eyebrow">Developer Alignment</div>
          <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Verification Contract</h2>
          <p>
            The REST API exposes clean, testable interfaces. By validating reproducibility scores directly on the ledger, we ensure that bugs are treated as verifiable state changes.
          </p>
        </div>

        <div className="ledger-right">
          <div style={{ color: '#888', marginBottom: '8px' }}># Shell Contract Query</div>
          <div style={{ color: 'var(--stamp)' }}>GET /api/bugs/{id}/score</div>
          <div style={{ marginTop: '12px', whiteSpace: 'pre-wrap' }}>
{JSON.stringify(
  scoreData || {
    "bug": parseInt(id),
    "attempts": attempts.length,
    "successful_attempt": attempts.filter(a => a.result === 'REPRODUCED').length,
    "not_successful_attempts": attempts.filter(a => a.result === 'NOT_REPRODUCED').length,
    "score": bug.score
  }, 
  null, 
  2
)}
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="case-card flat" style={{ marginTop: '56px', padding: '32px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', borderBottom: '1.5px solid var(--ink)', paddingBottom: '12px', marginBottom: '24px' }}>
          Forensic logs & Discussions
        </h3>

        {/* Existing Comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {comments.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              No comments filed in the log.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} style={{ borderBottom: '1px solid var(--paper-line)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge-pill-mono" style={{ borderColor: 'var(--stamp)', color: 'var(--stamp)' }}>
                    User ID #{comment.user_id}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--ink)', paddingLeft: '8px' }}>
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleAddComment}>
          <div className="form-group">
            <label htmlFor="comment">Submit Comment Log Entry</label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              rows="3"
              placeholder="Record notes, environment quirks, dependencies, or links to git commits..."
            ></textarea>
          </div>
          <button type="submit" className="btn-stamp" style={{ fontSize: '0.8rem' }}>
            File Comment Entry
          </button>
        </form>
      </div>
    </div>
  );
};
