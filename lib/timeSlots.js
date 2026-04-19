export const TIME_SLOTS = [
  { index: 1, start: '09:00', end: '10:00', label: 'Slot 1' },
  { index: 2, start: '10:00', end: '11:00', label: 'Slot 2' },
  { index: 3, start: '11:00', end: '12:00', label: 'Slot 3' },
  { index: 4, start: '13:00', end: '14:00', label: 'Slot 4' },
  { index: 5, start: '14:00', end: '15:00', label: 'Slot 5' },
  { index: 6, start: '15:00', end: '16:00', label: 'Slot 6' },
  { index: 7, start: '20:30', end: '21:30', label: 'Slot 7' },
];

export function getCurrentSlot() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return TIME_SLOTS.find(slot => currentTime >= slot.start && currentTime < slot.end);
}

export function isSlotPast(slotIndex) {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  const slot = TIME_SLOTS.find(s => s.index === slotIndex);
  if (!slot) return true;
  
  return currentTime >= slot.end;
}
