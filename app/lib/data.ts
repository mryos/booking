export interface Room {
  id: string;
  name: string;
  shortName: string;
  floor: string;
  description: string;
  facilities: string[];
  image: string;
  color: string;
}

export interface Booking {
  id: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  organizer: string;
  description: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export const rooms: Room[] = [
  {
    id: 'management-a',
    name: 'Ruang Meeting Management A',
    shortName: 'Management A',
    floor: 'Lantai 1',
    description: 'Ruang meeting nyaman untuk rapat tim kecil dengan fasilitas lengkap.',
    facilities: ['Projector', 'Whiteboard', 'AC', 'Wi-Fi'],
    image: '/rooms/room-1.jpg',
    color: '#359ed9',
  },
  {
    id: 'management-b',
    name: 'Ruang Meeting Management B',
    shortName: 'Management B',
    floor: 'Lantai 1',
    description: 'Ruang meeting ideal untuk diskusi dan brainstorming.',
    facilities: ['Projector', 'Whiteboard', 'AC', 'Wi-Fi'],
    image: '/rooms/room-2.jpg',
    color: '#f19015',
  },
  {
    id: 'management-lt2',
    name: 'Ruang Meeting Management Lantai 2',
    shortName: 'Management Lt.2',
    floor: 'Lantai 2',
    description: 'Ruang meeting strategis di lantai 2 untuk koordinasi manajemen.',
    facilities: ['TV Screen', 'Whiteboard', 'AC', 'Wi-Fi'],
    image: '/rooms/room-3.jpg',
    color: '#359ed9',
  },
  {
    id: 'lobby-lt2',
    name: 'Ruang Lobby Management Lantai 2',
    shortName: 'Lobby Lt.2',
    floor: 'Lantai 2',
    description: 'Ruang lobby luas untuk pertemuan dengan jumlah peserta lebih banyak.',
    facilities: ['Projector', 'Sound System', 'Whiteboard', 'AC', 'Wi-Fi'],
    image: '/rooms/room-4.jpg',
    color: '#f19015',
  },
  {
    id: 'ballroom-lt3',
    name: 'Ruang Ballroom Office Lantai 3',
    shortName: 'Ballroom Lt.3',
    floor: 'Lantai 3',
    description: 'Ruang ballroom besar untuk acara, presentasi, dan pertemuan skala besar.',
    facilities: ['Videotron', 'Sound System', 'Podium', 'Whiteboard', 'AC', 'Wi-Fi'],
    image: '/rooms/room-5.jpg',
    color: '#359ed9',
  },
  {
    id: 'studio',
    name: 'Ruang Studio Office',
    shortName: 'Studio Office',
    floor: 'Lantai 1',
    description: 'Ruang studio multifungsi untuk recording, workshop, dan kegiatan kreatif.',
    facilities: ['Alat Musik Lengkap', 'Recording', 'AC', 'Wi-Fi', 'Lighting'],
    image: '/rooms/room-6.jpg',
    color: '#f19015',
  },
];

export function getRoomById(id: string): Room | undefined {
  return rooms.find((room) => room.id === id);
}

// Time slots from 07:00 to 22:00
export const timeSlots: string[] = [];
for (let h = 7; h <= 21; h++) {
  timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
  timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
}
timeSlots.push('22:00');
