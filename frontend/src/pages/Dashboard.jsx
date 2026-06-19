import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states for Admin/Tester
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        if (user.role === 'ADMIN' || user.role === 'TESTER') {
          // Fetch projects to create ID-to-Name map and for filtering
          const projData = await api.getProjects(1, 100);
          const projs = projData.projects || [];
          setProjects(projs);

          const mapping = {};
          projs.forEach((p) => {
            mapping[p.id] = p.name;
          });
          setProjectMap(mapping);

          // Fetch all bugs with filters
          const filters = {};
          if (statusFilter) filters.status = statusFilter;
          if (priorityFilter) filters.priority = priorityFilter;
          if (projectIdFilter) filters.project_id = projectIdFilter;

          const bugData = await api.getBugs(filters, page, 10);
          setBugs(bugData.bugs || []);
          setPagination(bugData.pagination || {});
        } else if (user.role === 'DEVELOPER') {
          // Developers load their assigned bugs by ID directly
          // Since they cannot call getBugs/getProjects
          const assignedIds = user.assigned_bugs || [];
          const fetchedBugs = [];

          // Also load projects if they own any, or just load the projects of assigned bugs
          const loadedProjects = {};

          for (const id of assignedIds) {
            try {
              const bugDetails = await api.getBug(id);
              fetchedBugs.push(bugDetails);

              // Fetch project details for this bug to get project name
              if (!loadedProjects[bugDetails.project_id]) {
                const proj = await api.getProject(bugDetails.project_id);
                loadedProjects[bugDetails.project_id] = proj.name;
              }
            } catch (err) {
              console.error(`Failed to load bug ID ${id}:`, err);
            }
          }

          setBugs(fetchedBugs);
          setProjectMap(loadedProjects);
        }
      } catch (err) {
        setError(err.message || 'Failed to load case files.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, statusFilter, priorityFilter, projectIdFilter, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPage(newPage);
    }
  };

  // Helper to format reproducibility score stamps
  const renderScoreStamp = (score, total) => {
    if (total === 0 || score === null) {
      return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>NO ATTEMPTS</span>;
    }
    const colorClass = score >= 50 ? 'var(--verified)' : 'var(--unverified)';
    return (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: colorClass }}>
        REPRO RATE: {score}% ({total} {total === 1 ? 'try' : 'tries'})
      </span>
    );
  };

  // Compute metrics for Admin/Tester
  const totalBugsCount = bugs.length;
  const activeCases = bugs.filter(b => b.status !== 'CLOSED').length;
  const reproducedCount = bugs.filter(b => b.score !== null && b.score > 0).length;
  const avgReproRate = bugs.length > 0 
    ? (bugs.reduce((acc, b) => acc + (b.score || 0), 0) / (bugs.filter(b => b.score !== null).length || 1)).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '64px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>[LOADING FORENSIC DATA...]</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '40px', marginBottom: '80px' }}>
      {/* Hero Section */}
      <div className="ledger-section" style={{ borderBottom: '1.5px solid var(--ink)', paddingBottom: '32px', marginBottom: '40px' }}>
        <div className="ledger-left">
          <div className="section-eyebrow">Evidence System Dashboard</div>
          <h1 className="section-title" style={{ fontSize: '3rem' }}>Bug Reproduction Tracker</h1>
          <p className="section-subtext" style={{ fontSize: '1.2rem', marginTop: '8px', color: 'var(--stamp)', fontStyle: 'italic', fontWeight: 'bold' }}>
            “If it doesn't reproduce, it didn't happen.”
          </p>
          <p style={{ marginTop: '8px' }}>
            BRT acts as a digital ledger. A bug report is not a conversation thread—it is cataloged software evidence requiring systematic verification.
          </p>
        </div>

        <div className="ledger-right" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--stamp)', marginBottom: '8px' }}>// SYSTEM STATE OVERVIEW</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>{activeCases}</div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>ACTIVE CASES</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'var(--verified)' }}>{avgReproRate}%</div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>AVG REPRO RATE</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--paper-line)', paddingTop: '12px', marginTop: '16px', fontSize: '0.8rem' }}>
            <span>OPERATING CLEARANCE: </span>
            <span style={{ color: 'var(--stamp)', fontWeight: 'bold' }}>{user.role}</span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ borderLeft: '4px solid var(--unverified)', backgroundColor: 'rgba(163, 58, 46, 0.08)', padding: '12px', fontFamily: 'var(--font-mono)', marginBottom: '20px', color: 'var(--unverified)' }}>
          [ERROR_LOADING_DATA] {error}
        </div>
      )}

      {/* Admin / Tester Controls & Lists */}
      {(user.role === 'ADMIN' || user.role === 'TESTER') ? (
        <>
          {/* Projects Registry Section */}
          <div style={{ marginBottom: '48px' }}>
            <div className="section-eyebrow">Projects Directory</div>
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Active Projects</h2>
            <p className="section-subtext" style={{ fontSize: '0.95rem' }}>Select a project to inspect its complete evidence registry.</p>
            
            {projects.length === 0 ? (
              <div className="case-card flat" style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ fontFamily: 'var(--font-mono)' }}>NO PROJECTS REGISTERED IN THE LEDGER.</p>
                {user.role === 'ADMIN' && (
                  <Link to="/create-project" className="btn-stamp" style={{ marginTop: '16px' }}>Initialize Project</Link>
                )}
              </div>
            ) : (
              <div className="exhibit-grid">
                {projects.map((proj) => (
                  <div key={proj.id} className="exhibit-cell">
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>PROJECT ID: #{proj.id}</div>
                    <h3 style={{ margin: '8px 0', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                      <Link to={`/project/${proj.id}`}>{proj.name}</Link>
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', minHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {proj.description || 'No description filed.'}
                    </p>
                    <div style={{ marginTop: '16px' }}>
                      <Link to={`/project/${proj.id}`} className="btn-stamp-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Open File</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Cases Section */}
          <div>
            <div className="section-eyebrow">Case File Index</div>
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Forensic Case Files</h2>

            {/* Filter Bar */}
            <div className="case-card flat" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <select value={projectIdFilter} onChange={(e) => { setProjectIdFilter(e.target.value); setPage(1); }} style={{ padding: '6px' }}>
                  <option value="">-- ALL PROJECTS --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: '6px' }}>
                  <option value="">-- ALL STATUSES --</option>
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} style={{ padding: '6px' }}>
                  <option value="">-- ALL PRIORITIES --</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              {(statusFilter || priorityFilter || projectIdFilter) && (
                <button 
                  onClick={() => { setStatusFilter(''); setPriorityFilter(''); setProjectIdFilter(''); setPage(1); }}
                  className="btn-stamp-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {bugs.length === 0 ? (
              <div className="case-card flat" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ fontFamily: 'var(--font-mono)' }}>NO EVIDENCE CONFORMS TO THE ACTIVE FILTERS.</p>
                <Link to="/report-bug" className="btn-stamp" style={{ marginTop: '16px' }}>File New Report</Link>
              </div>
            ) : (
              <div>
                {bugs.map((bug) => (
                  <div key={bug.id} className="case-card angled">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge-pill-mono" style={{ marginRight: '8px' }}>CASE #{bug.id}</span>
                        <span className="badge-pill-mono" style={{ marginRight: '8px', backgroundColor: 'var(--ink)', color: 'var(--paper)' }}>
                          {projectMap[bug.project_id] || `Project ID ${bug.project_id}`}
                        </span>
                        <span className={`badge-pill-mono priority-${bug.priority.toLowerCase()}`}>
                          {bug.priority}
                        </span>
                      </div>
                      <span className="badge-pill-mono" style={{ borderColor: 'var(--stamp)', color: 'var(--stamp)', fontWeight: 'bold' }}>
                        STATUS: {bug.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 style={{ marginTop: '12px', fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>
                      <Link to={`/bug/${bug.id}`}>{bug.title}</Link>
                    </h3>

                    <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', marginTop: '8px', minHeight: '36px' }}>
                      {bug.description ? (bug.description.substring(0, 150) + (bug.description.length > 150 ? '...' : '')) : 'No description provided.'}
                    </p>

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--paper-line)', paddingTop: '12px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                        FILED: {new Date(bug.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        {renderScoreStamp(bug.score, bug.total_attempts)}
                        <Link to={`/bug/${bug.id}`} className="btn-stamp-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px', marginLeft: '16px' }}>Examine Case</Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {pagination.total_pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px', alignItems: 'center', fontFamily: 'var(--font-mono)' }}>
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!pagination.has_prev}
                      className="btn-stamp-secondary"
                      style={{ padding: '6px 12px', opacity: pagination.has_prev ? 1 : 0.5 }}
                    >
                      &lt; Prev Page
                    </button>
                    <span>Page {pagination.page} of {pagination.total_pages}</span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!pagination.has_next}
                      className="btn-stamp-secondary"
                      style={{ padding: '6px 12px', opacity: pagination.has_next ? 1 : 0.5 }}
                    >
                      Next Page &gt;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Developer Case List (Assigned Bugs Only) */
        <div>
          <div className="section-eyebrow">Assigned Cases</div>
          <h2 className="section-title">My Assigned Forensic Files</h2>
          <p className="section-subtext">Verification and resolution files assigned to your badge.</p>

          {bugs.length === 0 ? (
            <div className="case-card flat" style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontFamily: 'var(--font-mono)' }}>NO ACTIVE CASES ASSIGNED TO YOUR BADGE.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '8px' }}>
                Contact a QA Tester or Admin to log reports and assign files to your name.
              </p>
            </div>
          ) : (
            <div>
              {bugs.map((bug) => (
                <div key={bug.id} className="case-card angled">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge-pill-mono" style={{ marginRight: '8px' }}>CASE #{bug.id}</span>
                      <span className="badge-pill-mono" style={{ marginRight: '8px', backgroundColor: 'var(--ink)', color: 'var(--paper)' }}>
                        {projectMap[bug.project_id] || `Project ID ${bug.project_id}`}
                      </span>
                      <span className={`badge-pill-mono priority-${bug.priority.toLowerCase()}`}>
                        {bug.priority}
                      </span>
                    </div>
                    <span className="badge-pill-mono" style={{ borderColor: 'var(--stamp)', color: 'var(--stamp)', fontWeight: 'bold' }}>
                      STATUS: {bug.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ marginTop: '12px', fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>
                    <Link to={`/bug/${bug.id}`}>{bug.title}</Link>
                  </h3>

                  <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', marginTop: '8px' }}>
                    {bug.description ? (bug.description.substring(0, 150) + (bug.description.length > 150 ? '...' : '')) : 'No description provided.'}
                  </p>

                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--paper-line)', paddingTop: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                      FILED: {new Date(bug.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      {renderScoreStamp(bug.score, bug.total_attempts)}
                      <Link to={`/bug/${bug.id}`} className="btn-stamp-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px', marginLeft: '16px' }}>Examine Case</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
