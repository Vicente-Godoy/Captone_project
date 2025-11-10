/**
 * Utilidad para manejo de errores en el frontend
 * Proporciona funciones para manejar errores de red, validación y otros tipos
 */

/**
 * Clasifica y formatea errores de la API
 */
export function formatApiError(error) {
  // Error de red
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Error de conexión. Verifica tu conexión a internet.',
      retryable: true
    };
  }

  // Error de respuesta HTTP
  if (error.response || (error.status && error.status >= 400)) {
    const status = error.status || error.response?.status;
    const data = error.data || error.response?.data;

    if (status === 401) {
      return {
        type: 'auth',
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        retryable: false
      };
    }

    if (status === 403) {
      return {
        type: 'permission',
        message: 'No tienes permisos para realizar esta acción.',
        retryable: false
      };
    }

    if (status === 404) {
      return {
        type: 'notFound',
        message: 'El recurso solicitado no existe.',
        retryable: false
      };
    }

    if (status >= 500) {
      return {
        type: 'server',
        message: 'Error del servidor. Por favor, intenta más tarde.',
        retryable: true
      };
    }

    return {
      type: 'client',
      message: data?.error || data?.message || 'Error al procesar la solicitud.',
      retryable: false,
      details: data?.details
    };
  }

  // Error genérico
  return {
    type: 'unknown',
    message: error.message || 'Ha ocurrido un error inesperado.',
    retryable: false
  };
}

/**
 * Wrapper para fetch con manejo de errores mejorado y retry automático
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  const { retryDelay = 1000, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      const formattedError = formatApiError(error);

      // Si no es retryable o ya intentamos todas las veces, lanzar error
      if (!formattedError.retryable || attempt === maxRetries) {
        throw formattedError;
      }

      // Esperar antes de reintentar (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Hook para manejar errores en componentes React
 */
export function useErrorHandler() {
  const handleError = (error, context = '') => {
    const formattedError = formatApiError(error);
    
    console.error(`[ERROR HANDLER] ${context}:`, {
      error: formattedError,
      original: error
    });

    // Aquí podrías integrar con un servicio de logging como Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, context);
    // }

    return formattedError;
  };

  return { handleError };
}



