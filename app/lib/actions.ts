'use server';

import { revalidatePath } from 'next/cache';
import { rooms } from './data';
import { readBookings, writeBookings } from './storage';

const MASTER_PIN = '1234'; // PIN Default, silakan ganti sesuai kebutuhan

// GET ROOMS
export async function getRooms() {
  return rooms;
}

export async function getRoomById(id: string) {
  return rooms.find(r => r.id === id);
}

// GET BOOKINGS
export async function getBookings() {
  try {
    return await readBookings();
  } catch (error) {
    return [];
  }
}

// STATS
function getWIBDate() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export async function getTodayStats() {
  try {
    const today = getWIBDate();
    const allBookings = await readBookings();
    
    const validBookings = allBookings.filter(b => b.status !== 'cancelled');
    const todayBookings = validBookings.filter(b => b.date === today);

    return {
      todayTotal: todayBookings.length,
      activeNow: todayBookings.filter(b => b.status === 'in-progress').length,
      upcoming: todayBookings.filter(b => b.status === 'upcoming').length,
      totalAll: validBookings.length,
    };
  } catch (error) {
    return { todayTotal: 0, activeNow: 0, upcoming: 0, totalAll: 0 };
  }
}

// CREATE BOOKING
export async function createBooking(data: any) {
  try {
    // VALIDASI PIN
    if (data.pin !== MASTER_PIN) {
      throw new Error('PIN Admin salah! Gunakan PIN kantor yang benar.');
    }

    const bookings = await readBookings();
    
    // Check for double booking
    const isConflict = bookings.some(b => 
      b.roomId === data.roomId && 
      b.date === data.date && 
      b.status !== 'cancelled' &&
      ((data.startTime >= b.startTime && data.startTime < b.endTime) ||
       (data.endTime > b.startTime && data.endTime <= b.endTime) ||
       (data.startTime <= b.startTime && data.endTime >= b.endTime))
    );

    if (isConflict) {
      throw new Error('Ruangan sudah dipesan pada jam tersebut.');
    }

    const { pin, ...bookingData } = data; // Jangan simpan PIN ke database
    const newBooking = {
      id: Math.random().toString(36).substring(2, 9),
      ...bookingData,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    const updatedBookings = [newBooking, ...bookings];
    await writeBookings(updatedBookings);
    
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/my-bookings');
    
    return { success: true, booking: newBooking };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// CANCEL / DELETE WITH PIN
export async function cancelBooking(id: string, pin: string) {
  try {
    if (pin !== MASTER_PIN) throw new Error('PIN Admin salah!');

    const bookings = await readBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index].status = 'cancelled';
      await writeBookings(bookings);
    }
    
    revalidatePath('/dashboard');
    revalidatePath('/my-bookings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBooking(id: string, pin: string) {
  try {
    if (pin !== MASTER_PIN) throw new Error('PIN Admin salah!');

    const bookings = await readBookings();
    const updatedBookings = bookings.filter(b => b.id !== id);
    await writeBookings(updatedBookings);
    
    revalidatePath('/dashboard');
    revalidatePath('/my-bookings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// HELPER
export async function isTimeSlotAvailable(roomId: string, date: string, startTime: string, endTime: string) {
  const bookings = await readBookings();
  return !bookings.some(b => 
    b.roomId === roomId && 
    b.date === date && 
    b.status !== 'cancelled' &&
    ((startTime >= b.startTime && startTime < b.endTime) ||
     (endTime > b.startTime && endTime <= b.endTime) ||
     (startTime <= b.startTime && endTime >= b.endTime))
  );
}
