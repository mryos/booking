'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { rooms } from '../lib/data';
import { getBookings, cancelBooking, deleteBooking } from '../lib/actions';
import { formatIndonesianDate } from '../lib/utils';
import Toast, { useToast } from '../components/Toast';
import { CalendarDays, Clock, MapPin, X, Trash2, Plus } from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'delete'; id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  const loadBookings = async () => {
    setIsLoading(true);
    const data = await getBookings();
    setBookings(data);
    setIsLoading(false);
  };

  useEffect(() => { loadBookings(); }, []);

  const getRoomName = (roomId: string) => rooms.find((r) => r.id === roomId)?.shortName || roomId;
  const getRoomColor = (roomId: string) => rooms.find((r) => r.id === roomId)?.color || '#359ed9';

  const filtered = activeTab === 'all' ? bookings : bookings.filter((b) => b.status === activeTab);

  const handleCancel = async (id: string) => {
    const res = await cancelBooking(id);
    if (res.success) {
      loadBookings();
      setConfirmAction(null);
      showToast('Booking berhasil dibatalkan', 'info');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteBooking(id);
    if (res.success) {
      loadBookings();
      setConfirmAction(null);
      showToast('Booking berhasil dihapus', 'success');
    }
  };

  const tabs = [
    { key: 'all', label: 'Semua' },
    { key: 'upcoming', label: 'Akan Datang' },
    { key: 'in-progress', label: 'Berlangsung' },
    { key: 'completed', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
  ];

  const statusLabel: Record<string, string> = {
    upcoming: 'Akan Datang',
    'in-progress': 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  const shareInvitation = (b: any) => {
    const room = getRoomName(b.roomId);
    const dateStr = formatIndonesianDate(b.date);
    const text = `*Undangan Rapat - MeetingYuk!*\n\n📌 *Judul:* ${b.title}\n🏢 *Ruangan:* ${room}\n🗓️ *Tanggal:* ${dateStr}\n⏰ *Waktu:* ${b.startTime} - ${b.endTime} WIB\n👤 *Penyelenggara:* ${b.organizer}\n\n_Mohon hadir tepat waktu. Terima kasih!_`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const copyToClipboard = (b: any) => {
    const room = getRoomName(b.roomId);
    const dateStr = formatIndonesianDate(b.date);
    const text = `Undangan Rapat - MeetingYuk!\n\nJudul: ${b.title}\nRuangan: ${room}\nTanggal: ${dateStr}\nWaktu: ${b.startTime} - ${b.endTime} WIB\nPenyelenggara: ${b.organizer}`;
    
    navigator.clipboard.writeText(text);
    showToast('Undangan disalin ke clipboard', 'success');
  };

  return (
    <main className="my-bookings fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h1>Booking Saya</h1>
          <p className="subtitle">Kelola semua booking ruang rapat Anda</p>
        </div>
        <Link href="/" className="btn btn-primary btn-sm">
          <Plus size={16} /> Booking Baru
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
            {tab.key !== 'all' && (
              <span style={{ marginLeft: 6, fontSize: '0.75rem', background: activeTab === tab.key ? 'var(--blue-bg)' : 'var(--gray-100)', padding: '2px 8px', borderRadius: 10 }}>
                {bookings.filter((b) => b.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking List */}
      {isLoading ? (
        <div className="empty-state"><h3>Memuat data booking...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={48} />
          <h3>Belum ada booking</h3>
          <p>Anda belum memiliki booking. Mulai booking ruang rapat sekarang!</p>
          <Link href="/" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Lihat Ruang Meeting</Link>
        </div>
      ) : (
        <div className="booking-list">
          {filtered.map((b) => (
            <div key={b.id} className="booking-card">
              <div className="booking-card-color" style={{ background: getRoomColor(b.roomId) }} />
              <div className="booking-card-info">
                <div className="booking-card-title">{b.title}</div>
                <div className="booking-card-meta">
                  <span><MapPin size={14} /> {getRoomName(b.roomId)}</span>
                  <span><CalendarDays size={14} /> {formatIndonesianDate(b.date)}</span>
                  <span><Clock size={14} /> {b.startTime} - {b.endTime}</span>
                </div>
              </div>
              <div className="booking-card-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className={`schedule-status status-${b.status}`} style={{ margin: 0 }}>{statusLabel[b.status]}</span>
                
                {b.status !== 'cancelled' && (
                  <button className="btn btn-outline btn-sm" onClick={() => shareInvitation(b)} title="Bagikan ke WhatsApp" style={{ padding: '6px 10px' }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.968c0 2.112.552 4.175 1.598 6.011L0 24l6.193-1.624c1.776.968 3.784 1.478 5.826 1.479h.005c6.605 0 11.97-5.363 11.972-11.969a11.85 11.85 0 00-3.483-8.47z"/>
                    </svg>
                  </button>
                )}

                {b.status === 'upcoming' && (
                  <button className="btn btn-ghost btn-sm" style={{ color: '#e74c3c' }} onClick={() => setConfirmAction({ type: 'cancel', id: b.id })} title="Batalkan">
                    <X size={16} />
                  </button>
                )}
                {(b.status === 'cancelled' || b.status === 'completed') && (
                  <button className="btn btn-ghost btn-sm" style={{ color: '#e74c3c' }} onClick={() => setConfirmAction({ type: 'delete', id: b.id })} title="Hapus">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{confirmAction.type === 'cancel' ? 'Batalkan Booking?' : 'Hapus Booking?'}</h2>
            <p>{confirmAction.type === 'cancel' ? 'Booking yang dibatalkan tidak dapat dikembalikan.' : 'Booking akan dihapus secara permanen.'}</p>
            <div className="modal-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setConfirmAction(null)}>Tidak</button>
              <button className="btn btn-danger btn-sm" onClick={() => confirmAction.type === 'cancel' ? handleCancel(confirmAction.id) : handleDelete(confirmAction.id)}>
                {confirmAction.type === 'cancel' ? 'Ya, Batalkan' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </main>
  );
}
