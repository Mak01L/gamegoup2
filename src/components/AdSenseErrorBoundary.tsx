import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary específico para componentes AdSense
 * Captura y maneja errores relacionados con DOM y AdSense
 */
class AdSenseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Verificar si es un error relacionado con AdSense/DOM
    const errorMessage = error.message || '';
    const isAdSenseError = errorMessage.includes('TagError') ||
                          errorMessage.includes('adsbygoogle') ||
                          errorMessage.includes('Failed to execute \'removeChild\' on \'Node\'') ||
                          errorMessage.includes('The node to be removed is not a child of this node') ||
                          errorMessage.includes('NotFoundError');

    if (isAdSenseError) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.warn('🔇 [ERROR_BOUNDARY] AdSense/DOM error capturado y silenciado:', error);
      }
      
      // Retornar estado de error manejado para renderizar fallback
      return { hasError: true, error };
    }

    // Para otros errores, dejar que se propaguen
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMessage = error.message || '';
    const isAdSenseError = errorMessage.includes('TagError') ||
                          errorMessage.includes('adsbygoogle') ||
                          errorMessage.includes('Failed to execute \'removeChild\' on \'Node\'') ||
                          errorMessage.includes('The node to be removed is not a child of this node') ||
                          errorMessage.includes('NotFoundError');

    if (isAdSenseError) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.warn('🔇 [ERROR_BOUNDARY] AdSense error details:', {
          error: error.message,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Renderizar fallback UI para errores de AdSense
      return this.props.fallback || (
        <div style={{
          width: '100%',
          minHeight: 90,
          background: 'linear-gradient(90deg, #232046 0%, #3B2F6B 100%)',
          borderRadius: 14,
          boxShadow: '0 2px 12px #A78BFA22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 0 18px 0',
          color: '#A78BFA',
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 1,
          opacity: 0.7,
          border: '1.5px dashed #7C5CFA44'
        }}>
          <span style={{ textAlign: 'center', padding: '10px' }}>
            Ad Space
          </span>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdSenseErrorBoundary;
