-- Agregar campos adicionales a la tabla profiles existente
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS connection_types TEXT[],
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS conversation_style VARCHAR(50),
ADD COLUMN IF NOT EXISTS availability_hours TEXT[];

-- Tabla de swipes/decisiones de usuarios
CREATE TABLE IF NOT EXISTS user_swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  swiper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'pass')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- Tabla de matches entre usuarios
CREATE TABLE IF NOT EXISTS user_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  chat_started BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user1_id, user2_id)
);

-- Tabla de filtros de búsqueda guardados
CREATE TABLE IF NOT EXISTS user_search_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_types TEXT[],
  gender_preferences TEXT[],
  countries TEXT[],
  cities JSONB,
  games TEXT[],
  interests TEXT[],
  languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de presets de filtros
CREATE TABLE IF NOT EXISTS user_filter_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_user_swipes_swiper ON user_swipes(swiper_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_swipes_swiped ON user_swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_users ON user_matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_connection_types ON profiles USING GIN(connection_types);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING GIN(interests);

-- RLS (Row Level Security) Policies
ALTER TABLE user_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_filter_presets ENABLE ROW LEVEL SECURITY;

-- Políticas para user_swipes
CREATE POLICY "Users can view their own swipes" ON user_swipes
  FOR SELECT USING (auth.uid() = swiper_id);

CREATE POLICY "Users can create their own swipes" ON user_swipes
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Políticas para user_matches
CREATE POLICY "Users can view their matches" ON user_matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches" ON user_matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their matches" ON user_matches
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas para user_search_filters
CREATE POLICY "Users can manage their search filters" ON user_search_filters
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para user_filter_presets
CREATE POLICY "Users can manage their filter presets" ON user_filter_presets
  FOR ALL USING (auth.uid() = user_id);

-- Función para crear match automático cuando hay like mutuo
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si es un 'like'
  IF NEW.action = 'like' THEN
    -- Verificar si el otro usuario ya nos dio like
    IF EXISTS (
      SELECT 1 FROM user_swipes 
      WHERE swiper_id = NEW.swiped_id 
      AND swiped_id = NEW.swiper_id 
      AND action = 'like'
    ) THEN
      -- Crear el match
      INSERT INTO user_matches (user1_id, user2_id, matched_at, is_active)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id),
        NOW(),
        TRUE
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
      
      -- Crear notificaciones para ambos usuarios
      INSERT INTO notification_queue (user_id, type, title, message, data)
      VALUES 
        (NEW.swiper_id, 'match', '¡Nuevo Match!', 'Tienes una nueva conexión', 
         jsonb_build_object('match_user_id', NEW.swiped_id)),
        (NEW.swiped_id, 'match', '¡Nuevo Match!', 'Tienes una nueva conexión', 
         jsonb_build_object('match_user_id', NEW.swiper_id));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear matches automáticamente
CREATE TRIGGER create_match_on_mutual_like_trigger
  AFTER INSERT ON user_swipes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_mutual_like();

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en user_search_filters
CREATE TRIGGER update_user_search_filters_updated_at
  BEFORE UPDATE ON user_search_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();