-- Tabla de conversaciones privadas
CREATE TABLE IF NOT EXISTS private_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Tabla de mensajes privados
CREATE TABLE IF NOT EXISTS private_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES private_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  reply_to_message_id UUID REFERENCES private_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Tabla de archivos adjuntos
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES private_messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_name TEXT,
  file_size INTEGER
);

-- Tabla de relaciones de amistad
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(50) DEFAULT 'friend',
  is_favorite BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Tabla de solicitudes de amistad
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de estados de usuario
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'invisible', 'offline')),
  activity TEXT,
  game_playing TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de invitaciones a salas
CREATE TABLE IF NOT EXISTS room_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de configuración de notificaciones
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES private_conversations(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  mention_only BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME
);

-- Tabla de cola de notificaciones
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN DEFAULT FALSE
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_private_conversations_users ON private_conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_conversation ON private_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_room_invitations_receiver ON room_invitations(receiver_id, status);

-- RLS (Row Level Security) Policies
ALTER TABLE private_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas para private_conversations
CREATE POLICY "Users can view their own conversations" ON private_conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations" ON private_conversations
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas para private_messages
CREATE POLICY "Users can view messages in their conversations" ON private_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM private_conversations 
      WHERE id = conversation_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON private_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM private_conversations 
      WHERE id = conversation_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Políticas para friendships
CREATE POLICY "Users can view their friendships" ON friendships
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

-- Políticas para friend_requests
CREATE POLICY "Users can view their friend requests" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received friend requests" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Función para actualizar last_message_at en conversaciones
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE private_conversations 
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp automáticamente
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON private_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();