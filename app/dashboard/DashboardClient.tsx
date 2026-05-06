'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getBookings } from '../lib/actions';
import { rooms, timeSlots } from '../lib/data';
import { createClient } from '@supabase/supabase-js';
import { CalendarDays, Clock, Users, BarChart3, MapPin, ChevronLeft, ChevronRight, List, LayoutGrid } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// FUNGSI STANDAR WIB (Asia/Jakarta)
function getWIBDate() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

function getWIBTime() {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return formatter.format(new Date()).replace('.', ':');
}

export default function DashboardClient({ initialStats }: { initialStats: any }) {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const todayStr = getWIBDate();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'timeline' | 'agenda'>('timeline');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLatestData = useCallback(async () => {
    const data = await getBookings();
    setAllBookings(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLatestData();
    if (supabase) {
      const channel = supabase.channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
          fetchLatestData();
        }).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [fetchLatestData]);

  const getRoom = (roomId: string) => rooms.find((r) => r.id === roomId);
  const selectedDateBookings = allBookings.filter((b) => b.date === selectedDate && b.status !== 'cancelled');
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const workingHours = timeSlots.filter((_, i) => i % 2 === 0);

  return (
    <div className="dashboard-layout fade-in">
      <div className="dashboard-main">
        <div className="view-switcher" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button className={viewMode === 'timeline' ? 'active' : ''} onClick={() => setViewMode('timeline')}>
            <LayoutGrid size={18} /> Timeline Visual
          </button>
          <button className={viewMode === 'agenda' ? 'active' : ''} onClick={() => setViewMode('agenda')}>
            <List size={18} /> Daftar Agenda
          </button>
        </div>

        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title">
              <CalendarDays size={20} />
              <h2>Jadwal: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</h2>
            </div>
          </div>

          {viewMode === 'timeline' ? (
            <div className="timeline-container">
              <div className="timeline-header">
                <div className="room-col-header">Ruangan</div>
                <div className="time-cols">
                  {workingHours.map(hour => <div key={hour} className="time-label">{hour}</div>)}
                </div>
              </div>
              <div className="timeline-body">
                {rooms.map(room => (
                  <div key={room.id} className="timeline-row">
                    <div className="room-name-col" style={{ borderLeft: `4px solid ${room.color}` }}>{room.shortName}</div>
                    <div className="room-track">
                      {allBookings.filter(b => b.roomId === room.id && b.date === selectedDate && b.status !== 'cancelled').map(b => {
                        const startIdx = timeSlots.indexOf(b.startTime);
                        const endIdx = timeSlots.indexOf(b.endTime);
                        const duration = endIdx - startIdx;
                        const left = (startIdx / (timeSlots.length - 1)) * 100;
                        const width = (duration / (timeSlots.length - 1)) * 100;
                        return (
                          <div key={b.id} className="booking-block" 
                               style={{ left: `${left}%`, width: `${width}%`, background: room.color }}
                               title={`${b.title} (${b.startTime} - ${b.endTime})`}>
                            <span className="block-title">{b.title}</span>
                          </div>
                        );
                      })}
                      {workingHours.map(h => <div key={h} className="grid-line" />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            selectedDateBookings.length === 0 ? (
              <div className="empty-state-mini"><p>Tidak ada rapat untuk tanggal ini.</p></div>
            ) : (
              <div className="agenda-grid">
                {selectedDateBookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((b) => {
                  const room = getRoom(b.roomId);
                  return (
                    <div key={b.id} className="agenda-card" style={{ borderLeft: `4px solid ${room?.color}` }}>
                      <div className="agenda-card-time"><span>{b.startTime} - {b.endTime}</span></div>
                      <div className="agenda-card-content">
                        <h3>{b.title}</h3>
                        <div className="agenda-card-meta"><span>{b.organizer}</span> • <span>{room?.shortName}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title"><BarChart3 size={20} /> <h2>Agenda Mendatang</h2></div>
          </div>
          <div className="upcoming-timeline">
            {allBookings.filter(b => {
              const bDate = b.date;
              return bDate >= todayStr && b.status !== 'cancelled';
            }).sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).slice(0, 5).map(b => {
              const room = getRoom(b.roomId);
              return (
                <div key={b.id} className="timeline-item">
                  <div className="timeline-date">
                    <span className="day">{b.date.split('-')[2]}</span>
                    <span className="month">{monthNames[parseInt(b.date.split('-')[1]) - 1].substring(0,3)}</span>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">{b.title}</div>
                    <div className="timeline-details"><span style={{ color: room?.color }}>{room?.shortName}</span> • {b.startTime}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="dashboard-sidebar">
        <div className="calendar-widget">
          <div className="calendar-nav">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><ChevronLeft size={18} /></button>
            <span className="calendar-month">{monthNames[currentMonth.getMonth()]}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><ChevronRight size={18} /></button>
          </div>
          <div className="calendar-grid">
            {dayLabels.map(d => <div key={d} className="calendar-day-label">{d}</div>)}
            {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} className="calendar-day empty" />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dNum = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth()+1).toString().padStart(2,'0')}-${dNum.toString().padStart(2,'0')}`;
              const hasBooking = allBookings.some(b => b.date === dateStr && b.status !== 'cancelled');
              return (
                <button key={dNum} className={`calendar-day ${dateStr === selectedDate ? 'selected' : ''} ${dateStr === todayStr ? 'today' : ''} ${hasBooking ? 'has-booking' : ''}`}
                        onClick={() => setSelectedDate(dateStr)}>
                  {dNum} {hasBooking && <span className="dot" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="room-status-widget">
          <h3>Status Sekarang (WIB)</h3>
          <div className="room-status-list">
            {rooms.map(room => {
              const timeStr = getWIBTime();
              const isBusy = allBookings.some(b => b.roomId === room.id && b.date === todayStr && timeStr >= b.startTime && timeStr <= b.endTime && b.status !== 'cancelled');
              return (
                <div key={room.id} className="room-status-item">
                  <div className="room-color-dot" style={{ background: room.color }} />
                  <div className="room-info"><span>{room.shortName}</span> <span className={`room-tag ${isBusy ? 'busy' : 'available'}`}>{isBusy ? 'Terpakai' : 'Tersedia'}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
