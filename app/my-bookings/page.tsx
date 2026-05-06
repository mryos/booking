'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { rooms } from '../lib/data';
import { getBookings, cancelBooking, deleteBooking } from '../lib/actions';
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
    const dateStr = new Date(b.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const text = `*Undangan Rapat - MeetingYuk!*\n\n📌 *Judul:* ${b.title}\n🏢 *Ruangan:* ${room}\n🗓️ *Tanggal:* ${dateStr}\n⏰ *Waktu:* ${b.startTime} - ${b.endTime} WIB\n👤 *Penyelenggara:* ${b.organizer}\n\n_Mohon hadir tepat waktu. Terima kasih!_`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const copyToClipboard = (b: any) => {
    const room = getRoomName(b.roomId);
    const dateStr = new Date(b.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
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
                  <span><CalendarDays size={14} /> {new Date(b.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  <span><Clock size={14} /> {b.startTime} - {b.endTime}</span>
                </div>
              </div>
              <div className="booking-card-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className={`schedule-status status-${b.status}`} style={{ margin: 0 }}>{statusLabel[b.status]}</span>
                
                {b.status !== 'cancelled' && (
                  <button className="btn btn-outline btn-sm" onClick={() => shareInvitation(b)} title="Bagikan ke WhatsApp">
                    <span style={{ color: '#25D366', fontWeight: 700 }}>WA</span>
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
