/**
 * V12.0 AdminDashboard simülasyonu — localStorage üzerinden bugünkü lead sayısı ve komisyon (Lead × 50 TL).
 */
import { useState, useEffect } from 'react';
import { getTodayLeadStats } from '../services/LeadService';

export default function AdminDashboard({ onClose }) {
  const [stats, setStats] = useState({ count: 0, commission: 0 });

  useEffect(() => {
    setStats(getTodayLeadStats());
    const id = setInterval(() => setStats(getTodayLeadStats()), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="admin-dashboard-overlay"
      role="dialog"
      aria-label="Yönetim paneli"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="admin-dashboard-panel" onClick={(e) => e.stopPropagation()}>
        <h2 className="admin-dashboard-title">Yönetim (Simülasyon)</h2>
        <div className="admin-dashboard-stats">
          <div className="admin-stat">
            <span className="admin-stat-label">Bugünkü yönlendirme (lead)</span>
            <span className="admin-stat-value">{stats.count}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Kazanılan komisyon (Lead × 50 TL)</span>
            <span className="admin-stat-value">{stats.commission} TL</span>
          </div>
        </div>
        <button type="button" className="btn-cta overlay-close" onClick={onClose}>
          Kapat
        </button>
      </div>
    </div>
  );
}
