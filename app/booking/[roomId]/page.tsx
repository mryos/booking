'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRoomById, createBooking, isTimeSlotAvailable } from '../../lib/actions';
import { timeSlots } from '../../lib/data';
import Toast, { useToast } from '../../components/Toast';
import { ArrowLeft, CalendarDays, Clock, User, FileText } from 'lucide-react';

function getWIBDate() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

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
      const available = await isTimeSlotAvailable(room.id, form.date, form.startTime, form.endTime);
      if (!available) {
        errs.startTime = 'Slot waktu ini sudah terpakai';
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
      showToast('Booking berhasil dibuat!', 'success');
      setTimeout(() => router.push('/my-bookings'), 1500);
    } else {
      showToast(result.error || 'Terjadi kesalahan', 'error');
    }
  };

  return (
    <main className="booking-page fade-in">
      <Link href={`/rooms/${room.id}`} className="back-link"><ArrowLeft size={16} /> Kembali ke {room.shortName}</Link>

      <h1>Booking {room.name}</h1>
      <p className="subtitle">Isi detail rapat Anda di bawah ini</p>

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
              Tanggal {new Date(form.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}<br />
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </main>
  );
}
