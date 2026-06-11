'use client';

import { UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

interface ClientUserButtonProps {
  appearance?: any;
  showName?: boolean;
}

export default function ClientUserButton({ appearance, showName }: ClientUserButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Match the size (w-9 h-9 rounded-xl) and border of the avatarBox style
    return (
      <div className="w-9 h-9 rounded-xl bg-terra-surface-container-high animate-pulse border border-terra-outline-variant" />
    );
  }

  return <UserButton appearance={appearance} showName={showName} />;
}
