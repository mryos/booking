'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBookings } from '../lib/actions';
import { rooms } from '../lib/data';
import { CalendarDays, Clock, Users, BarChart3, MapPin, ChevronLeft, ChevronRight, Info } from 'lucide-react';

function getWIBDate() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export default function DashboardClient({ initialStats }: { initialStats: any }) {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const todayStr = getWIBDate();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBookings().then(data => {
      setAllBookings(data);
      setIsLoading(false);
    });
  }, []);

  const getRoom = (roomId: string) => rooms.find((r) => r.id === roomId);
  
  // Filter bookings for the selected date
  const selectedDateBookings = allBookings.filter((b) => b.date === selectedDate && b.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Filter all upcoming bookings for the next 30 days
  const upcomingAgenda = allBookings.filter((b) => {
    const bDate = new Date(b.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    return bDate >= today && bDate <= thirtyDaysLater && b.status !== 'cancelled';
  }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="dashboard-layout fade-in">
      {/* Left Column: Agenda & Selection */}
      <div className="dashboard-main">
        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title">
              <CalendarDays size={20} />
              <h2>Jadwal Rapat: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</h2>
            </div>
          </div>

          {selectedDateBookings.length === 0 ? (
            <div className="empty-state-mini">
              <p>Tidak ada jadwal rapat untuk tanggal ini.</p>
              <Link href="/" className="btn btn-primary btn-sm">Buat Booking</Link>
            </div>
          ) : (
            <div className="agenda-grid">
              {selectedDateBookings.map((b) => {
                const room = getRoom(b.roomId);
                return (
                  <div key={b.id} className="agenda-card" style={{ borderLeft: `4px solid ${room?.color}` }}>
                    <div className="agenda-card-time">
                      <Clock size={14} />
                      <span>{b.startTime} - {b.endTime}</span>
                    </div>
                    <div className="agenda-card-content">
                      <h3>{b.title}</h3>
                      <div className="agenda-card-meta">
                        <span><Users size={12} /> {b.organizer}</span>
                        <span><MapPin size={12} /> {room?.shortName}</span>
                      </div>
                    </div>
                    <div className={`agenda-status status-${b.status}`}>
                      {b.status === 'in-progress' ? 'Sedang Berlangsung' : 'Akan Datang'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title">
              <BarChart3 size={20} />
              <h2>Agenda 30 Hari Ke Depan</h2>
            </div>
          </div>
          
          <div className="upcoming-timeline">
            {upcomingAgenda.length === 0 ? (
              <p className="text-muted">Belum ada agenda rapat dalam 30 hari ke depan.</p>
            ) : (
              upcomingAgenda.slice(0, 10).map((b) => {
                const room = getRoom(b.roomId);
                return (
                  <div key={b.id} className="timeline-item">
                    <div className="timeline-date">
                      <span className="day">{new Date(b.date + 'T00:00:00').getDate()}</span>
                      <span className="month">{monthNames[new Date(b.date).getMonth()].substring(0,3)}</span>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{b.title}</div>
                      <div className="timeline-details">
                        <span style={{ color: room?.color, fontWeight: 600 }}>{room?.shortName}</span> • {b.startTime}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {upcomingAgenda.length > 10 && (
              <div className="timeline-more">
                <p>+ {upcomingAgenda.length - 10} agenda lainnya...</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Mini Calendar & Stats */}
      <div className="dashboard-sidebar">
        <div className="calendar-widget">
          <div className="calendar-nav">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
            <span className="calendar-month">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
          </div>
          <div className="calendar-grid">
            {dayLabels.map((d) => <div key={d} className="calendar-day-label">{d}</div>)}
            {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} className="calendar-day empty" />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              
              // Safer date string construction to avoid timezone shifts
              const y = currentMonth.getFullYear();
              const m = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
              const d = day.toString().padStart(2, '0');
              const dateStr = `${y}-${m}-${d}`;
              
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const hasBooking = allBookings.some(b => b.date === dateStr && b.status !== 'cancelled');

              return (
                <button 
                  key={day} 
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${hasBooking ? 'has-booking' : ''}`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <span className="day-number">{day}</span>
                  {hasBooking && <span className="dot" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="room-status-widget">
          <h3>Status Ruangan Saat Ini</h3>
          <div className="room-status-list">
            {rooms.map(room => {
              const now = new Date();
              const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
              const isBusy = allBookings.some(b => 
                b.roomId === room.id && 
                b.date === todayStr && 
                timeStr >= b.startTime && 
                timeStr <= b.endTime &&
                b.status !== 'cancelled'
              );

              return (
                <div key={room.id} className="room-status-item">
                  <div className="room-color-dot" style={{ background: room.color }} />
                  <div className="room-info">
                    <div className="room-name">{room.shortName}</div>
                    <div className={`room-tag ${isBusy ? 'busy' : 'available'}`}>
                      {isBusy ? 'Terpakai' : 'Tersedia'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
