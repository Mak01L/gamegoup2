import { supabase } from './supabaseClient';
import { realtimeManager } from './supabaseRealtimeManager';

export interface RealtimeDiagnostics {
  supabaseUrl: string;
  isConnected: boolean;
  authUser: any;
  realtimeStats: any;
  networkTest: {
    restApi: boolean;
    websocket: boolean;
  };
  recommendations: string[];
}

/**
 * Ejecuta un diagnóstico completo del sistema Realtime
 */
export async function diagnoseRealtimeIssues(): Promise<RealtimeDiagnostics> {
  const diagnostics: RealtimeDiagnostics = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'default',
    isConnected: false,
    authUser: null,
    realtimeStats: {},
    networkTest: {
      restApi: false,
      websocket: false
    },
    recommendations: []
  };

  try {
    // 1. Verificar conexión REST API
    console.log('🔍 [Diagnóstico] Probando conexión REST API...');
    const { data: testData, error: restError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
    
    diagnostics.networkTest.restApi = !restError;
    
    if (restError) {
      diagnostics.recommendations.push('❌ REST API falló: ' + restError.message);
    } else {
      console.log('✅ [Diagnóstico] REST API funcionando correctamente');
    }

    // 2. Verificar usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    diagnostics.authUser = user;
    
    if (!user) {
      diagnostics.recommendations.push('⚠️ No hay usuario autenticado - Realtime requiere autenticación');
    } else {
      console.log('✅ [Diagnóstico] Usuario autenticado:', user.email);
    }

    // 3. Obtener estadísticas del manager de Realtime
    diagnostics.realtimeStats = realtimeManager.getStats();
    console.log('📊 [Diagnóstico] Stats Realtime:', diagnostics.realtimeStats);

    // 4. Test básico de WebSocket (crear canal temporal)
    console.log('🔍 [Diagnóstico] Probando conexión WebSocket...');
    
    const testPromise = new Promise<boolean>((resolve) => {
      const testChannel = supabase
        .channel('diagnostic-test')
        .subscribe((status, error) => {
          console.log('🧪 [Diagnóstico] Test WebSocket status:', status);
          
          if (status === 'SUBSCRIBED') {
            diagnostics.networkTest.websocket = true;
            supabase.removeChannel(testChannel);
            resolve(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            diagnostics.networkTest.websocket = false;
            if (error) {
              diagnostics.recommendations.push('❌ WebSocket falló: ' + error.message);
            }
            supabase.removeChannel(testChannel);
            resolve(false);
          }
        });
      
      // Timeout después de 10 segundos
      setTimeout(() => {
        diagnostics.networkTest.websocket = false;
        diagnostics.recommendations.push('⏱️ WebSocket timeout - posible problema de firewall o red');
        supabase.removeChannel(testChannel);
        resolve(false);
      }, 10000);
    });

    await testPromise;

    // 5. Analizar y generar recomendaciones
    diagnostics.isConnected = diagnostics.networkTest.restApi && diagnostics.networkTest.websocket;

    if (!diagnostics.networkTest.websocket) {
      diagnostics.recommendations.push(
        '🔧 WebSocket bloqueado - Verifica firewall, proxy o VPN',
        '🌐 Prueba desde otra red (hotspot móvil)',
        '⚙️ Verifica que Realtime esté habilitado en Supabase Dashboard'
      );
    }

    if (diagnostics.realtimeStats.retryCount > 0) {
      diagnostics.recommendations.push(
        `🔄 ${diagnostics.realtimeStats.retryCount} reintentos de conexión detectados`,
        '📡 Conexión inestable - considera aumentar timeouts'
      );
    }

    // 6. Recomendaciones específicas del entorno
    if (window.location.hostname === 'localhost') {
      diagnostics.recommendations.push(
        '🏠 Ejecutándose en localhost - algunos ISPs bloquean WebSockets locales',
        '🚀 Prueba desplegando en un servidor para verificar funcionamiento'
      );
    }

  } catch (error) {
    console.error('💥 [Diagnóstico] Error durante diagnóstico:', error);
    diagnostics.recommendations.push('💥 Error inesperado: ' + (error as Error).message);
  }

  return diagnostics;
}

/**
 * Muestra diagnóstico en consola de manera legible
 */
export function printDiagnostics(diagnostics: RealtimeDiagnostics): void {
  console.group('🔬 DIAGNÓSTICO SUPABASE REALTIME');
  
  console.log('🔗 URL Supabase:', diagnostics.supabaseUrl);
  console.log('👤 Usuario autenticado:', diagnostics.authUser?.email || 'No');
  console.log('📊 Estado general:', diagnostics.isConnected ? '✅ CONECTADO' : '❌ DESCONECTADO');
  
  console.group('🌐 Tests de Red');
  console.log('REST API:', diagnostics.networkTest.restApi ? '✅' : '❌');
  console.log('WebSocket:', diagnostics.networkTest.websocket ? '✅' : '❌');
  console.groupEnd();
  
  console.group('📈 Estadísticas Realtime');
  console.log('Canales activos:', diagnostics.realtimeStats.activeChannels);
  console.log('Estado conexión:', diagnostics.realtimeStats.connectionStatus);
  console.log('Reintentos:', diagnostics.realtimeStats.retryCount);
  console.groupEnd();
  
  if (diagnostics.recommendations.length > 0) {
    console.group('💡 Recomendaciones');
    diagnostics.recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Función de utilidad para ejecutar diagnóstico completo
 */
export async function runCompleteDiagnostic(): Promise<void> {
  console.log('🚀 [Diagnóstico] Iniciando diagnóstico completo...');
  
  const diagnostics = await diagnoseRealtimeIssues();
  printDiagnostics(diagnostics);
  
  // Hacer disponible globalmente para debugging
  (window as any).supabaseRealtimeDiagnostics = diagnostics;
  
  console.log('💾 Diagnóstico guardado en window.supabaseRealtimeDiagnostics');
}

// Función disponible globalmente para debugging
if (typeof window !== 'undefined' && import.meta.env.VITE_DEBUG === 'true') {
  (window as any).diagnoseSupabaseRealtime = runCompleteDiagnostic;
}
