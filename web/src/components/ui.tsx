'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X, ArrowUpRight } from 'lucide-react';

export function Modal({
  title,
  children,
  onClose,
  closeLabel = 'Close dialog',
  className = '',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`dialog ${className}`}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <div className="dialog-heading">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" aria-label={closeLabel} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <a className={`wordmark ${light ? 'light' : ''}`} href="/" aria-label="Dawat Studio home">
      <span className="brand-symbol" aria-hidden="true">
        ✳
      </span>
      <span>
        dawat<span className="brand-period">.</span>
        <small>THE INVITATION ATELIER</small>
      </span>
    </a>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link" href={href}>
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}

export async function copyText(text: string) {
  if (!navigator.clipboard)
    throw new Error('Clipboard is unavailable. Open the invitation and copy its address instead.');
  await navigator.clipboard.writeText(text);
}
