import { Timestamp } from "firebase/firestore";

export function getDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return isNaN(timestamp.getTime()) ? null : timestamp;
  }
  
  // If it's a Firestore Timestamp instance or has a toDate method
  if (typeof timestamp.toDate === 'function') {
    try {
      const d = timestamp.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch (e) {
      // fallback
    }
  }

  // If it's a raw Firestore Timestamp-like object: { seconds, nanoseconds }
  if (typeof timestamp.seconds === 'number') {
    try {
      const d = new Date(timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1000000));
      return isNaN(d.getTime()) ? null : d;
    } catch (e) {
      // fallback
    }
  }

  // If it's a number (milliseconds)
  if (typeof timestamp === 'number') {
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  }

  // If it's a string (e.g. ISO string)
  if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  return null;
}

export function toMillis(timestamp: any): number {
  if (!timestamp) return 0;
  
  if (typeof timestamp.toMillis === 'function') {
    try {
      return timestamp.toMillis();
    } catch (e) {
      // fallback
    }
  }
  
  if (typeof timestamp.seconds === 'number') {
    return timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1000000);
  }
  
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  
  if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  if (timestamp instanceof Date) {
    return isNaN(timestamp.getTime()) ? 0 : timestamp.getTime();
  }
  
  return 0;
}
