import Link from 'next/link';
import { getRooms, getTodayStats } from './lib/actions';
import {
  CalendarDays, Users, Clock, BarChart3, MapPin,
  Wifi, Monitor, Mic, ArrowRight, Tv,
} from 'lucide-react';

const facilityIcons: Record<string, React.ReactNode> = {
  TV: <Tv size={14} />,
  Whiteboard: <Monitor size={14} />,
  'TV Screen': <Monitor size={14} />,
  Monitor: <Monitor size={14} />,
  Videotron: <Monitor size={14} />,
  AC: <span style={{ fontSize: '11px' }}>❄️</span>,
  'Wi-Fi': <Wifi size={14} />,
  'Sound System': <Mic size={14} />,
  Podium: <Mic size={14} />,
  'Alat Musik Lengkap': <Mic size={14} />,
  Recording: <Mic size={14} />,
  Lighting: <span style={{ fontSize: '11px' }}>💡</span>,
};

export default async function HomePage() {
  const rooms = await getRooms();
  const stats = await getTodayStats();

  return (
    <main className="fade-in">
      {/* Hero */}
      <section className="hero">
        <h1>
          <span className="text-blue">Booking</span> <span className="text-orange">Ruang</span> <span className="text-blue">Rapat</span> <span className="text-orange">Jadi</span> <span className="text-blue">Mudah</span>
        </h1>
        <p>Pesan ruang meeting dengan cepat dan mudah. Lihat ketersediaan real-time dan kelola booking Anda.</p>
        <div className="hero-actions">
          <Link href="#rooms" className="btn btn-primary">
            <CalendarDays size={18} />
            Lihat Ruang Meeting
          </Link>
          <Link href="/dashboard" className="btn btn-outline">
            <BarChart3 size={18} />
            Dashboard
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card slide-up">
            <div className="stat-icon blue"><CalendarDays size={22} /></div>
            <div className="stat-value">{stats.todayTotal}</div>
            <div className="stat-label">Booking Hari Ini</div>
          </div>
          <div className="stat-card slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon orange"><Clock size={22} /></div>
            <div className="stat-value">{stats.activeNow}</div>
            <div className="stat-label">Sedang Berlangsung</div>
          </div>
          <div className="stat-card slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon blue"><Users size={22} /></div>
            <div className="stat-value">{stats.upcoming}</div>
            <div className="stat-label">Akan Datang</div>
          </div>
          <div className="stat-card slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon orange"><BarChart3 size={22} /></div>
            <div className="stat-value">{stats.totalAll}</div>
            <div className="stat-label">Total Booking</div>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section className="section" id="rooms">
        <div className="section-header">
          <div>
            <h2 className="section-title">Ruang Meeting</h2>
            <p className="section-subtitle">Pilih ruang yang sesuai kebutuhan Anda</p>
          </div>
        </div>

        <div className="rooms-grid">
          {rooms.map((room, index) => (
            <Link href={`/rooms/${room.id}`} key={room.id} className="room-card slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="room-card-image" style={{ background: `linear-gradient(135deg, ${room.color}20, ${room.color}10)` }}>
                <div className="room-card-icon" style={{ color: room.color }}>
                  <CalendarDays size={28} />
                </div>
                <span className="room-card-badge">
                  <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  {room.floor}
                </span>
              </div>
              <div className="room-card-body">
                <h3 className="room-card-name">{room.name}</h3>
                <p className="room-card-floor">{room.description}</p>
                <div className="room-card-facilities">
                  {room.facilities.slice(0, 4).map((f) => (
                    <span key={f} className="facility-tag">
                      {facilityIcons[f] || <ArrowRight size={12} />} {f}
                    </span>
                  ))}
                </div>
                <div className="room-card-footer">
                  <span className="btn btn-sm btn-primary" style={{ background: room.color }}>
                    Booking <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
