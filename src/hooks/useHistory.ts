import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useHistory = <T>(initialState: T, capacity: number = 50) => {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const setNewValue = useCallback((newValue: T) => {
    setHistory(current => {
      const { past, present } = current;
      
      if (newValue === present) {
        return current;
      }
      
      const newPast = [...past, present].slice(-capacity);
      
      return {
        past: newPast,
        present: newValue,
        future: []
      };
    });
  }, [capacity]);

  const undo = useCallback(() => {
    setHistory(current => {
      const { past, present, future } = current;
      
      if (past.length === 0) {
        return current;
      }
      
      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);
      
      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(current => {
      const { past, present, future } = current;
      
      if (future.length === 0) {
        return current;
      }
      
      const next = future[0];
      const newFuture = future.slice(1);
      
      return {
        past: [...past, present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const reset = useCallback(() => {
    setHistory({
      past: [],
      present: initialState,
      future: []
    });
  }, [initialState]);

  return {
    value: history.present,
    setValue: setNewValue,
    undo,
    redo,
    reset,
    canUndo,
    canRedo
  };
};