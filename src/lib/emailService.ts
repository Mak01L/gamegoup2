// Email service for sending feedback notifications
// This can be integrated with various email services

export interface EmailData {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  feedback_data: any;
  created_at: string;
}

// Simple email service using EmailJS (free option)
export const sendEmailNotification = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Option 1: Using EmailJS (recommended for simplicity)
    // You need to set up EmailJS account and get these values:
    const EMAILJS_SERVICE_ID = 'your_service_id';
    const EMAILJS_TEMPLATE_ID = 'your_template_id';
    const EMAILJS_PUBLIC_KEY = 'your_public_key';
    
    // EmailJS template parameters
    const templateParams = {
      to_email: 'mak01live@protonmail.com',
      subject: emailData.subject,
      message: emailData.body,
      from_name: 'GameGoUp System',
      reply_to: 'noreply@gamegroup.com'
    };

    // Uncomment when you set up EmailJS
    /*
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams
      })
    });

    return response.ok;
    */

    // Option 2: Using Webhook to external service
    // You can use services like Zapier, Make.com, or n8n
    const webhookUrl = 'https://hooks.zapier.com/hooks/catch/your-webhook-id/';
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'mak01live@protonmail.com',
        subject: emailData.subject,
        body: emailData.body,
        feedback_data: emailData.feedback_data,
        timestamp: emailData.created_at
      })
    });

    return webhookResponse.ok;

  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Function to process pending emails from Supabase
export const processPendingEmails = async () => {
  try {
    const { supabase } = await import('./supabaseClient');
    
    // Get pending emails
    const { data: pendingEmails, error } = await supabase
      .rpc('get_pending_emails');

    if (error) {
      console.error('Error getting pending emails:', error);
      return;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('No pending emails to process');
      return;
    }

    console.log(`Processing ${pendingEmails.length} pending emails...`);

    // Process each email
    for (const email of pendingEmails) {
      try {
        const success = await sendEmailNotification(email);
        
        if (success) {
          // Mark as sent
          await supabase.rpc('mark_email_sent', { email_id: email.id });
          console.log(`Email sent successfully: ${email.subject}`);
        } else {
          // Increment attempts
          await supabase.rpc('increment_email_attempts', { email_id: email.id });
          console.log(`Failed to send email: ${email.subject}`);
        }
      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error);
        await supabase.rpc('increment_email_attempts', { email_id: email.id });
      }
    }
  } catch (error) {
    console.error('Error in processPendingEmails:', error);
  }
};

// Auto-process emails every 5 minutes (optional)
export const startEmailProcessor = () => {
  // Process immediately
  processPendingEmails();
  
  // Then every 5 minutes
  setInterval(processPendingEmails, 5 * 60 * 1000);
  
  console.log('Email processor started - checking every 5 minutes');
};