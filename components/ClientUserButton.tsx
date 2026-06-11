'use client';

import { UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

interface ClientUserButtonProps {
  appearance?: any;
  showName?: boolean;
  placeholderClassName?: string;
}

export default function ClientUserButton({ appearance, showName, placeholderClassName }: ClientUserButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (showName) {
      return (
        <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-transparent border-0">
          <div className={placeholderClassName ?? "w-7 h-7 rounded-xl bg-terra-surface-container-high animate-pulse border border-terra-outline-variant shrink-0"} />
          <div className="h-3.5 w-24 bg-terra-surface-container-high animate-pulse rounded shrink-0" />
        </div>
      );
    }
    return (
      <div className={placeholderClassName ?? "w-9 h-9 rounded-xl bg-terra-surface-container-high animate-pulse border border-terra-outline-variant"} />
    );
  }

  return <UserButton appearance={appearance} showName={showName} />;
}
