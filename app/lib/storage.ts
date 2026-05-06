import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'app/data');
const FILE_PATH = path.join(DATA_DIR, 'bookings.json');

// Initial rooms data
const INITIAL_ROOMS = [
  {
    id: 'management-a',
    name: 'Ruang Meeting Management A',
    shortName: 'Management A',
    floor: 'Lantai 1',
    description: 'Ruang meeting nyaman untuk rapat tim kecil dengan fasilitas lengkap.',
    facilities: ['Projector', 'Whiteboard', 'AC', 'Wi-Fi'],
    color: '#359ed9',
  },
  {
    id: 'management-b',
    name: 'Ruang Meeting Management B',
    shortName: 'Management B',
    floor: 'Lantai 1',
    description: 'Ruang meeting ideal untuk diskusi dan brainstorming.',
    facilities: ['Projector', 'Whiteboard', 'AC', 'Wi-Fi'],
    color: '#f19015',
  },
  {
    id: 'management-lt2',
    name: 'Ruang Meeting Management Lantai 2',
    shortName: 'Management Lt.2',
    floor: 'Lantai 2',
    description: 'Ruang meeting strategis di lantai 2 untuk koordinasi manajemen.',
    facilities: ['TV Screen', 'Whiteboard', 'AC', 'Wi-Fi'],
    color: '#359ed9',
  },
  {
    id: 'lobby-lt2',
    name: 'Ruang Lobby Management Lantai 2',
    shortName: 'Lobby Lt.2',
    floor: 'Lantai 2',
    description: 'Ruang lobby luas untuk pertemuan dengan jumlah peserta lebih banyak.',
    facilities: ['Projector', 'Sound System', 'Whiteboard', 'AC', 'Wi-Fi'],
    color: '#f19015',
  },
  {
    id: 'ballroom-lt3',
    name: 'Ruang Ballroom Office Lantai 3',
    shortName: 'Ballroom Lt.3',
    floor: 'Lantai 3',
    description: 'Ruang ballroom besar untuk acara, presentasi, dan pertemuan skala besar.',
    facilities: ['Videotron', 'Sound System', 'Podium', 'Whiteboard', 'AC', 'Wi-Fi'],
    color: '#359ed9',
  },
  {
    id: 'studio',
    name: 'Ruang Studio Office',
    shortName: 'Studio Office',
    floor: 'Lantai 1',
    description: 'Ruang studio multifungsi untuk recording, workshop, dan kegiatan kreatif.',
    facilities: ['Alat Musik Lengkap', 'Recording', 'AC', 'Wi-Fi', 'Lighting'],
    color: '#f19015',
  },
];

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(FILE_PATH);
    } catch {
      // File doesn't exist, create it with initial data
      await fs.writeFile(FILE_PATH, JSON.stringify({ bookings: [] }, null, 2));
    }
  } catch (err) {
    console.error('Error ensuring data file:', err);
  }
}

export async function getRooms() {
  return INITIAL_ROOMS;
}

export async function getRoomById(id: string) {
  return INITIAL_ROOMS.find(r => r.id === id) || null;
}

export async function readBookings(): Promise<any[]> {
  await ensureDataFile();
  try {
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data).bookings;
  } catch (error) {
    return [];
  }
}

export async function writeBookings(bookings: any[]) {
  await ensureDataFile();
  await fs.writeFile(FILE_PATH, JSON.stringify({ bookings }, null, 2));
}
