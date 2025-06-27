import { create } from 'zustand';

interface PinnedRoom {
  id: string;
  name: string;
  game: string;
}

interface PinnedRoomsState {
  rooms: PinnedRoom[];
  maximized: Record<string, boolean>; // roomId -> maximized
  addRoom: (room: PinnedRoom) => void;
  removeRoom: (id: string) => void;
  toggleMaximized: (id: string) => void;
}

export const usePinnedRoomsStore = create<PinnedRoomsState>((set) => ({
  rooms: JSON.parse(localStorage.getItem('pinnedRooms') || '[]'),
  maximized: JSON.parse(localStorage.getItem('pinnedRoomsMaximized') || '{}'),
  addRoom: (room: PinnedRoom) => set((state: PinnedRoomsState) => {
    const newRooms = state.rooms.some((r: PinnedRoom) => r.id === room.id) ? state.rooms : [...state.rooms, room];
    const newMax = { ...state.maximized, [room.id]: true };
    localStorage.setItem('pinnedRooms', JSON.stringify(newRooms));
    localStorage.setItem('pinnedRoomsMaximized', JSON.stringify(newMax));
    return {
      rooms: newRooms,
      maximized: newMax,
    };
  }),
  removeRoom: (id: string) => set((state: PinnedRoomsState) => {
    const newRooms = state.rooms.filter((r: PinnedRoom) => r.id !== id);
    const rest = Object.fromEntries(Object.entries(state.maximized).filter(([key]) => key !== id));
    localStorage.setItem('pinnedRooms', JSON.stringify(newRooms));
    localStorage.setItem('pinnedRoomsMaximized', JSON.stringify(rest));
    return {
      rooms: newRooms,
      maximized: rest,
    };
  }),
  toggleMaximized: (id: string) => set((state: PinnedRoomsState) => {
    const newMax = { ...state.maximized, [id]: !state.maximized[id] };
    localStorage.setItem('pinnedRoomsMaximized', JSON.stringify(newMax));
    return {
      maximized: newMax,
    };
  }),
}));
