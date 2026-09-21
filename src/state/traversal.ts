import { useSyncExternalStore } from "react";

let locked = false;
const subscribers = new Set<() => void>();

function emit() {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

export function getTraversalLocked(): boolean {
  return locked;
}

export function setTraversalLocked(next: boolean) {
  if (locked === next) {
    return;
  }
  locked = next;
  emit();
}

export function subscribeTraversalLocked(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function useTraversalLocked(): boolean {
  return useSyncExternalStore(
    subscribeTraversalLocked,
    getTraversalLocked,
    getTraversalLocked,
  );
}
