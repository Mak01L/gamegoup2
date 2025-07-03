// Shared options for filters and room creation

export const games = [
  'Valorant', 'League of Legends', 'Counter-Strike 2', 'Counter-Strike: Global Offensive', 'Fortnite', 'Apex Legends', 'Rocket League', 'Overwatch 2', 'Call of Duty: Warzone', 'Call of Duty: Modern Warfare III', 'Minecraft', 'Dota 2', 'PUBG: Battlegrounds', 'Rainbow Six Siege', 'Grand Theft Auto V', 'FIFA 24', 'EA Sports FC 24', 'Roblox', 'Teamfight Tactics', 'Escape from Tarkov', 'Lost Ark', 'World of Warcraft', 'Hearthstone', 'Genshin Impact', 'The Finals', 'Palworld', 'Brawl Stars', 'Mobile Legends', 'Arena of Valor', 'Smite', 'Destiny 2', 'Diablo IV', 'Elden Ring', 'Dark Souls III', 'Street Fighter 6', 'Tekken 8', 'Super Smash Bros. Ultimate', 'Splatoon 3', 'Animal Crossing: New Horizons', 'Pokémon Unite', 'Pokémon Scarlet/Violet', 'Mario Kart 8 Deluxe', 'Super Mario Bros. Wonder', 'Among Us', 'Fall Guys', 'Rust', 'ARK: Survival Evolved', 'Sea of Thieves', 'Phasmophobia', 'Dead by Daylight', 'The Legend of Zelda: Tears of the Kingdom', 'Cyberpunk 2077', 'Red Dead Redemption 2', 'Gray Zone Warfare', 'Hunt: Showdown', '1896', 'Dark and Darker',
  // --- NUEVOS Y CLÁSICOS AGREGADOS ---
  'Helldivers 2', 'Helldivers', 'Hades', 'Hades II', 'Stardew Valley', 'Terraria', 'The Witcher 3: Wild Hunt', 'The Witcher 2', 'The Witcher', 'Baldur\'s Gate 3', 'Monster Hunter World', 'Monster Hunter Rise', 'Persona 5 Royal', 'Persona 3 Reload', 'Persona 4 Golden', 'Final Fantasy VII Rebirth', 'Final Fantasy VII Remake', 'Final Fantasy XIV', 'Final Fantasy XVI', 'Final Fantasy XV', 'Final Fantasy X', 'Final Fantasy IX', 'Final Fantasy VI', 'The Sims 4', 'The Sims 3', 'The Sims 2', 'The Sims', 'Starfield', 'Star Wars Jedi: Survivor', 'Star Wars Battlefront II', 'Star Wars: The Old Republic', 'Gran Turismo 7', 'Forza Horizon 5', 'Forza Motorsport', 'Mario Party Superstars', 'Super Mario Odyssey', 'Super Mario 3D World', 'The Legend of Zelda: Breath of the Wild', 'The Legend of Zelda: Ocarina of Time', 'The Legend of Zelda: Majora\'s Mask', 'The Legend of Zelda: Link\'s Awakening', 'Metroid Dread', 'Metroid Prime Remastered', 'Splatoon 2', 'Splatoon', 'Tetris', 'Pac-Man', 'DOOM', 'DOOM Eternal', 'Quake', 'Half-Life', 'Half-Life 2', 'Portal', 'Portal 2', 'Left 4 Dead 2', 'Left 4 Dead', 'Team Fortress 2', 'Garry\'s Mod', 'Paladins', 'Warframe', 'War Thunder', 'World of Tanks', 'World of Warships', 'Clash Royale', 'Clash of Clans', 'Candy Crush Saga', 'Subway Surfers', 'Geometry Dash', 'Hollow Knight', 'Cuphead', 'Celeste', 'Ori and the Blind Forest', 'Ori and the Will of the Wisps', 'Dead Cells', 'Helltaker', 'Undertale', 'Deltarune', 'Slay the Spire', 'Vampire Survivors', 'Lethal Company', 'Lies of P', 'PAYDAY 3', 'PAYDAY 2', 'No Man\'s Sky', 'ARK: Survival Ascended', 'Sons of the Forest', 'The Forest', 'It Takes Two', 'A Way Out', 'Unravel 2', 'Little Nightmares', 'Little Nightmares II', 'Inside', 'Limbo', 'Spiritfarer', 'Spiritfarer: Farewell Edition', 'Returnal', 'Control', 'Alan Wake 2', 'Alan Wake', 'Death Stranding', 'Ghost of Tsushima', 'Sekiro: Shadows Die Twice', 'Bloodborne', 'Nioh', 'Nioh 2', 'Monster Hunter Stories 2', 'Monster Hunter Generations Ultimate', 'Pokémon Legends: Arceus', 'Pokémon Sword/Shield', 'Pokémon GO', 'Pokémon Masters EX', 'Pokémon Café ReMix', 'Pokémon TCG Live', 'Pokémon HOME', 'Pokémon Quest', 'Pokémon Sleep', 'Pokémon Mystery Dungeon DX', 'Pokémon Brilliant Diamond/Shining Pearl', 'Pokémon Let\'s Go Pikachu/Eevee', 'Pokémon Sun/Moon', 'Pokémon X/Y', 'Pokémon Black/White', 'Pokémon HeartGold/SoulSilver', 'Pokémon Platinum', 'Pokémon Emerald', 'Pokémon FireRed/LeafGreen', 'Pokémon Crystal', 'Pokémon Yellow', 'Pokémon Red/Blue', 'Fire Emblem Engage', 'Fire Emblem: Three Houses', 'Fire Emblem Heroes', 'Advance Wars 1+2: Re-Boot Camp', 'Advance Wars', 'Animal Crossing: Pocket Camp', 'Animal Crossing: Wild World', 'Animal Crossing: New Leaf', 'Animal Crossing: City Folk', 'Animal Crossing', 'Mario Tennis Aces', 'Mario Golf: Super Rush', 'Mario Strikers: Battle League', 'Mario + Rabbids Sparks of Hope', 'Mario + Rabbids Kingdom Battle', 'Luigi\'s Mansion 3', 'Luigi\'s Mansion: Dark Moon', 'Luigi\'s Mansion', 'Kirby and the Forgotten Land', 'Kirby Star Allies', 'Kirby Fighters 2', 'Kirby\'s Dream Buffet', 'Kirby\'s Return to Dream Land Deluxe', 'Kirby: Planet Robobot', 'Kirby: Triple Deluxe', 'Kirby\'s Epic Yarn', 'Kirby Super Star', 'Kirby\'s Adventure', 'Metroid Fusion', 'Metroid: Samus Returns', 'Metroid Zero Mission', 'Metroid Prime 2: Echoes', 'Metroid Prime 3: Corruption', 'Metroid Prime Hunters', 'Metroid Prime Pinball', 'Metroid II: Return of Samus', 'Metroid', 'Castlevania: Symphony of the Night', 'Castlevania: Aria of Sorrow', 'Castlevania: Dawn of Sorrow', 'Castlevania: Circle of the Moon', 'Castlevania: Harmony of Dissonance', 'Castlevania: Portrait of Ruin', 'Castlevania: Order of Ecclesia', 'Castlevania: Rondo of Blood', 'Castlevania', 'Persona Q2: New Cinema Labyrinth', 'Persona Q: Shadow of the Labyrinth', 'Persona 5 Strikers', 'Persona 5: Dancing in Starlight', 'Persona 4: Dancing All Night', 'Persona 3: Dancing in Moonlight', 'Persona 4 Arena Ultimax', 'Persona 4 Arena', 'Persona 3 Portable', 'Persona 3 FES', 'Persona 2: Innocent Sin', 'Persona 2: Eternal Punishment', 'Persona', 'Shin Megami Tensei V', 'Shin Megami Tensei IV', 'Shin Megami Tensei III: Nocturne', 'Shin Megami Tensei: Strange Journey', 'Shin Megami Tensei: Devil Survivor', 'Shin Megami Tensei: Devil Summoner', 'Shin Megami Tensei', 'Yakuza: Like a Dragon', 'Yakuza 0', 'Yakuza Kiwami', 'Yakuza Kiwami 2', 'Yakuza 3', 'Yakuza 4', 'Yakuza 5', 'Yakuza 6', 'Yakuza: Dead Souls', 'Yakuza: Ishin!', 'Yakuza: Judgment', 'Yakuza: Lost Judgment', 'Persona 5 Tactica', 'Persona 5 Scramble',
  // --- NEW LAYER OF ONLINE AND PARTY GAMES ---
  'ReMatch', 'Pummel Party', 'Golf With Your Friends', 'Move or Die', 'Ultimate Chicken Horse', 'Gang Beasts', 'Human: Fall Flat', 'Unrailed!', 'Project Winter', 'Deep Rock Galactic', 'Risk of Rain 2', 'Risk of Rain Returns', 'For The King', 'For The King II', 'Barotrauma', 'Raft', 'Valheim', 'V Rising', 'Don\'t Starve Together', 'Unturned', 'Totally Accurate Battlegrounds', 'Totally Accurate Battle Simulator', 'Muck', 'Bloons TD 6', 'Bloons TD Battles 2', 'Bloons TD Battles', 'ShellShock Live', 'Worms W.M.D', 'Worms Armageddon', 'Worms Reloaded', 'Worms Rumble', 'UNO', 'Monopoly Plus', 'Tricky Towers', 'SpeedRunners', 'Castle Crashers', 'Magicka', 'Magicka 2', 'Keep Talking and Nobody Explodes', 'Tabletop Simulator', 'Jackbox Party Pack 10', 'Jackbox Party Pack 9', 'Jackbox Party Pack 8', 'Jackbox Party Pack 7', 'Jackbox Party Pack 6', 'Jackbox Party Pack 5', 'Jackbox Party Pack 4', 'Jackbox Party Pack 3', 'Jackbox Party Pack 2', 'Jackbox Party Pack 1', 'Quiplash', 'Drawful 2', 'Fibbage', 'Mortal Kombat 1', 'Mortal Kombat 11', 'Mortal Kombat X', 'Mortal Kombat 9', 'Brawlhalla', 'MultiVersus', 'Nickelodeon All-Star Brawl', 'Rivals of Aether', 'Slap City', 'TowerFall Ascension', 'Nidhogg', 'Nidhogg 2', 'Duck Game', 'Speed Brawl', 'Hyper Light Drifter', 'Noita', 'Risk of Rain', 'BattleBlock Theater', 'Portal Knights', 'Portal Stories: Mel', 'Portal Reloaded', 'Portal Revolution', 'Payday: The Heist', 'Other'
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

export const systems = [
  'PC',
  'PlayStation 5',
  'PlayStation 4',
  'PlayStation 3',
  'Xbox Series X|S',
  'Xbox One',
  'Xbox 360',
  'Nintendo Switch 2', // Added
  'Nintendo Switch',
  'Nintendo Wii U',
  'Nintendo Wii',
  'Nintendo 3DS',
  'Nintendo DS',
  'Steam Deck',
  'Mobile (iOS/Android)',
  'Meta Quest',
  'PlayStation VR2',
  'PlayStation VR',
  'Xbox Cloud Gaming',
  'GeForce NOW',
  'Amazon Luna',
  'Google Stadia (legacy)',
  'Other'
];

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
