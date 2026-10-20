'use client';

import { useEffect, useRef, useState } from 'react';

export const INVITATION_MUSIC = '/audio/canon-in-d-invitation.mp3';

export function useInvitationMusic(scope: string, available: boolean) {
  const audio = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<'paused' | 'loading' | 'playing' | 'blocked' | 'error'>('paused');
  const wanted = useRef(false);
  const generation = useRef(0);
  const preference = `dawat-music-${scope}`;

  function stop() {
    wanted.current = false;
    generation.current++;
    audio.current?.pause();
    setStatus('paused');
  }
  function start() {
    const element = audio.current;
    if (!element || wanted.current || document.hidden) return;
    wanted.current = true;
    const attempt = ++generation.current;
    element.volume = 0.18;
    if (!element.getAttribute('src')) element.src = INVITATION_MUSIC;
    setStatus('loading');
    try {
      Promise.resolve(element.play())
        .then(() => {
          if (attempt !== generation.current || !wanted.current || document.hidden) return;
          setStatus('playing');
        })
        .catch((error: unknown) => {
          if (attempt !== generation.current) return;
          wanted.current = false;
          setStatus(error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'error');
        });
    } catch {
      wanted.current = false;
      setStatus('error');
    }
  }
  function onOpen() {
    try {
      if (localStorage.getItem(preference) === 'off') return;
    } catch {
      /* Optional preference. */
    }
    start();
  }
  function toggle() {
    const enabled = !wanted.current;
    try {
      localStorage.setItem(preference, enabled ? 'on' : 'off');
    } catch {
      /* Optional preference. */
    }
    if (enabled) start();
    else stop();
  }
  useEffect(() => {
    const element = audio.current;
    if (!element || !available) return;
    const pause = () => {
      wanted.current = false;
      generation.current++;
      setStatus('paused');
    };
    const failure = () => {
      wanted.current = false;
      generation.current++;
      setStatus('error');
    };
    const visibility = () => {
      if (document.hidden) {
        pause();
        element.pause();
      }
    };
    element.addEventListener('pause', pause);
    element.addEventListener('error', failure);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      wanted.current = false;
      generation.current++;
      element.removeEventListener('pause', pause);
      element.removeEventListener('error', failure);
      document.removeEventListener('visibilitychange', visibility);
      element.pause();
    };
  }, [scope, available]);
  return { audio, status, onOpen, toggle };
}
