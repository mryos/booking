'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CalendarDays, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/', label: 'Beranda' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/my-bookings', label: 'Booking Saya' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <CalendarDays size={24} />
          <span>MeetingYuk!</span>
        </Link>

        <div className="navbar-links" style={mobileOpen ? { display: 'flex', position: 'absolute', top: 64, left: 0, right: 0, background: 'white', flexDirection: 'column', padding: '16px', borderBottom: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-md)' } : undefined}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
