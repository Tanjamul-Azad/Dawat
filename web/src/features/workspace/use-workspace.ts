'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createWorkspace, workspaceSchema, type Workspace } from './model';

export function useWorkspace(key = 'dawat-studio-sandbox-v1', enabled = true) {
  const [workspace, setWorkspace] = useState<Workspace>(createWorkspace);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const current = useRef(workspace);
  const blocked = useRef(false);
  useEffect(() => {
    if (!enabled) {
      setReady(true);
      return;
    }
    function read() {
      try {
        const raw = localStorage.getItem(key);
        const saved = raw ? workspaceSchema.parse(JSON.parse(raw)) : createWorkspace();
        current.current = saved;
        setWorkspace(saved);
        blocked.current = false;
        setStorageError('');
      } catch {
        blocked.current = true;
        setStorageError(
          'Saved demo data could not be loaded. Your stored copy has not been overwritten. Reset the demo to start again.',
        );
      }
      setReady(true);
    }
    read();
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) read();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, enabled]);
  const update = useCallback(
    (transform: (current: Workspace) => Workspace) => {
      if (!enabled || blocked.current) return false;
      const next = workspaceSchema.parse(transform(current.current));
      try {
        localStorage.setItem(key, JSON.stringify(next));
        current.current = next;
        setWorkspace(next);
        setStorageError('');
        return true;
      } catch {
        setStorageError(
          'This browser could not save the demo. Your last saved data is unchanged. Please retry or allow browser storage.',
        );
        return false;
      }
    },
    [key, enabled],
  );
  const reset = useCallback(() => {
    if (!enabled) return false;
    const seed = createWorkspace();
    try {
      localStorage.setItem(key, JSON.stringify(seed));
      current.current = seed;
      blocked.current = false;
      setWorkspace(seed);
      setStorageError('');
      return true;
    } catch {
      setStorageError('Browser storage is unavailable. The demo could not be reset.');
      return false;
    }
  }, [key, enabled]);
  return { workspace, update, ready, storageError, reset };
}
