import { useSyncExternalStore } from 'react';

export function useMedia(query: string) {
  const media = matchMedia(query);
  return useSyncExternalStore(callback => { media.addEventListener('change', callback); return () => media.removeEventListener('change', callback); }, () => media.matches);
}
