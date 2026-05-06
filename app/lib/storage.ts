import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const DATA_DIR = path.join(process.cwd(), 'app/data');
const FILE_PATH = path.join(DATA_DIR, 'bookings.json');

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseEnabled = !!supabaseUrl && !!supabaseKey;

const supabase = isSupabaseEnabled ? createClient(supabaseUrl, supabaseKey) : null;

// Initial rooms data
const INITIAL_ROOMS = [
  { id: 'management-a', name: 'Ruang Meeting Management A', shortName: 'Management A', floor: 'Lantai 1', description: 'Ruang meeting nyaman untuk rapat tim kecil dengan fasilitas lengkap.', facilities: ['Projector', 'Whiteboard', 'AC', 'Wi-Fi'], color: '#359ed9' },
  { id: 'management-b', name: 'Ruang Meeting Management B', shortName: 'Management B', floor: 'Lantai 1', description: 'Ruang meeting ideal untuk diskusi dan brainstorming.', facilities: ['Projector', 'Whiteboard', 'AC', 'Wi-Fi'], color: '#f19015' },
  { id: 'management-lt2', name: 'Ruang Meeting Management Lantai 2', shortName: 'Management Lt.2', floor: 'Lantai 2', description: 'Ruang meeting strategis di lantai 2 untuk koordinasi manajemen.', facilities: ['TV Screen', 'Whiteboard', 'AC', 'Wi-Fi'], color: '#359ed9' },
  { id: 'lobby-lt2', name: 'Ruang Lobby Management Lantai 2', shortName: 'Lobby Lt.2', floor: 'Lantai 2', description: 'Ruang lobby luas untuk pertemuan dengan jumlah peserta lebih banyak.', facilities: ['Projector', 'Sound System', 'Whiteboard', 'AC', 'Wi-Fi'], color: '#f19015' },
  { id: 'ballroom-lt3', name: 'Ruang Ballroom Office Lantai 3', shortName: 'Ballroom Lt.3', floor: 'Lantai 3', description: 'Ruang ballroom besar untuk acara, presentasi, dan pertemuan skala besar.', facilities: ['Videotron', 'Sound System', 'Podium', 'Whiteboard', 'AC', 'Wi-Fi'], color: '#359ed9' },
  { id: 'studio', name: 'Ruang Studio Office', shortName: 'Studio Office', floor: 'Lantai 3', description: 'Ruang studio multifungsi untuk recording, workshop, dan kegiatan kreatif.', facilities: ['Alat Musik Lengkap', 'Recording', 'AC', 'Wi-Fi', 'Lighting'], color: '#f19015' },
];

async function ensureDataFile() {
  if (isSupabaseEnabled) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try { await fs.access(FILE_PATH); } catch {
      await fs.writeFile(FILE_PATH, JSON.stringify({ bookings: [] }, null, 2));
    }
  } catch (err) {}
}

export async function getRooms() { return INITIAL_ROOMS; }
export async function getRoomById(id: string) { return INITIAL_ROOMS.find(r => r.id === id) || null; }

export async function readBookings(): Promise<any[]> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('bookings').select('*').order('createdAt', { ascending: false });
    if (error) { console.error('Supabase fetch error:', error); return []; }
    return data || [];
  }

  await ensureDataFile();
  try {
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data).bookings;
  } catch (error) { return []; }
}

export async function writeBookings(bookings: any[]) {
  // This is only used for local JSON storage in this simplified logic.
  // For Supabase, we use direct insert/update actions in actions.ts for better performance.
  if (!isSupabaseEnabled) {
    await ensureDataFile();
    await fs.writeFile(FILE_PATH, JSON.stringify({ bookings }, null, 2));
  }
}

// Supabase-specific optimized actions
export async function dbInsertBooking(booking: any) {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase.from('bookings').insert([booking]).select();
    if (error) throw error;
    return data[0];
  }
}

export async function dbUpdateStatus(id: string, status: string) {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) throw error;
  }
}

export async function dbDeleteBooking(id: string) {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
  }
}
