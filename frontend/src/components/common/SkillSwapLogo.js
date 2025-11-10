// src/components/common/SkillSwapLogo.js
import React from 'react';

export default function SkillSwapLogo({ size = 120, color = "#EF4444" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Flecha superior derecha */}
      <path
        d="M100 40 L140 60 L120 60 L120 100 L100 100 L100 60 L80 60 Z"
        fill={color}
      />
      
      {/* Flecha inferior izquierda */}
      <path
        d="M100 160 L60 140 L80 140 L80 100 L100 100 L100 140 L120 140 Z"
        fill={color}
      />
      
      {/* Círculo central */}
      <circle
        cx="100"
        cy="100"
        r="20"
        fill={color}
      />
    </svg>
  );
}

// Logo con texto
export function SkillSwapLogoWithText({ size = 200, showText = true }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    }}>
      <SkillSwapLogo size={size} />
      {showText && (
        <h1 style={{
          margin: 0,
          fontSize: size / 4,
          color: '#EF4444',
          fontWeight: 'bold',
          letterSpacing: '-1px'
        }}>
          SkillSwap
        </h1>
      )}
    </div>
  );
}

