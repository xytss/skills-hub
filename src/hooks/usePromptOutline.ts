import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { flattenOutline, type OutlineEntry } from '../lib/promptDocument';

export function usePromptOutline(entries: OutlineEntry[], scrollRef: RefObject<HTMLDivElement | null>, small: boolean, tab: string, onDocument: () => void) {
  const [active, setActive] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);
  const pending = useRef<OutlineEntry | null>(null);
  const frame = useRef(0);
  const activeSection = useRef('');
  const targets = flattenOutline(entries);
  const select = useCallback((entry: OutlineEntry) => {
    setActive(entry.id);
    if (activeSection.current !== entry.section) { setExpanded([entry.section, ...entry.parents]); activeSection.current = entry.section; }
    else setExpanded(keys => entry.parents.every(parent => keys.includes(parent)) ? keys : [...new Set([...keys, ...entry.parents])]);
  }, []);
  const navigate = useCallback((id: string, history = true) => {
    const entry = targets.find(item => item.id === id);
    if (!entry) return;
    onDocument();
    requestAnimationFrame(() => {
      const root = scrollRef.current!;
      const node = document.getElementById(entry.id)!;
      const offset = small ? 76 : 20;
      const top = node.getBoundingClientRect().top + (small ? window.scrollY : root.scrollTop - root.getBoundingClientRect().top) - offset;
      pending.current = entry;
      (small ? window : root).scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      select(entry); node.focus({ preventScroll: true });
      const url = new URL(location.href);
      url.hash = id;
      if (history && url.href !== location.href) window.history.pushState(null, '', url);
    });
  }, [targets, small, onDocument, select, scrollRef]);
  useEffect(() => {
    if (!entries.length || tab !== 'document') return;
    const root = scrollRef.current!;
    const sync = () => {
      if (pending.current) { select(pending.current); return; }
      if (!document.getElementById(targets[0].id)!.getClientRects().length) return;
      const threshold = small ? 80 : root.getBoundingClientRect().top + 24;
      let entry = targets[0];
      for (const target of targets) { if (document.getElementById(target.id)!.getBoundingClientRect().top <= threshold) entry = target; else break; }
      select(entry);
    };
    const queue = () => { if (!frame.current) frame.current = requestAnimationFrame(() => { frame.current = 0; sync(); }); };
    const release = () => { pending.current = null; };
    const finish = () => { if (pending.current) { cancelAnimationFrame(frame.current); frame.current = 0; select(pending.current); release(); } };
    const key = (event: KeyboardEvent) => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) release(); };
    root.addEventListener('scroll', queue); window.addEventListener('scroll', queue); window.addEventListener('resize', queue);
    root.addEventListener('scrollend', finish); window.addEventListener('scrollend', finish);
    root.addEventListener('pointerdown', release); document.addEventListener('wheel', release, { passive: true }); document.addEventListener('touchstart', release, { passive: true }); document.addEventListener('keydown', key);
    sync();
    return () => {
      cancelAnimationFrame(frame.current); frame.current = 0;
      root.removeEventListener('scroll', queue); window.removeEventListener('scroll', queue); window.removeEventListener('resize', queue);
      root.removeEventListener('scrollend', finish); window.removeEventListener('scrollend', finish); root.removeEventListener('pointerdown', release);
      document.removeEventListener('wheel', release); document.removeEventListener('touchstart', release); document.removeEventListener('keydown', key);
    };
  }, [entries, small, tab, select, scrollRef]);
  return { active, expanded, setExpanded, navigate };
}
