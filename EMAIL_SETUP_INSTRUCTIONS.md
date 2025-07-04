# 📧 Email Configuration for GameGoUp

Feedback reports will be automatically sent to **mak01live@protonmail.com**

## 🚀 OPTION 1: EmailJS (Easier - RECOMMENDED)

### Step 1: Create EmailJS account
1. Go to [emailjs.com](https://www.emailjs.com/)
2. Create free account
3. Create an email service (Gmail, Outlook, etc.)

### Step 2: Configure template
Create a template with these fields:
```
To: {{to_email}}
Subject: {{subject}}
From: {{from_name}}
Message: {{message}}
```

### Step 3: Get credentials
- Service ID: `service_xxxxxxx`
- Template ID: `template_xxxxxxx`
- Public Key: `user_xxxxxxxxxxxxxxx`

### Step 4: Update code
In `src/lib/emailService.ts`, replace:
```typescript
const EMAILJS_SERVICE_ID = 'tu_service_id';
const EMAILJS_TEMPLATE_ID = 'tu_template_id';
const EMAILJS_PUBLIC_KEY = 'tu_public_key';
```

## 🔗 OPTION 2: Zapier Webhook (Alternative)

### Step 1: Create Zap in Zapier
1. Go to [zapier.com](https://zapier.com/)
2. Create new Zap
3. Trigger: Webhook - Catch Hook
4. Action: Email - Send Outbound Email

### Step 2: Configure webhook
- Copy the webhook URL
- In `emailService.ts`, replace `webhookUrl`

### Step 3: Configure email
- To: `mak01live@protonmail.com`
- Subject: `{{subject}}`
- Body: `{{body}}`

## 📋 SUPABASE CONFIGURATION

### Execute SQLs:
1. `feedback_system.sql` (already executed)
2. `email_webhook_setup.sql` (new - execute this one)

### Verify created tables:
- ✅ `user_feedback`
- ✅ `admin_notifications`
- ✅ `email_queue`

## 🧪 TEST THE SYSTEM

### 1. Send test feedback:
- Go to your GameGoUp app
- Click "🐛 Feedback" button
- Send a test report

### 2. Verify in Supabase:
```sql
-- View received feedback
SELECT * FROM user_feedback ORDER BY created_at DESC LIMIT 5;

-- View emails in queue
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;

-- View notifications
SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 5;
```

### 3. Verify email:
- Check your inbox: `mak01live@protonmail.com`
- Look for emails from GameGoUp

## 🔧 EMAIL FORMAT YOU'LL RECEIVE:

```
Subject: [GameGoUp] 🐛 Bug Report - Report Title

Body:
New feedback received on GameGoUp!

📋 DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  Type: 🐛 BUG
⚡ Priority: 🚨 CRITICAL
👤 User: user@email.com
📅 Date: 2024-01-15 14:30:25 UTC
🆔 ID: report-uuid

📝 TITLE:
The join button doesn't work

📄 DESCRIPTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When I click join, nothing happens...

🔗 QUICK ACTIONS:
• View in Supabase: https://supabase.com/dashboard/...
• Admin Panel: https://your-domain.com/admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GameGoUp Feedback System 🎮
```

## ⚡ ENABLE AUTOMATIC EMAILS

In your `src/pages/Home.tsx` or `src/App.tsx`, add:

```typescript
import { startEmailProcessor } from './lib/emailService';

// In useEffect or when starting the app
useEffect(() => {
  startEmailProcessor();
}, []);
```

## 🎯 FINAL RESULT:

✅ **Feedback sent** → **Automatic email** → **mak01live@protonmail.com**
✅ **Types**: Bugs 🐛, Games 🎮, Features ✨, Improvements 🔧
✅ **Priorities**: Critical 🚨, High ⚠️, Medium 📋, Low 📝
✅ **Complete information**: User, date, detailed description

You now have everything configured to receive feedback automatically! 🚀