'use client';

import { useState, useEffect } from 'react';

export default function BouncingBackground() {
  const [mounted, setMounted] = useState(false);
  const [positions, setPositions] = useState([]);

  const images = [
    '/images/wizard1.png',
    '/images/wizard2.png',
    '/images/wizard3.png',
    '/images/wizard4.png',
    '/images/wizard5.png',
    '/images/wizard6.png'
  ];

  useEffect(() => {
    // Generate random positions only on client side to avoid hydration mismatch
    setPositions(images.map(() => ({
      top: `${Math.random() * 80}%`, 
      left: `${Math.random() * 80}%`,
      size: `${80 + Math.random() * 80}px`,
      duration: `${15 + Math.random() * 15}s`,
      delay: `${-Math.random() * 10}s`,
      opacity: 0.15 + Math.random() * 0.15
    })));
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        @keyframes floatAndRotate {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.2;
          }
          25% {
            transform: translate(20px, -20px) rotate(5deg);
            opacity: 0.35;
          }
          50% {
            transform: translate(-15px, 15px) rotate(-3deg);
            opacity: 0.25;
          }
          75% {
            transform: translate(15px, 10px) rotate(4deg);
            opacity: 0.3;
          }
        }
      `}</style>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.3,
          filter: 'blur(1px) brightness(0.7)',
          zIndex: 0,
          overflow: 'hidden'
        }}
      >
        {images.map((src, idx) => {
          const pos = positions[idx];
          return (
            <img
              key={idx}
              src={src}
              alt=""
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                width: pos.size,
                height: pos.size,
                objectFit: 'contain',
                opacity: pos.opacity,
                animation: `floatAndRotate ${pos.duration} ease-in-out infinite`,
                animationDelay: pos.delay
              }}
            />
          );
        })}
      </div>
    </>
  );
}
