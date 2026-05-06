import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'MeetingYuk! - Booking Ruang Rapat',
  description: 'Aplikasi booking ruang rapat modern dan mudah digunakan. Pesan ruang meeting kapan saja.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 64px - 100px)' }}>
          {children}
        </main>
        <footer className="footer">
          <div className="footer-inner">
            <p className="footer-text">
              &copy; 2026 <span>Vendor Management</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
