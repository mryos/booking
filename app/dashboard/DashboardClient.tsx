'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBookings } from '../lib/actions';
import { rooms } from '../lib/data';
import { CalendarDays, Clock, Users, BarChart3, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardClient({ initialStats }: { initialStats: any }) {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterRoom, setFilterRoom] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    getBookings().then(setAllBookings);
  }, []);

  const filtered = allBookings.filter((b) => {
    if (filterRoom !== 'all' && b.roomId !== filterRoom) return false;
    if (selectedDate && b.date !== selectedDate) return false;
    return b.status !== 'cancelled';
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getRoomName = (roomId: string) => rooms.find((r) => r.id === roomId)?.shortName || roomId;
  const getRoomColor = (roomId: string) => rooms.find((r) => r.id === roomId)?.color || '#359ed9';

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="dashboard-grid">
      {/* Bookings List */}
      <div>
        <div className="filter-bar">
          <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}>
            <option value="all">Semua Ruang</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.shortName}</option>)}
          </select>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>
          Jadwal Tanggal {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
        </h3>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={48} />
            <h3>Tidak ada booking</h3>
            <p>Belum ada booking untuk tanggal dan filter yang dipilih.</p>
          </div>
        ) : (
          <div className="schedule-list">
            {filtered.map((b) => (
              <div key={b.id} className="schedule-item">
                <div style={{ width: 4, height: 40, borderRadius: 4, background: getRoomColor(b.roomId), flexShrink: 0 }} />
                <div>
                  <div className="schedule-time">{b.startTime} - {b.endTime}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="schedule-title">{b.title}</div>
                  <div className="schedule-organizer">
                    <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {getRoomName(b.roomId)} • {b.organizer}
                  </div>
                </div>
                <span className={`schedule-status status-${b.status}`}>
                  {b.status === 'upcoming' ? 'Akan Datang' : b.status === 'in-progress' ? 'Berlangsung' : b.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mini Calendar */}
      <div style={{ background: 'var(--gray-50)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', height: 'fit-content' }}>
        <div className="calendar-header">
          <div className="calendar-nav">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
            <span className="calendar-month">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="calendar-grid">
          {dayLabels.map((d) => <div key={d} className="calendar-day-label">{d}</div>)}
          {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} className="calendar-day empty" />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            date.setHours(0, 0, 0, 0);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.getTime() === today.getTime();
            const isSelected = dateStr === selectedDate;

            return (
              <button key={day} className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(dateStr)}>
                {day}
              </button>
            );
          })}
        </div>

        {/* Room Legend */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--gray-200)' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 10 }}>Ruang Meeting</p>
          {rooms.map((r) => (
            <Link key={r.id} href={`/rooms/${r.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              {r.shortName}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
