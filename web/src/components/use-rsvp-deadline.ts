'use client';
import { useEffect, useState } from 'react';

/** Refresh the visible policy at its boundary and after a sleeping tab resumes. */
export function useRsvpDeadline(closesAt?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = closesAt ? Date.parse(closesAt) : NaN;
    function refresh() {
      clearTimeout(timer);
      const current = Date.now();
      setNow(current);
      if (deadline > current) timer = setTimeout(refresh, Math.min(deadline - current, 2_147_483_647));
    }
    refresh();
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, [closesAt]);
  return !!closesAt && Date.parse(closesAt) <= now;
}
