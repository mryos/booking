import { getTodayStats } from '../lib/actions';
import DashboardClient from './DashboardClient';
import { CalendarDays, Clock, Users, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getTodayStats();

  return (
    <main className="dashboard fade-in">
      <h1>Dashboard</h1>
      <p className="subtitle">Overview booking ruang rapat</p>

      {/* Quick Stats */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><CalendarDays size={22} /></div>
          <div className="stat-value">{stats.todayTotal}</div>
          <div className="stat-label">Booking Hari Ini</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Clock size={22} /></div>
          <div className="stat-value">{stats.activeNow}</div>
          <div className="stat-label">Sedang Berlangsung</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={22} /></div>
          <div className="stat-value">{stats.upcoming}</div>
          <div className="stat-label">Akan Datang</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><BarChart3 size={22} /></div>
          <div className="stat-value">{stats.totalAll}</div>
          <div className="stat-label">Total Booking</div>
        </div>
      </div>

      <DashboardClient initialStats={stats} />
    </main>
  );
}
