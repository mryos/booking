'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRoomById, createBooking, isTimeSlotAvailable } from '../../lib/actions';
import { timeSlots } from '../../lib/data';
import { getWIBDate, formatIndonesianDate } from '../../lib/utils';
import Toast, { useToast } from '../../components/Toast';
import { ArrowLeft, CalendarDays, Clock, User, FileText, Info } from 'lucide-react';

// getWIBDate moved to utils.ts

export default function BookingPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [room, setRoom] = useState<any>(null);
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  const todayStr = getWIBDate();

  const [form, setForm] = useState({
    date: todayStr,
    startTime: '09:00',
    endTime: '10:00',
    title: '',
    organizer: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastBooking, setLastBooking] = useState<any>(null);

  useState(() => {
    getRoomById(roomId).then(setRoom);
  });

  if (!room) {
    return (
      <div className="booking-page">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Kembali</Link>
        <div className="empty-state"><h3>Memuat data ruangan...</h3></div>
      </div>
    );
  }

  const validate = async (): Promise<boolean> => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Judul rapat wajib diisi';
    if (!form.organizer.trim()) errs.organizer = 'Nama penyelenggara wajib diisi';
    if (!form.date) errs.date = 'Tanggal wajib dipilih';
    if (form.startTime >= form.endTime) errs.endTime = 'Waktu selesai harus setelah waktu mulai';
    if (form.date < todayStr) errs.date = 'Tidak bisa booking di masa lalu';

    if (Object.keys(errs).length === 0) {
      const check = await isTimeSlotAvailable(room.id, form.date, form.startTime, form.endTime);
      if (!check.available) {
        errs.startTime = check.message || 'Slot waktu ini sudah terpakai';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validate();
    if (!isValid) return;
    setShowConfirm(true);
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);
    const result = await createBooking({
      roomId: room.id,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      title: form.title,
      organizer: form.organizer,
      description: form.description,
    });

    setIsSubmitting(false);
    setShowConfirm(false);

    if (result.success) {
      setLastBooking(result.booking);
      setIsSuccess(true);
      showToast('Booking berhasil dibuat!', 'success');
    } else {
      showToast(result.error || 'Terjadi kesalahan', 'error');
    }
  };

  return (
    <main className="booking-page fade-in">
      <Link href={`/rooms/${room.id}`} className="back-link"><ArrowLeft size={16} /> Kembali ke {room.shortName}</Link>

      <h1>Booking {room.name}</h1>
      <p className="subtitle">Isi detail rapat Anda di bawah ini</p>

      {room.id === 'studio' && (
        <div className="stat-card" style={{
          background: 'rgba(241, 144, 21, 0.1)',
          border: '1px solid #f19015',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          padding: '12px 16px'
        }}>
          <Info size={20} color="#f19015" />
          <p style={{ fontSize: '14px', margin: 0, color: '#333' }}>
            <strong>Pengaturan Khusus:</strong> Ruang Studio hanya dapat dipesan pada jam <strong>12:00 - 13:00</strong> atau <strong>mulai pukul 16:00</strong>.
          </p>
        </div>
      )}

      <div className="form-card">
        <div className="form-group">
          <label className="form-label"><FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Judul Rapat *</label>
          <input className="form-input" placeholder="Contoh: Weekly Standup Meeting" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label className="form-label"><User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Penyelenggara *</label>
          <input className="form-input" placeholder="Nama Anda" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
          {errors.organizer && <p className="form-error">{errors.organizer}</p>}
        </div>

        <div className="form-group">
          <label className="form-label"><CalendarDays size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Tanggal *</label>
          <input className="form-input" type="date" min={todayStr} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          {errors.date && <p className="form-error">{errors.date}</p>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label"><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Waktu Mulai *</label>
            <select className="form-input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}>
              {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.startTime && <p className="form-error">{errors.startTime}</p>}
          </div>
          <div className="form-group">
            <label className="form-label"><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Waktu Selesai *</label>
            <select className="form-input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}>
              {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.endTime && <p className="form-error">{errors.endTime}</p>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Keterangan (opsional)</label>
          <textarea className="form-input form-textarea" placeholder="Detail tambahan tentang rapat..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" style={{ background: room.color }} onClick={handleSubmit} disabled={isSubmitting}>
            <CalendarDays size={18} /> {isSubmitting ? 'Memproses...' : 'Buat Booking'}
          </button>
          <Link href={`/rooms/${room.id}`} className="btn btn-outline">Batal</Link>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Konfirmasi Booking</h2>
            <p>
              <strong>{form.title}</strong><br />
              {room.name}<br />
              Tanggal {formatIndonesianDate(form.date)}<br />
              {form.startTime} - {form.endTime}<br />
              Penyelenggara: {form.organizer}
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>Batal</button>
              <button className="btn btn-primary btn-sm" style={{ background: room.color }} onClick={confirmBooking} disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccess && lastBooking && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2>Booking Berhasil!</h2>
            <p>Rapat <strong>{lastBooking.title}</strong> telah dijadwalkan.</p>

            {room.id !== 'studio' && (
              <>
                <div style={{
                  background: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px dashed #ddd',
                  fontSize: '14px',
                  textAlign: 'left'
                }}>
                  <p style={{ margin: '0 0 8px 0' }}><strong>Ingin pesan konsumsi?</strong></p>
                  <p style={{ margin: 0, color: '#666' }}>Kirim notifikasi otomatis ke Tim OB GA via WhatsApp.</p>
                </div>

                <div className="modal-actions" style={{ flexDirection: 'column', gap: '10px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', background: '#25D366', borderColor: '#25D366' }}
                    onClick={() => {
                      const text = `*Notifikasi Booking Ruang Meeting*
Halo Tim OB GA, ada booking baru:

*Ruangan:* ${room.name}
*Tanggal:* ${formatIndonesianDate(lastBooking.date)}
*Waktu:* ${lastBooking.startTime} - ${lastBooking.endTime}
*Judul:* ${lastBooking.title}

Mohon persiapkan konsumsi (air mineral / makanan ringan). Terima kasih!`;
                      window.open(`https://wa.me/6287716293560?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>📲</span> Kirim Notif ke OB
                  </button>
                </div>
              </>
            )}

            <div className="modal-actions" style={{ flexDirection: 'column', gap: '10px', marginTop: room.id === 'studio' ? '20px' : '0' }}>
              <button
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={() => router.push('/my-bookings')}
              >
                Lihat Booking Saya
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </main>
  );
}
