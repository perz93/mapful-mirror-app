import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'event_attendees';

interface AttendeeEntry {
  going: boolean;
  count: number;
}

interface AttendeeData {
  [eventId: string]: AttendeeEntry;
}

function getStoredData(): AttendeeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveData(data: AttendeeData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getOrCreateEntry(eventId: string, data: AttendeeData): AttendeeEntry {
  if (data[eventId]) {
    return data[eventId];
  }
  // First encounter: random count between 5 and 50, user not going
  const count = Math.floor(Math.random() * 46) + 5;
  const entry: AttendeeEntry = { going: false, count };
  data[eventId] = entry;
  saveData(data);
  return entry;
}

export function useAttendees(eventId: string) {
  const [isGoing, setIsGoing] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const data = getStoredData();
    const entry = getOrCreateEntry(eventId, data);
    setIsGoing(entry.going);
    setCount(entry.count);
  }, [eventId]);

  const toggleGoing = useCallback(() => {
    const data = getStoredData();
    const entry = getOrCreateEntry(eventId, data);

    if (entry.going) {
      entry.going = false;
      entry.count = Math.max(0, entry.count - 1);
    } else {
      entry.going = true;
      entry.count += 1;
    }

    data[eventId] = entry;
    saveData(data);
    setIsGoing(entry.going);
    setCount(entry.count);
  }, [eventId]);

  return { isGoing, count, toggleGoing };
}
