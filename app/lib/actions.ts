'use server';

import { revalidatePath } from 'next/cache';
import { 
  getRooms as fetchRooms, 
  getRoomById as fetchRoom, 
  readBookings, 
  writeBookings,
  dbInsertBooking,
  dbUpdateStatus,
  dbDeleteBooking
} from './storage';
import { getWIBDate, getWIBTime } from './utils';

export async function getRooms() {
  return await fetchRooms();
}

export async function getRoomById(id: string) {
  return await fetchRoom(id);
}

export async function getBookings() {
  try {
    return await readBookings();
  } catch (error) {
    return [];
  }
}

export async function getBookingsByRoomAndDate(roomId: string, date: string) {
  try {
    const bookings = await readBookings();
    return bookings.filter((b) => 
      b.roomId === roomId && 
      b.date === date && 
      b.status !== 'cancelled'
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  } catch (error) {
    return [];
  }
}

export async function isTimeSlotAvailable(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string
) {
  try {
    // Special restriction for Studio room
    if (roomId === 'studio') {
      const isLunchSlot = startTime >= '12:00' && endTime <= '13:00';
      const isEveningSlot = startTime >= '16:00';
      
      if (!isLunchSlot && !isEveningSlot) {
        return { 
          available: false, 
          message: 'Ruang Studio hanya dapat dipesan pada jam 12:00 - 13:00 atau mulai pukul 16:00.' 
        };
      }
    }

    const bookings = await readBookings();
    const existingBookings = bookings.filter((b) => 
      b.roomId === roomId && 
      b.date === date && 
      b.status !== 'cancelled'
    );

    const hasOverlap = existingBookings.some((b) => {
      return startTime < b.endTime && endTime > b.startTime;
    });

    if (hasOverlap) {
      return { available: false, message: 'Slot waktu ini sudah terpakai' };
    }

    return { available: true };
  } catch (error) {
    return { available: false, message: 'Terjadi kesalahan saat memeriksa ketersediaan' };
  }
}

async function notifyOBTeam(booking: any, room: any) {
  const OB_NUMBER = '6287716293560'; 
  const message = `*Notifikasi Booking Ruang Meeting*
Halo Tim OB GA, ada booking baru:

*Ruangan:* ${room.name}
*Tanggal:* ${booking.date}
*Waktu:* ${booking.startTime} - ${booking.endTime}
*Judul:* ${booking.title}
*Penyelenggara:* ${booking.organizer}

Mohon persiapkan konsumsi (air mineral / makanan ringan). Terima kasih!`;

  // Catatan: Di produksi, gunakan penyedia layanan WA Gateway (seperti Fonnte, Twilio, atau Wablas)
  // Contoh implementasi dengan Fonnte:
  /*
  try {
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { 'Authorization': process.env.FONNTE_TOKEN || '' },
      body: new URLSearchParams({
        target: OB_NUMBER,
        message: message,
      })
    });
  } catch (err) {
    console.error('WhatsApp Notification Error:', err);
  }
  */
  
  // Untuk keperluan demo/log:
  console.log(`[WA NOTIF] Mengirim pesan ke ${OB_NUMBER}: \n${message}`);
}

export async function createBooking(data: {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  organizer: string;
  description?: string;
}) {
  try {
    const check = await isTimeSlotAvailable(data.roomId, data.date, data.startTime, data.endTime);
    if (!check.available) {
      throw new Error(check.message || 'Slot waktu tidak tersedia');
    }

    const newBooking = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    // Use DB if enabled, else JSON
    try {
      await dbInsertBooking(newBooking);
    } catch {
      const bookings = await readBookings();
      bookings.push(newBooking);
      await writeBookings(bookings);
    }

    // Trigger WA Notification to OB Team (hanya untuk ruang selain studio)
    const room = await fetchRoom(data.roomId);
    if (room && room.id !== 'studio') {
      // Kita panggil tanpa await agar tidak menghambat response user (background task)
      notifyOBTeam(newBooking, room);
    }

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/my-bookings');
    revalidatePath(`/rooms/${data.roomId}`);

    return { success: true, booking: newBooking };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelBooking(id: string) {
  try {
    try {
      await dbUpdateStatus(id, 'cancelled');
    } catch {
      const bookings = await readBookings();
      const index = bookings.findIndex(b => b.id === id);
      if (index !== -1) {
        bookings[index].status = 'cancelled';
        await writeBookings(bookings);
      }
    }
    revalidatePath('/my-bookings');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteBooking(id: string) {
  try {
    try {
      await dbDeleteBooking(id);
    } catch {
      const bookings = await readBookings();
      const filtered = bookings.filter(b => b.id !== id);
      await writeBookings(filtered);
    }
    revalidatePath('/my-bookings');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// getWIBDate moved to utils.ts

export async function getTodayStats() {
  try {
    const today = getWIBDate();
    const nowTime = getWIBTime();
    const allBookings = await readBookings();
    
    const validBookings = allBookings.filter(b => b.status !== 'cancelled');
    const todayBookings = validBookings.filter(b => b.date === today);

    // Calculate activeNow and upcoming based on actual time
    const activeNowCount = todayBookings.filter(b => 
      nowTime >= b.startTime && nowTime < b.endTime
    ).length;

    const upcomingCount = todayBookings.filter(b => 
      b.startTime > nowTime
    ).length;

    return {
      todayTotal: todayBookings.length,
      activeNow: activeNowCount,
      upcoming: upcomingCount,
      totalAll: validBookings.length,
    };
  } catch (error) {
    return { todayTotal: 0, activeNow: 0, upcoming: 0, totalAll: 0 };
  }
}
