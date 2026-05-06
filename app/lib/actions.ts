'use server';

import { revalidatePath } from 'next/cache';
import { getRooms as fetchRooms, getRoomById as fetchRoom, readBookings, writeBookings } from './storage';

export async function getRooms() {
  return await fetchRooms();
}

export async function getRoomById(id: string) {
  return await fetchRoom(id);
}

export async function getBookings() {
  try {
    const bookings = await readBookings();
    return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    const bookings = await readBookings();
    const existingBookings = bookings.filter((b) => 
      b.roomId === roomId && 
      b.date === date && 
      b.status !== 'cancelled'
    );

    return !existingBookings.some((b) => {
      return startTime < b.endTime && endTime > b.startTime;
    });
  } catch (error) {
    return false;
  }
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
    const available = await isTimeSlotAvailable(data.roomId, data.date, data.startTime, data.endTime);
    if (!available) {
      throw new Error('Slot waktu tidak tersedia');
    }

    const bookings = await readBookings();
    const newBooking = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    await writeBookings(bookings);

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
    const bookings = await readBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index].status = 'cancelled';
      await writeBookings(bookings);
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
    const bookings = await readBookings();
    const filtered = bookings.filter(b => b.id !== id);
    await writeBookings(filtered);
    revalidatePath('/my-bookings');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getTodayStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allBookings = await readBookings();
    
    const validBookings = allBookings.filter(b => b.status !== 'cancelled');
    const todayBookings = validBookings.filter(b => b.date === today);

    // In a real app, we would update status based on current time
    // For this simple version, we'll just return the counts
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
