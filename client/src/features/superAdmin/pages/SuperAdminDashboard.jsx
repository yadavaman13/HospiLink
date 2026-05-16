import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import StatsGrid from '../components/StatsGrid';
import PendingHospitals from '../components/PendingHospitals';
import { SuperAdminProvider, useSuperAdminContext } from '../superAdmin.context.jsx';
import { Building2, Activity, Clock3, ShieldCheck, AlertTriangle, ChevronRight, RefreshCcw, Workflow } from 'lucide-react';
import '../styles/super-admin.css';

function Inner() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const sa = useSuperAdminContext();
  const totalPending = sa.pending?.length || 0;
  const activeHospitals = useMemo(() => {
    return (sa.hospitals || []).filter((h) => String(h.status).toLowerCase() === 'active').length;
  }, [sa.hospitals]);

  useEffect(() => { sa.loadOverview(); sa.loadPending(); sa.loadAllHospitals(); }, []);

  const overviewStats = sa.overview?.totals || {};

  return (
    <div className="dd-shell">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="dd-main">
        <Topbar admin={{ firstName: 'Super', lastName: 'Admin' }} />
        <div className="dd-content super-content">
          <section className="super-hero">
            <div>
              <div className="super-kicker">Platform control room</div>
              <h1>Minimal oversight for the full hospital network.</h1>
              <p>
                Review registrations, track traffic, and keep the platform healthy from one uncluttered workspace.
              </p>
            </div>

            <div className="super-hero-actions">
              <button type="button" className="super-pill-btn" onClick={() => { sa.loadOverview(); sa.loadPending(); sa.loadAllHospitals(); }}>
                <RefreshCcw size={15} /> Refresh
              </button>
              <button type="button" className="super-pill-btn primary" onClick={() => setActiveTab('approvals')}>
                Review approvals <ChevronRight size={15} />
              </button>
            </div>
          </section>

          <div className="super-meta-strip">
            <div className="super-meta-item"><Building2 size={16} /> <span>{overviewStats.hospitals ?? '-'} hospitals</span></div>
            <div className="super-meta-item"><ShieldCheck size={16} /> <span>{activeHospitals} active</span></div>
            <div className="super-meta-item"><AlertTriangle size={16} /> <span>{totalPending} pending</span></div>
            <div className="super-meta-item"><Activity size={16} /> <span>{sa.overview?.dailyTraffic?.length || 7} day traffic</span></div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="super-dashboard-grid">
              <div className="super-dashboard-left">
                <StatsGrid totals={sa.overview?.totals} />

                <div className="dd-card super-panel">
                  <div className="dd-card-header">
                    <div>
                      <div className="dd-card-title">Daily Traffic</div>
                      <div className="super-card-subtitle">Recent platform activity and usage rhythm</div>
                    </div>
                  </div>
                  <div className="super-traffic-list">
                    {(sa.overview?.dailyTraffic || []).slice(-7).map((item) => (
                      <div className="super-traffic-row" key={item.date}>
                        <div className="super-traffic-date">{item.date}</div>
                        <div className="super-traffic-bar-wrap">
                          <div className="super-traffic-bar" style={{ width: `${Math.min(100, (item.count || 0) * 12)}%` }} />
                        </div>
                        <div className="super-traffic-count">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="super-dashboard-right">
                <div className="dd-card super-panel">
                  <div className="dd-card-header">
                    <div>
                      <div className="dd-card-title">Hospital insights</div>
                      <div className="super-card-subtitle">Compact per-hospital snapshot</div>
                    </div>
                  </div>
                  <div className="super-insights-list">
                    {(sa.overview?.hospitalInsights || []).slice(0, 5).map((hospital) => (
                      <div className="super-insight-item" key={hospital.hospitalId}>
                        <div>
                          <div className="super-insight-title">{hospital.name}</div>
                          <div className="super-insight-meta">{hospital.city || 'Unknown city'} · {hospital.hospitalId}</div>
                        </div>
                        <div className="super-insight-stats">
                          <span>{hospital.patients} patients</span>
                          <span>{hospital.doctors} doctors</span>
                          <span>{hospital.appointments} appts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dd-card super-panel">
                  <div className="dd-card-header">
                    <div>
                      <div className="dd-card-title">Review queue</div>
                      <div className="super-card-subtitle">Pending registrations requiring action</div>
                    </div>
                  </div>
                  <div className="super-review-queue-mini">
                    <div className="super-queue-line"><span>Pending requests</span><strong>{totalPending}</strong></div>
                    <div className="super-queue-line"><span>Last refreshed</span><strong>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
                    <button type="button" className="super-inline-link" onClick={() => setActiveTab('approvals')}>
                      Go to approvals <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="dd-card super-panel">
              <div className="dd-card-header">
                <div>
                  <div className="dd-card-title">Pending hospitals</div>
                  <div className="super-card-subtitle">Select a request to review and approve or reject it</div>
                </div>
              </div>
              <PendingHospitals list={sa.pending} onApprove={(id) => sa.approve(id)} onReject={(id, reason) => sa.reject(id, reason)} />
            </div>
          )}

          {activeTab === 'hospitals' && (
            <div className="dd-card super-panel">
              <div className="dd-card-header">
                <div>
                  <div className="dd-card-title">All hospitals</div>
                  <div className="super-card-subtitle">Network overview with status and quick counts</div>
                </div>
              </div>
              <div className="super-hospital-list">
                {(sa.hospitals || []).map(h => (
                  <div key={h.hospitalId} className="super-hospital-card">
                    <div>
                      <div className="super-hospital-title">{h.name}</div>
                      <div className="super-hospital-meta">{h.city || h.address?.city || 'Unknown city'} · {h.hospitalId}</div>
                    </div>
                    <span className={`super-status-pill ${String(h.status).toLowerCase()}`}>{h.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="dd-card super-panel">
              <div className="dd-card-header">
                <div>
                  <div className="dd-card-title">Insights</div>
                  <div className="super-card-subtitle">Reserved for deeper analytics and trends</div>
                </div>
              </div>
              <div className="super-empty-state compact">
                <Workflow size={26} />
                <h4>Insights workspace</h4>
                <p>Use this area for charts, SLA indicators, and anomaly detection next.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="dd-card super-panel">
              <div className="dd-card-header">
                <div>
                  <div className="dd-card-title">Settings</div>
                  <div className="super-card-subtitle">Profile and platform configuration</div>
                </div>
              </div>
              <div className="super-empty-state compact">
                <ShieldCheck size={26} />
                <h4>Settings panel</h4>
                <p>Keep this space minimal for profile and platform controls.</p>
              </div>
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="dd-card super-panel">
              <div className="dd-card-header">
                <div>
                  <div className="dd-card-title">Rejected hospitals</div>
                  <div className="super-card-subtitle">Requests that were declined by the super admin</div>
                </div>
              </div>
              <div className="super-empty-state compact">
                <AlertTriangle size={26} />
                <h4>No rejected items loaded</h4>
                <p>This section can later show audit history and rejection notes.</p>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && activeTab !== 'approvals' && activeTab !== 'hospitals' && activeTab !== 'insights' && activeTab !== 'settings' && activeTab !== 'rejected' && (
            <div className="dd-empty">Select a section from the left to begin.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboardWrapper() {
  return (
    <SuperAdminProvider>
      <Inner />
    </SuperAdminProvider>
  );
}
