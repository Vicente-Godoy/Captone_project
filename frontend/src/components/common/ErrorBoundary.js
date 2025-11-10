import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Here you could also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>
            ¡Oops! Algo salió mal
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              textAlign: 'left', 
              marginBottom: '20px',
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Detalles del error (solo en desarrollo)
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '12px',
                color: '#dc3545',
                marginTop: '10px'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <div>
            <button 
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Intentar de nuevo
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
