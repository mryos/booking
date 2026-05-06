'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBookingsByRoomAndDate } from '../../lib/actions';
import type { Booking, Room } from '../../lib/data';
import {
  CalendarDays, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function RoomDetailClient({ room }: { room: any }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await getBookingsByRoomAndDate(room.id, dateStr);
      setBookings(data);
    };
    fetchBookings();
  }, [selectedDate, room.id]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="calendar-section">
      <h2 className="section-title" style={{ marginBottom: 24 }}>Jadwal & Ketersediaan</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* Calendar */}
        <div style={{ background: 'var(--gray-50)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }}>
          <div className="calendar-header">
            <div className="calendar-nav">
              <button onClick={prevMonth}><ChevronLeft size={18} /></button>
              <span className="calendar-month">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button onClick={nextMonth}><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="calendar-grid">
            {dayLabels.map((d) => (
              <div key={d} className="calendar-day-label">{d}</div>
            ))}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              date.setHours(0, 0, 0, 0);
              const isToday = date.getTime() === today.getTime();
              const isSelected = date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
              const isPast = date < today;

              return (
                <button
                  key={day}
                  className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'disabled' : ''}`}
                  onClick={() => !isPast && setSelectedDate(date)}
                  disabled={isPast}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, color: 'var(--gray-800)' }}>
            Jadwal Tanggal {selectedDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
          </h3>
          {bookings.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <CalendarDays size={40} />
              <h3>Tidak ada booking</h3>
              <p>Ruang ini tersedia sepanjang hari.</p>
              <Link href={`/booking/${room.id}`} className="btn btn-primary btn-sm" style={{ marginTop: 16, background: room.color }}>
                Book Sekarang
              </Link>
            </div>
          ) : (
            <div className="schedule-list">
              {bookings.map((b) => (
                <div key={b.id} className="schedule-item">
                  <div>
                    <div className="schedule-time">{b.startTime} - {b.endTime}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="schedule-title">{b.title}</div>
                    <div className="schedule-organizer">oleh {b.organizer}</div>
                  </div>
                  <span className={`schedule-status status-${b.status}`}>
                    {b.status === 'upcoming' ? 'Akan Datang' : b.status === 'in-progress' ? 'Berlangsung' : b.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
