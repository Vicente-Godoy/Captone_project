// src/components/common/SplashScreen.js
import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 1600;
    const steps = 80;
    const increment = 100 / steps;
    const interval = duration / steps;

    let currentProgress = 0;
    const drawInterval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(drawInterval);
      } else {
        setProgress(currentProgress);
      }
    }, interval);

    // Mostrar texto después del dibujo
    const textTimer = setTimeout(() => setShowText(true), duration + 200);
    
    // Mantener el logo completo visible por 1.5 segundos
    const fadeTimer = setTimeout(() => setFadeOut(true), duration + 1700);
    
    // Finalizar y pasar al login
    const finishTimer = setTimeout(() => onFinish && onFinish(), duration + 2200);

    return () => {
      clearInterval(drawInterval);
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const arrowProgress = Math.min(100, (progress / 80) * 100);
  const circleProgress = Math.max(0, Math.min(100, ((progress - 80) / 20) * 100));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out'
    }}>
      <div style={{
        position: 'relative',
        width: '340px',
        height: '340px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg
          width="340"
          height="340"
          viewBox="0 0 340 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 6px 24px rgba(239, 68, 68, 0.18))'
          }}
        >
          {/* CURVA SUPERIOR DE LA S - Réplica exacta */}
          <g>
            {/* Parte superior: curva de derecha hacia el centro */}
            <path
              d="M 240 95
                 C 240 65, 215 40, 170 40
                 C 125 40, 100 65, 100 95
                 C 100 120, 115 140, 140 152
                 C 155 160, 165 165, 170 170"
              stroke="#EF4444"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: 280,
                strokeDashoffset: Math.max(0, 280 - (280 * arrowProgress / 100)),
                transition: 'stroke-dashoffset 0.03s linear',
                opacity: arrowProgress > 0 ? 1 : 0
              }}
            />
            
            {/* Punta de flecha superior - Apuntando al centro */}
            <g style={{
              opacity: arrowProgress > 70 ? 1 : 0,
              transform: `scale(${Math.min(1, (arrowProgress - 70) / 30 + 0.6)})`,
              transformOrigin: '170px 170px',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <path
                d="M 155 160 L 170 180 L 180 165 Z"
                fill="#EF4444"
              />
            </g>
          </g>

          {/* CURVA INFERIOR DE LA S - Réplica exacta (simétrica) */}
          <g>
            {/* Parte inferior: curva de izquierda hacia el centro */}
            <path
              d="M 100 245
                 C 100 275, 125 300, 170 300
                 C 215 300, 240 275, 240 245
                 C 240 220, 225 200, 200 188
                 C 185 180, 175 175, 170 170"
              stroke="#EF4444"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: 280,
                strokeDashoffset: Math.max(0, 280 - (280 * arrowProgress / 100)),
                transition: 'stroke-dashoffset 0.03s linear',
                opacity: arrowProgress > 0 ? 1 : 0
              }}
            />
            
            {/* Punta de flecha inferior - Apuntando al centro */}
            <g style={{
              opacity: arrowProgress > 70 ? 1 : 0,
              transform: `scale(${Math.min(1, (arrowProgress - 70) / 30 + 0.6)})`,
              transformOrigin: '170px 170px',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <path
                d="M 185 180 L 170 160 L 160 175 Z"
                fill="#EF4444"
              />
            </g>
          </g>

          {/* CÍRCULO CENTRAL DE CONEXIÓN */}
          <g style={{
            opacity: circleProgress > 20 ? 1 : 0,
            transform: `scale(${Math.max(0, circleProgress / 100)})`,
            transformOrigin: '170px 170px',
            transition: 'all 0.2s ease-out'
          }}>
            {/* Círculo principal */}
            <circle
              cx="170"
              cy="170"
              r="18"
              fill="#EF4444"
            />
            {/* Highlight interno para profundidad */}
            <circle
              cx="170"
              cy="170"
              r="14"
              fill="#FF6B6B"
              opacity="0.5"
            />
            {/* Brillo sutil */}
            <circle
              cx="167"
              cy="167"
              r="7"
              fill="#FFFFFF"
              opacity="0.3"
            />
          </g>

          {/* Efecto de brillo expansivo al completar */}
          {circleProgress > 85 && (
            <>
              <circle
                cx="170"
                cy="170"
                r="30"
                fill="none"
                stroke="#EF4444"
                strokeWidth="3"
                opacity="0.45"
                style={{
                  animation: 'pulse-ring 0.9s ease-out'
                }}
              />
              <circle
                cx="170"
                cy="170"
                r="44"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                opacity="0.3"
                style={{
                  animation: 'pulse-ring 0.9s ease-out 0.15s'
                }}
              />
              <circle
                cx="170"
                cy="170"
                r="58"
                fill="none"
                stroke="#EF4444"
                strokeWidth="1"
                opacity="0.18"
                style={{
                  animation: 'pulse-ring 0.9s ease-out 0.3s'
                }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Texto SkillSwap */}
      <h1 style={{
        marginTop: '32px',
        fontSize: '72px',
        fontWeight: '700',
        color: '#EF4444',
        letterSpacing: '-3.8px',
        opacity: showText ? 1 : 0,
        transform: showText ? 'translateY(0) scale(1)' : 'translateY(35px) scale(0.93)',
        transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        textShadow: '0 4px 24px rgba(239, 68, 68, 0.28)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        margin: 0,
        lineHeight: 1,
        WebkitFontSmoothing: 'antialiased'
      }}>
        SkillSwap
      </h1>

      {/* Subtítulo */}
      <p style={{
        marginTop: '24px',
        fontSize: '15px',
        color: '#9CA3AF',
        fontWeight: '600',
        opacity: showText ? 0.92 : 0,
        transition: 'opacity 0.7s ease-out 0.4s',
        letterSpacing: '1.8px',
        textTransform: 'uppercase',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        Intercambia Conocimientos
      </p>

      {/* Animaciones CSS */}
      <style>
        {`
          @keyframes pulse-ring {
            0% {
              opacity: 0.45;
              transform: scale(0.95);
            }
            50% {
              opacity: 0.25;
            }
            100% {
              opacity: 0;
              transform: scale(1.8);
            }
          }
        `}
      </style>
    </div>
  );
}
