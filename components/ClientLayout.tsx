'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Load BouncingBackground only on client side to prevent hydration issues
const BouncingBackground = dynamic(() => import('@/components/BouncingBackground'), {
  ssr: false
});

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BouncingBackground />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </>
  );
}
