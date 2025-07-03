# Sistema de Like/Dislike - GameGoUp!

## Descripción
Se ha implementado un sistema de matching estilo Tinder en lugar del sistema tradicional de "Add Friend". Los usuarios ahora pueden evaluar a otros usuarios con "Me gusta" o "No me gusta" para crear conexiones más orgánicas.

## Características Implementadas

### 1. Nuevo Tab "Discover" (Descubrir)
- Reemplaza el tab "Add Friend"
- Muestra usuarios uno por uno para evaluar
- Interfaz estilo tarjeta con avatar y nombre de usuario

### 2. Sistema de Like/Dislike
- **💖 Me gusta**: Indica interés en el usuario
- **👎 No me gusta**: Pasa al siguiente usuario sin crear conexión
- Los usuarios evaluados no aparecen nuevamente

### 3. Detección de Matches
- Cuando dos usuarios se dan "Me gusta" mutuamente, se crea un **Match**
- Los matches automáticamente se convierten en amistades
- Notificación visual cuando ocurre un match: "🎉 ¡Es un Match con [username]!"

### 4. Filtros Inteligentes
- No muestra usuarios ya evaluados
- No muestra usuarios que ya son amigos
- No muestra el propio perfil del usuario

## Estructura de Base de Datos

### Nueva Tabla: `likes_dislikes`
```sql
CREATE TABLE likes_dislikes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_user_id)
);
```

### Vista de Matches: `matches_view`
Vista que identifica automáticamente los matches mutuos:
```sql
CREATE OR REPLACE VIEW matches_view AS
SELECT DISTINCT
    CASE WHEN l1.user_id < l2.user_id THEN l1.user_id ELSE l2.user_id END as user1_id,
    CASE WHEN l1.user_id < l2.user_id THEN l2.user_id ELSE l1.user_id END as user2_id,
    GREATEST(l1.created_at, l2.created_at) as matched_at
FROM likes_dislikes l1
JOIN likes_dislikes l2 ON (
    l1.user_id = l2.target_user_id 
    AND l1.target_user_id = l2.user_id
    AND l1.action = 'like' 
    AND l2.action = 'like'
)
WHERE l1.user_id != l2.user_id;
```

## Flujo de Usuario

1. **Acceder al Sistema**: Usuario entra en Friends & Messages → Tab "✨ Discover"
2. **Evaluar Usuarios**: Se presenta una tarjeta con un usuario
3. **Tomar Decisión**: 
   - Click en "💖 Me gusta" si hay interés
   - Click en "👎 No me gusta" para pasar al siguiente
4. **Match Automático**: Si hay reciprocidad, se notifica el match y se crea la amistad
5. **Continuar**: El sistema avanza automáticamente al siguiente usuario

## Estados de la Aplicación

### Estado Inicial
- Carga todos los usuarios disponibles para evaluar
- Filtra usuarios ya evaluados y amigos existentes
- Muestra contador: "Usuario X de Y"

### Estado de Evaluación
- Botones deshabilitados mientras se procesa la acción
- Feedback visual durante la carga
- Mensajes de confirmación

### Estado Final
- "¡Has visto a todos!" cuando no hay más usuarios
- Botón "🔄 Actualizar Lista" para recargar

## Ventajas del Nuevo Sistema

1. **Más Natural**: Simula apps de dating populares
2. **Menos Invasivo**: No hay solicitudes de amistad pendientes
3. **Automático**: Los matches se convierten en amistades instantáneamente
4. **Eficiente**: Evita la gestión manual de solicitudes
5. **Gamificado**: Más entretenido que un simple directorio

## Archivos Modificados

- `src/components/MessagingSystem.tsx`: Lógica principal del sistema
- `likes_dislikes_schema.sql`: Esquema de base de datos
- Nuevas interfaces TypeScript para `UserToRate`

## Próximos Pasos Sugeridos

1. Implementar sistema de geolocalización para matches por proximidad
2. Agregar filtros por edad, intereses, juegos favoritos
3. Implementar "Super Likes" como feature premium
4. Agregar animaciones de transición entre usuarios
5. Sistema de reportes para usuarios inapropiados
