
"use client";

type Listener = (data: any) => void;

interface Listeners {
  [key: string]: Listener[];
}

const listeners: Listeners = {};

export const errorEmitter = {
  on(event: string, listener: Listener): () => void {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(listener);

    return () => {
      this.off(event, listener);
    };
  },

  off(event: string, listener: Listener): void {
    if (listeners[event]) {
      const index = listeners[event].indexOf(listener);
      if (index > -1) {
        listeners[event].splice(index, 1);
      }
    }
  },

  emit(event: string, data: any): void {
    if (listeners[event]) {
      listeners[event].forEach(l => l(data));
    }
  }
};
