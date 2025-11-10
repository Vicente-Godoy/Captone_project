// Archivo de prueba simple - Reemplaza temporalmente App.js para diagnosticar
import React from 'react';

function AppTest() {
  console.log('App.test-simple.js se está ejecutando');
  
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#007bff' }}>React está funcionando</h1>
      <p>Si ves este mensaje, React se está montando correctamente.</p>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Información del Sistema:</h2>
        <ul>
          <li>Node ENV: {process.env.NODE_ENV}</li>
          <li>React Version: {React.version}</li>
          <li>Timestamp: {new Date().toLocaleString()}</li>
        </ul>
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffc107'
      }}>
        <h3>Instrucciones:</h3>
        <p>Este es un componente de prueba. Si ves esto:</p>
        <ol>
          <li>React está funcionando correctamente</li>
          <li>El problema está en la configuración de Firebase o en algún componente</li>
          <li>Revisa la consola del navegador (F12) para ver logs adicionales</li>
        </ol>
      </div>
      
      <button 
        onClick={() => {
          console.log('Botón clickeado - React está funcionando');
          alert('¡React está funcionando correctamente!');
        }}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Probar Interactividad
      </button>
    </div>
  );
}

export default AppTest;

