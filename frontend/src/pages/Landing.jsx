import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Landing = () => {
  const { user } = useAuth();

  // If user is already authenticated, direct them straight to the active dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container" style={{ marginTop: '60px', marginBottom: '100px' }}>
      {/* Hero Section */}
      <div className="ledger-section" style={{ borderBottom: '1.5px solid var(--ink)', paddingBottom: '48px', marginBottom: '48px' }}>
        <div className="ledger-left">
          <div className="section-eyebrow">Product Manifesto</div>
          <h1 className="section-title" style={{ fontSize: '3.6rem', marginBottom: '16px' }}>
            Bug Reproduction Tracker
          </h1>
          <p className="section-subtext" style={{ fontSize: '1.4rem', color: 'var(--stamp)', fontStyle: 'italic', fontWeight: 'bold', marginBottom: '16px' }}>
            “If it doesn't reproduce, it didn't happen.”
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '520px' }}>
            BRT rejects the chaos of modern SaaS dashboards. We treat bugs as physical evidence. No conversational ambiguity, no soft UI, no opinionated threads. Just structured records and verified proof.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <Link to="/register" className="btn-stamp" style={{ padding: '12px 24px' }}>
              Register Badge
            </Link>
            <Link to="/login" className="btn-stamp-secondary" style={{ padding: '12px 24px' }}>
              Authorize Access
            </Link>
          </div>
        </div>

        {/* Case File Card Preview */}
        <div className="case-card angled" style={{ padding: '24px', alignSelf: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge-pill-mono">EXHIBIT #1024</span>
            <span className="badge-pill-mono priority-critical">CRITICAL</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginTop: '16px' }}>
            Auth state resets on browser page refresh
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '8px' }}>
            LocalStorage token is cleared during window reload under Chromium runtimes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px dashed var(--paper-line)', paddingTop: '16px' }}>
            <span className="verdict-stamp verified" style={{ fontSize: '1rem', padding: '2px 8px' }}>
              VERIFIED (80.0%)
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>✓ ✓ ✕ ✓ ✓</span>
          </div>
        </div>
      </div>

      {/* Process Walkthrough (Minimal Words) */}
      <div style={{ marginBottom: '64px' }}>
        <div className="section-eyebrow" style={{ textAlign: 'center' }}>Operational Workflow</div>
        <h2 className="section-title" style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '8px' }}>
          The Forensic Ledger Process
        </h2>
        <p className="section-subtext" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          Four disciplined steps to transition software issues from assertions to archived resolutions.
        </p>

        <div className="exhibit-grid">
          {/* Step 1 */}
          <div className="exhibit-cell">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 'bold', color: 'var(--stamp)' }}>01</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '12px 0 8px 0' }}>File the Evidence</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: '1.5' }}>
              QA Testers submit a case file containing structured environment specs (OS, runtime, version) and ordered reproduction steps. No fuzzy explanations.
            </p>
          </div>

          {/* Step 2 */}
          <div className="exhibit-cell">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 'bold', color: 'var(--stamp)' }}>02</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '12px 0 8px 0' }}>Stamp Verification</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: '1.5' }}>
              Case officers follow the exact steps to attempt reproduction. They stamp the timeline with a binary verdict: <strong>REPRODUCED (✓)</strong> or <strong>FAILED (✕)</strong>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="exhibit-cell">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 'bold', color: 'var(--stamp)' }}>03</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '12px 0 8px 0' }}>Score calculated</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: '1.5' }}>
              The system calculates a reproducibility score: <code>(# Reproduced) / (Total Attempts)</code>. High scores verify the bug; low scores flag inconsistencies.
            </p>
          </div>
        </div>
        
        {/* Step 4 (Centered Below Grid) */}
        <div className="case-card flat" style={{ maxWidth: '600px', margin: '32px auto 0 auto', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--stamp)' }}>04</div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Resolve and Archive</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
              Assigned developers eliminate verified bugs, update statuses on the ledger, and QA archives the case file permanently. Ambiguity solved.
            </p>
          </div>
        </div>
      </div>

      {/* Ledger & API Section (Asymmetrical) */}
      <div className="ledger-section" style={{ borderTop: '1.5px solid var(--ink)', paddingTop: '48px', marginBottom: '64px' }}>
        <div className="ledger-left">
          <div className="section-eyebrow">API Integrity</div>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>Developer Mental Model</h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', marginTop: '12px' }}>
            We align product design with the machine logic beneath it. Every action, verification stamp, or score change corresponds to a strict RESTful endpoint. Developers inspect the code directly from the case files.
          </p>
        </div>

        <div className="ledger-right">
          <div style={{ color: '#888', marginBottom: '8px' }}># Verification Contract Query</div>
          <div style={{ color: 'var(--stamp)' }}>GET /api/bugs/1024/score</div>
          <div style={{ marginTop: '12px', whiteSpace: 'pre-wrap' }}>
{`{
  "bug": 1024,
  "score": 80.0,
  "attempts": 5,
  "successful_attempt": 4,
  "not_successful_attempts": 1,
  "status": "OPEN",
  "priority": "CRITICAL"
}`}
          </div>
        </div>
      </div>

      {/* CTA Resolution */}
      <div className="case-card flat" style={{ textAlign: 'center', padding: '48px', maxWidth: '700px', margin: '0 auto' }}>
        <div className="section-eyebrow">Resolution Moment</div>
        <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '12px' }}>
          Enforce Software Discipline
        </h2>
        <p className="section-subtext" style={{ fontSize: '1rem', marginBottom: '24px' }}>
          Transition your development process from subjective assertions to objective proof.
        </p>
        <Link to="/register" className="btn-stamp" style={{ padding: '12px 28px' }}>
          Open Your Ledger Index
        </Link>
      </div>
    </div>
  );
};
