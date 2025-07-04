// Añadir al sistema de silenciado de errores
// En src/lib/immediateAdSenseErrorInterception.ts

// Silenciar también errores de WebSocket no críticos
if (message.includes('WebSocket connection') ||
    message.includes('CHANNEL_ERROR') ||
    message.includes('Max retry attempts reached') ||
    message.includes('Subscription status')) {
  
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.warn('🔇 [WebSocket] Error de conexión silenciado (no crítico)');
  }
  return; // Silenciado
}
