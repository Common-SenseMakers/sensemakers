import { useCallback, useState } from 'react';

const DEBUG = false;

export const usePersist = <T>(
  stateName: string,
  initialValue: T | null
): [T | undefined | null, (value: T | null) => void, () => void] => {
  const name = `persist/${stateName}`;

  const getFromStorage = <T>(name: string, defaultValue?: T | null) => {
    try {
      const item = localStorage.getItem(name);
      const val = item !== null ? (JSON.parse(item) as T) : null;
      if (val === null && defaultValue === null) {
        return null;
      }

      if (val !== null) {
        return val;
      } else {
        localStorage.setItem(name, JSON.stringify(defaultValue));
      }
    } catch {
      return defaultValue;
    }
  };

  const [state, setState] = useState<T | undefined | null>(
    getFromStorage<T>(name, initialValue)
  );

  const deleteValue = useCallback(() => localStorage.removeItem(name), [name]);

  const setValue = useCallback(
    (value: T | null) => {
      if (value === null) {
        deleteValue();
        setState(undefined);
      } else {
        localStorage.setItem(name, JSON.stringify(value));
        setState(value);
      }
      if (DEBUG) console.log(`setting usePersist ${name}`, value);
    },
    [deleteValue, name]
  );

  return [state, setValue, deleteValue];
};
