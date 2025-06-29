-- Agregar campo de orientación sexual a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sexual_orientation VARCHAR(30);

-- Agregar índice para mejorar performance en búsquedas
CREATE INDEX IF NOT EXISTS idx_profiles_sexual_orientation ON profiles(sexual_orientation);

-- Actualizar la tabla user_search_filters para incluir orientaciones sexuales
ALTER TABLE user_search_filters 
ADD COLUMN IF NOT EXISTS sexual_orientation_preferences TEXT[];