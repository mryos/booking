import Link from 'next/link';
import { getRoomById } from '../../lib/actions';
import RoomDetailClient from './RoomDetailClient';
import {
  ArrowLeft, CalendarDays, MapPin, Wifi, Monitor, Mic,
  Projector,
} from 'lucide-react';

const facilityIcons: Record<string, React.ReactNode> = {
  Projector: <Projector size={16} />,
  Whiteboard: <Monitor size={16} />,
  'TV Screen': <Monitor size={16} />,
  Monitor: <Monitor size={16} />,
  Videotron: <Monitor size={16} />,
  AC: <span>❄️</span>,
  'Wi-Fi': <Wifi size={16} />,
  'Sound System': <Mic size={16} />,
  Podium: <Mic size={16} />,
  'Alat Musik Lengkap': <Mic size={16} />,
  Recording: <Mic size={16} />,
  Lighting: <span>💡</span>,
};

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await getRoomById(id);

  if (!room) {
    return (
      <div className="room-detail">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Kembali</Link>
        <div className="empty-state">
          <h3>Ruang tidak ditemukan</h3>
          <p>Ruang yang Anda cari tidak tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="room-detail fade-in">
      <Link href="/" className="back-link"><ArrowLeft size={16} /> Kembali ke Daftar Ruang</Link>

      <div className="room-detail-header">
        <div className="room-detail-image" style={{ background: `linear-gradient(135deg, ${room.color}25, ${room.color}10)` }}>
          <div style={{ color: room.color }}><CalendarDays size={80} strokeWidth={1} /></div>
        </div>

        <div className="room-detail-info">
          <h1 className="room-detail-name">{room.name}</h1>
          <div className="room-detail-floor"><MapPin size={14} /> {room.floor}</div>
          <p className="room-detail-desc">{room.description}</p>

          <div className="facilities-list">
            {room.facilities.map((f) => (
              <div key={f} className="facility-item">
                {facilityIcons[f] || <ArrowLeft size={14} />} {f}
              </div>
            ))}
          </div>

          <Link href={`/booking/${room.id}`} className="btn btn-primary" style={{ background: room.color, width: 'fit-content' }}>
            <CalendarDays size={18} /> Book Sekarang
          </Link>
        </div>
      </div>

      <RoomDetailClient room={room} />
    </main>
  );
}
