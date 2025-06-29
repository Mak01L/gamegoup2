# 📧 Configuración de Emails para GameGoUp

Los reportes de feedback se enviarán automáticamente a **mak01live@protonmail.com**

## 🚀 OPCIÓN 1: EmailJS (Más Fácil - RECOMENDADA)

### Paso 1: Crear cuenta EmailJS
1. Ve a [emailjs.com](https://www.emailjs.com/)
2. Crea cuenta gratuita
3. Crea un servicio de email (Gmail, Outlook, etc.)

### Paso 2: Configurar template
Crea un template con estos campos:
```
To: {{to_email}}
Subject: {{subject}}
From: {{from_name}}
Message: {{message}}
```

### Paso 3: Obtener credenciales
- Service ID: `service_xxxxxxx`
- Template ID: `template_xxxxxxx`
- Public Key: `user_xxxxxxxxxxxxxxx`

### Paso 4: Actualizar código
En `src/lib/emailService.ts`, reemplaza:
```typescript
const EMAILJS_SERVICE_ID = 'tu_service_id';
const EMAILJS_TEMPLATE_ID = 'tu_template_id';
const EMAILJS_PUBLIC_KEY = 'tu_public_key';
```

## 🔗 OPCIÓN 2: Zapier Webhook (Alternativa)

### Paso 1: Crear Zap en Zapier
1. Ve a [zapier.com](https://zapier.com/)
2. Crea nuevo Zap
3. Trigger: Webhook - Catch Hook
4. Action: Email - Send Outbound Email

### Paso 2: Configurar webhook
- Copia la URL del webhook
- En `emailService.ts`, reemplaza `webhookUrl`

### Paso 3: Configurar email
- To: `mak01live@protonmail.com`
- Subject: `{{subject}}`
- Body: `{{body}}`

## 📋 CONFIGURACIÓN EN SUPABASE

### Ejecutar SQLs:
1. `feedback_system.sql` (ya ejecutado)
2. `email_webhook_setup.sql` (nuevo - ejecutar este)

### Verificar tablas creadas:
- ✅ `user_feedback`
- ✅ `admin_notifications`
- ✅ `email_queue`

## 🧪 PROBAR EL SISTEMA

### 1. Enviar feedback de prueba:
- Ve a tu app GameGoUp
- Click en botón "🐛 Feedback"
- Envía un reporte de prueba

### 2. Verificar en Supabase:
```sql
-- Ver feedback recibido
SELECT * FROM user_feedback ORDER BY created_at DESC LIMIT 5;

-- Ver emails en cola
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;

-- Ver notificaciones
SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 5;
```

### 3. Verificar email:
- Revisa tu bandeja: `mak01live@protonmail.com`
- Busca emails de GameGoUp

## 🔧 FORMATO DEL EMAIL QUE RECIBIRÁS:

```
Subject: [GameGoUp] 🐛 Bug Report - Título del reporte

Body:
New feedback received on GameGoUp!

📋 DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  Type: 🐛 BUG
⚡ Priority: 🚨 CRITICAL
👤 User: usuario@email.com
📅 Date: 2024-01-15 14:30:25 UTC
🆔 ID: uuid-del-reporte

📝 TITLE:
El botón de join no funciona

📄 DESCRIPTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cuando hago click en join, no pasa nada...

🔗 QUICK ACTIONS:
• View in Supabase: https://supabase.com/dashboard/...
• Admin Panel: https://your-domain.com/admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GameGoUp Feedback System 🎮
```

## ⚡ ACTIVAR EMAILS AUTOMÁTICOS

En tu `src/pages/Home.tsx` o `src/App.tsx`, agrega:

```typescript
import { startEmailProcessor } from './lib/emailService';

// En useEffect o al iniciar la app
useEffect(() => {
  startEmailProcessor();
}, []);
```

## 🎯 RESULTADO FINAL:

✅ **Feedback enviado** → **Email automático** → **mak01live@protonmail.com**
✅ **Tipos**: Bugs 🐛, Games 🎮, Features ✨, Improvements 🔧
✅ **Prioridades**: Critical 🚨, High ⚠️, Medium 📋, Low 📝
✅ **Información completa**: Usuario, fecha, descripción detallada

¡Ya tienes todo configurado para recibir feedback automáticamente! 🚀