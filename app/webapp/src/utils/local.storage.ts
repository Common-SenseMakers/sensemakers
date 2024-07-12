import { useCallback, useState } from 'react';

const DEBUG = false;

export const usePersist = <T>(
  stateName: string,
  initialValue: T | null
): [T, (value: T | null) => void, () => void] => {
  const name = `persist/${stateName}`;

  const getFromStorage = <T>(name: string, defaultValue?: T | null) => {
    try {
      if (defaultValue === null) {
        return null;
      }
      const val = JSON.parse(localStorage.getItem(name) + '');
      if (val !== null) {
        return val;
      } else {
        localStorage.setItem(name, JSON.stringify(defaultValue));
      }
    } catch {
      return defaultValue;
    }
  };

  const [state, setState] = useState<T>(getFromStorage<T>(name, initialValue));

  const setValue = useCallback(
    (value: T | null) => {
      if (value === null) {
        deleteValue();
      } else {
        localStorage.setItem(name, JSON.stringify(value));
        setState(value);
      }
      if (DEBUG) console.log(name, value);
    },
    [name]
  );

  const deleteValue = () => localStorage.deleteItem(name);

  return [state, setValue, deleteValue];
};
