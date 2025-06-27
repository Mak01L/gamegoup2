// Opciones compartidas para filtros y creación de salas

export const games = [
  'Valorant', 'League of Legends', 'Counter-Strike 2', 'Counter-Strike: Global Offensive', 'Fortnite', 'Apex Legends', 'Rocket League', 'Overwatch 2', 'Call of Duty: Warzone', 'Call of Duty: Modern Warfare III', 'Minecraft', 'Dota 2', 'PUBG: Battlegrounds', 'Rainbow Six Siege', 'Grand Theft Auto V', 'FIFA 24', 'EA Sports FC 24', 'Roblox', 'Teamfight Tactics', 'Escape from Tarkov', 'Lost Ark', 'World of Warcraft', 'Hearthstone', 'Genshin Impact', 'The Finals', 'Palworld', 'Brawl Stars', 'Mobile Legends', 'Arena of Valor', 'Smite', 'Destiny 2', 'Diablo IV', 'Elden Ring', 'Dark Souls III', 'Street Fighter 6', 'Tekken 8', 'Super Smash Bros. Ultimate', 'Splatoon 3', 'Animal Crossing: New Horizons', 'Pokémon Unite', 'Pokémon Scarlet/Violet', 'Mario Kart 8 Deluxe', 'Super Mario Bros. Wonder', 'Among Us', 'Fall Guys', 'Rust', 'ARK: Survival Evolved', 'Sea of Thieves', 'Phasmophobia', 'Dead by Daylight', 'The Legend of Zelda: Tears of the Kingdom', 'Cyberpunk 2077', 'Red Dead Redemption 2', 'Gray Zone Warfare', 'Hunt: Showdown', '1896', 'Dark and Darker', 'Other'
];

export const regions = [
  'NA East', 'NA West', 'LATAM North', 'LATAM South', 'EU West', 'EU East', 'ASIA', 'OCE', 'AFRICA'
];

export const languages = [
  'English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Russian', 'Turkish', 'Japanese', 'Korean', 'Chinese', 'Other'
];

export const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria',
  'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Czech Republic',
  'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany',
  'Ghana', 'Greece', 'Guatemala', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait',
  'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Nigeria', 'Norway', 'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia',
  'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam',
  'Other'
];

export const maxPlayersOptions = [2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 32, 50, 100];

// Helper to clean all empty rooms (no users)
import { supabase } from './supabaseClient';

export const cleanEmptyRooms = async () => {
  try {
    console.log('Fetching all rooms...');
    const { data: allRooms } = await supabase.from('rooms').select('id, name').eq('is_active', true);
    if (!allRooms) {
      console.log('No rooms found');
      return [];
    }
    
    console.log(`Found ${allRooms.length} rooms to check`);
    const deletedRoomIds = [];
    
    // Use the same logic as handleApply to get user counts
    const roomsWithUserCount = await Promise.all(
      allRooms.map(async (room) => {
        const { data: users } = await supabase
          .from('room_users')
          .select('id')
          .eq('room_id', room.id);
        return { ...room, user_count: users?.length || 0 };
      })
    );
    
    for (const room of roomsWithUserCount) {
      console.log(`Room ${room.name} (${room.id}): ${room.user_count} users`);
      
      if (room.user_count === 0) {
        console.log(`Deleting empty room: ${room.name}`);
        
        try {
          // Delete messages first
          const { error: messagesError } = await supabase.from('messages').delete().eq('room_id', room.id);
          if (messagesError) {
            console.error(`Error deleting messages for room ${room.name}:`, messagesError);
          } else {
            console.log(`Messages deleted for room: ${room.name}`);
          }
          
          // Delete room_users
          const { error: usersError } = await supabase.from('room_users').delete().eq('room_id', room.id);
          if (usersError) {
            console.error(`Error deleting room_users for room ${room.name}:`, usersError);
          } else {
            console.log(`Room_users deleted for room: ${room.name}`);
          }
          
          // Finally delete the room
          const { error: roomError, data: roomData } = await supabase.from('rooms').delete().eq('id', room.id).select();
          console.log(`Room deletion attempt for ${room.name}:`, { error: roomError, data: roomData });
          
          if (!roomError) {
            deletedRoomIds.push(room.id);
            console.log(`✅ Successfully deleted room from Supabase: ${room.name}`);
          } else {
            console.error(`❌ Failed to delete room ${room.name}:`, roomError);
          }
        } catch (error) {
          console.error(`Exception deleting room ${room.name}:`, error);
        }
      }
    }
    
    console.log(`Cleanup complete. Deleted ${deletedRoomIds.length} empty rooms.`);
    return deletedRoomIds;
  } catch (error) {
    console.error('Error cleaning empty rooms:', error);
    return [];
  }
};
